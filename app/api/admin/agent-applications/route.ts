import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables } from "@/lib/appRuntime";
import { query } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();

  const applications = await query<any>(
    `SELECT aa.id, aa.message, aa.status, aa."reviewNote", aa."createdAt", aa."reviewedAt",
            u.id as "userId", u.name, u.email, u.phone
     FROM "AgentApplication" aa
     JOIN "User" u ON u.id = aa."userId"
     ORDER BY
       CASE aa.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END,
       aa."createdAt" DESC`
  );

  return NextResponse.json({ applications }, { headers: jsonHeaders });
}
