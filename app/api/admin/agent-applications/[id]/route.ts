import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables } from "@/lib/appRuntime";
import { execute, queryOne } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status || "").toUpperCase();
  const reviewNote = body.reviewNote ? String(body.reviewNote).trim() : null;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: jsonHeaders });
  }

  const application = await queryOne<{ userId: string }>(
    `SELECT "userId" FROM "AgentApplication" WHERE id = $1`,
    [id]
  );
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404, headers: jsonHeaders });
  }

  await execute(
    `UPDATE "AgentApplication"
     SET status = $1, "reviewNote" = $2, "reviewedBy" = $3, "reviewedAt" = NOW(), "updatedAt" = NOW()
     WHERE id = $4`,
    [status, reviewNote, sessionUser.userId, id]
  );

  await execute(
    `UPDATE "User"
     SET "agentApplicationStatus" = $1::varchar,
         role = CASE WHEN $2 = 'APPROVED' THEN 'AGENT' ELSE role END,
         "agentReviewedAt" = NOW()
     WHERE id = $3`,
    [status, status, application.userId]
  );

  return NextResponse.json({ success: true }, { headers: jsonHeaders });
}
