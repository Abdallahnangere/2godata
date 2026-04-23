import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureRuntimeTables, getAppConfig } from "@/lib/appRuntime";
import { execute } from "@/lib/db";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }
  const config = await getAppConfig();
  return NextResponse.json({ settings: config }, { headers: jsonHeaders });
}

export async function PUT(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  }

  await ensureRuntimeTables();
  const body = await request.json();
  const payload = {
    supportEmail: String(body.supportEmail || "").trim(),
    supportPhonePrimary: String(body.supportPhonePrimary || "").trim(),
    supportPhoneSecondary: body.supportPhoneSecondary ? String(body.supportPhoneSecondary).trim() : null,
    whatsappNumber: String(body.whatsappNumber || "").trim(),
    whatsappMessage: String(body.whatsappMessage || "").trim(),
    cashbackRate: Number(body.cashbackRate ?? 2),
    referralRate: Number(body.referralRate ?? 2),
    cashbackEnabled: Boolean(body.cashbackEnabled ?? true),
    referralEnabled: Boolean(body.referralEnabled ?? true),
    defaultNotificationsEnabled: Boolean(body.defaultNotificationsEnabled ?? true),
    defaultSoundEffectsEnabled: Boolean(body.defaultSoundEffectsEnabled ?? true),
    defaultTheme: ["light", "dark", "system"].includes(String(body.defaultTheme))
      ? String(body.defaultTheme)
      : "light",
    aboutText: String(body.aboutText || "").trim(),
    helpText: String(body.helpText || "").trim(),
  };

  await execute(
    `UPDATE "AppConfig"
     SET "supportEmail" = $1,
         "supportPhonePrimary" = $2,
         "supportPhoneSecondary" = $3,
         "whatsappNumber" = $4,
         "whatsappMessage" = $5,
         "cashbackRate" = $6,
         "referralRate" = $7,
         "cashbackEnabled" = $8,
         "referralEnabled" = $9,
         "defaultNotificationsEnabled" = $10,
         "defaultSoundEffectsEnabled" = $11,
         "defaultTheme" = $12,
         "aboutText" = $13,
         "helpText" = $14,
         "updatedAt" = NOW()
     WHERE id = 'default'`,
    [
      payload.supportEmail,
      payload.supportPhonePrimary,
      payload.supportPhoneSecondary,
      payload.whatsappNumber,
      payload.whatsappMessage,
      payload.cashbackRate,
      payload.referralRate,
      payload.cashbackEnabled,
      payload.referralEnabled,
      payload.defaultNotificationsEnabled,
      payload.defaultSoundEffectsEnabled,
      payload.defaultTheme,
      payload.aboutText,
      payload.helpText,
    ]
  );

  return NextResponse.json({ success: true, settings: await getAppConfig() }, { headers: jsonHeaders });
}
