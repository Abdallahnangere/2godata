import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { ensureRuntimeTables, ensureUserReferralCode, getAppConfig } from "@/lib/appRuntime";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const utf8Headers = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  try {
    await ensureRuntimeTables();
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: utf8Headers }
      );
    }

    // Get full user details from database
    const user = await queryOne<{
      id: string;
      name: string | null;
      phone: string | null;
      balance: number;
      role: string;
      isActive: boolean;
      account_number: string | null;
      bank_name: string | null;
      account_name: string | null;
      email: string | null;
      createdAt: string;
      cashbackBalance: number | string | null;
      cashbackTotalEarned: number | string | null;
      cashbackTotalRedeemed: number | string | null;
      referralCode: string | null;
      referralBalance: number | string | null;
      referralTotalEarned: number | string | null;
      referralCount: number | null;
      notificationsEnabled: boolean | null;
      soundEffectsEnabled: boolean | null;
      themePreference: string | null;
      agentApplicationStatus: string | null;
    }>(
      `SELECT id, name, email, phone, balance, role, "isActive", "account_number", "bank_name", "account_name",
              "createdAt", "cashbackBalance", "cashbackTotalEarned", "cashbackTotalRedeemed",
              "referralCode", "referralBalance", "referralTotalEarned", "referralCount",
              "notificationsEnabled", "soundEffectsEnabled", "themePreference", "agentApplicationStatus"
       FROM "User"
       WHERE id = $1`,
      [sessionUser.userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: utf8Headers }
      );
    }

    const referralCode = await ensureUserReferralCode(user.id, user.phone);
    const config = await getAppConfig();

    // Map role to tier for frontend (USER -> user, AGENT -> agent)
    const tier = (user.role || "USER").toLowerCase() as "user" | "agent" | "admin";

    return NextResponse.json({
      id: user.id,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      balance: typeof user.balance === 'number' ? user.balance : parseFloat(String(user.balance)),
      cashbackBalance: Number(user.cashbackBalance || 0),
      cashbackTotalEarned: Number(user.cashbackTotalEarned || 0),
      cashbackTotalRedeemed: Number(user.cashbackTotalRedeemed || 0),
      referralCode,
      referralBalance: Number(user.referralBalance || 0),
      referralTotalEarned: Number(user.referralTotalEarned || 0),
      referralCount: Number(user.referralCount || 0),
      joinedAt: user.createdAt,
      tier: tier,
      role: user.role,
      isActive: user.isActive,
      accountNumber: user.account_number,
      bankName: user.bank_name,
      accountName: user.account_name,
      notificationsEnabled: user.notificationsEnabled ?? config.defaultNotificationsEnabled,
      soundEffectsEnabled: user.soundEffectsEnabled ?? config.defaultSoundEffectsEnabled,
      themePreference: user.themePreference || config.defaultTheme,
      agentApplicationStatus: user.agentApplicationStatus || "NONE",
    }, { headers: utf8Headers });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500, headers: utf8Headers }
    );
  }
}
