import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables, ensureUserReferralCode } from "@/lib/appRuntime";
import { query, queryOne } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();
  const user = await queryOne<any>(
    `SELECT phone, "referralCode", "referralBalance", "referralTotalEarned", "referralCount"
     FROM "User" WHERE id = $1`,
    [sessionUser.userId]
  );

  const referralCode = await ensureUserReferralCode(sessionUser.userId, user?.phone);
  const recent = await query<any>(
    `SELECT amount, "createdAt", "refereeUserId", "sourceType"
     FROM "UserRewardLedger"
     WHERE "userId" = $1 AND "entryType" = 'REFERRAL_EARN'
     ORDER BY "createdAt" DESC
     LIMIT 10`,
    [sessionUser.userId]
  );

  return NextResponse.json(
    {
      referralCode,
      referralBalance: Number(user?.referralBalance || 0),
      referralTotalEarned: Number(user?.referralTotalEarned || 0),
      referralCount: Number(user?.referralCount || 0),
      recent,
    },
    { headers: jsonHeaders }
  );
}
