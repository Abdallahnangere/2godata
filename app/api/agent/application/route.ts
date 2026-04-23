import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables } from "@/lib/appRuntime";
import { execute, queryOne } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }
  await ensureRuntimeTables();
  const application = await queryOne<any>(
    `SELECT id, message, status, "reviewNote", "createdAt", "reviewedAt"
     FROM "AgentApplication"
     WHERE "userId" = $1`,
    [sessionUser.userId]
  );
  return NextResponse.json({ application }, { headers: jsonHeaders });
}

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }
  await ensureRuntimeTables();

  const existing = await queryOne(`SELECT id, status FROM "AgentApplication" WHERE "userId" = $1`, [
    sessionUser.userId,
  ]);
  if (existing && existing.status === "PENDING") {
    return NextResponse.json({ error: "Application already pending" }, { status: 409, headers: jsonHeaders });
  }

  const body = await request.json();
  const message = body.message ? String(body.message).trim() : null;

  await execute(
    `INSERT INTO "AgentApplication" ("userId", message, status)
     VALUES ($1, $2, 'PENDING')
     ON CONFLICT ("userId")
     DO UPDATE SET message = EXCLUDED.message, status = 'PENDING', "updatedAt" = NOW(), "createdAt" = NOW(), "reviewNote" = NULL, "reviewedBy" = NULL, "reviewedAt" = NULL`,
    [sessionUser.userId, message]
  );
  await execute(
    `UPDATE "User"
     SET "agentApplicationStatus" = 'PENDING', "agentAppliedAt" = NOW()
     WHERE id = $1`,
    [sessionUser.userId]
  );

  return NextResponse.json({ success: true }, { headers: jsonHeaders });
}
