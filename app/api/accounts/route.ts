import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const utf8Headers = { "Content-Type": "application/json; charset=utf-8" };

type ReservedAccountRow = {
  id: string;
  providerReference: string | null;
  accountNumber: string;
  accountName: string | null;
  bankName: string | null;
  bankId: string;
  isPrimary: boolean;
  createdAt: string;
};

type UserPrimaryAccountRow = {
  id: string;
  flutterwave_tx_ref: string | null;
  account_number: string | null;
  account_name: string | null;
  bank_name: string | null;
  bank_id: string | null;
  flutterwave_created_at: string | null;
};

const normalizeAccounts = (
  accounts: ReservedAccountRow[],
  fallbackUser?: UserPrimaryAccountRow | null
) => {
  const normalized = [...accounts];

  if (
    fallbackUser?.account_number &&
    fallbackUser.bank_id &&
    !normalized.some((account) => account.accountNumber === fallbackUser.account_number)
  ) {
    normalized.unshift({
      id: "primary-user-account",
      providerReference: fallbackUser.flutterwave_tx_ref,
      accountNumber: fallbackUser.account_number,
      accountName: fallbackUser.account_name,
      bankName: fallbackUser.bank_name,
      bankId: fallbackUser.bank_id,
      isPrimary: true,
      createdAt: fallbackUser.flutterwave_created_at || new Date().toISOString(),
    });
  }

  return normalized.sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

const getUserPrimaryAccount = async (userId: string) =>
  queryOne<UserPrimaryAccountRow>(
    `SELECT id, "flutterwave_tx_ref", "account_number", "account_name", "bank_name", "bank_id", "flutterwave_created_at"
     FROM "User"
     WHERE id = $1`,
    [userId]
  );

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: utf8Headers }
      );
    }

    const accounts = await query<ReservedAccountRow>(
      `SELECT id, "providerReference", "accountNumber", "accountName", "bankName", "bankId", "isPrimary", "createdAt"
       FROM "UserReservedAccount"
       WHERE "userId" = $1
       ORDER BY "isPrimary" DESC, "createdAt" ASC`,
      [sessionUser.userId]
    );

    const user = await getUserPrimaryAccount(sessionUser.userId);
    const normalizedAccounts = normalizeAccounts(accounts, user);

    return NextResponse.json({ accounts: normalizedAccounts }, { headers: utf8Headers });
  } catch (error) {
    console.error("Get accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500, headers: utf8Headers }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Flutterwave creates one permanent account per user. Extra accounts are disabled." },
    { status: 405, headers: utf8Headers }
  );
}
