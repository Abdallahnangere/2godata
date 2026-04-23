import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables } from "@/lib/appRuntime";
import { queryOne } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();
  const user = await queryOne<any>(
    `SELECT role, "agentApplicationStatus" FROM "User" WHERE id = $1`,
    [sessionUser.userId]
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404, headers: jsonHeaders });
  }

  const sales = await queryOne<any>(
    `SELECT
       COALESCE(SUM(amount), 0) as total_sales,
       COUNT(*) as total_transactions
     FROM "DataTransaction"
     WHERE "userId" = $1 AND status = 'SUCCESS'`,
    [sessionUser.userId]
  );

  return NextResponse.json(
    {
      role: user.role,
      agentApplicationStatus: user.agentApplicationStatus,
      analytics: {
        totalSales: Number(sales?.total_sales || 0),
        totalTransactions: Number(sales?.total_transactions || 0),
      },
      offers: [
        "Agent price applies automatically on eligible data plans.",
        "Keep your referral code active to earn from your network.",
      ],
    },
    { headers: jsonHeaders }
  );
}
