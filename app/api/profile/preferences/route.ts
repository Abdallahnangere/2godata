import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables } from "@/lib/appRuntime";
import { execute } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function PATCH(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();
  const body = await request.json();
  const notificationsEnabled = body.notificationsEnabled !== false;
  const soundEffectsEnabled = body.soundEffectsEnabled !== false;
  const themePreference = ["light", "dark", "system"].includes(String(body.themePreference))
    ? String(body.themePreference)
    : "system";

  await execute(
    `UPDATE "User"
     SET "notificationsEnabled" = $1,
         "soundEffectsEnabled" = $2,
         "themePreference" = $3
     WHERE id = $4`,
    [notificationsEnabled, soundEffectsEnabled, themePreference, sessionUser.userId]
  );

  return NextResponse.json({ success: true }, { headers: jsonHeaders });
}
