import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/appRuntime";

export async function GET() {
  const settings = await getAppConfig();
  return NextResponse.json(
    {
      supportEmail: settings.supportEmail,
      supportPhonePrimary: settings.supportPhonePrimary,
      supportPhoneSecondary: settings.supportPhoneSecondary,
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      cashbackRate: settings.cashbackRate,
      referralRate: settings.referralRate,
      aboutText: settings.aboutText,
      helpText: settings.helpText,
      defaultTheme: settings.defaultTheme,
      defaultNotificationsEnabled: settings.defaultNotificationsEnabled,
      defaultSoundEffectsEnabled: settings.defaultSoundEffectsEnabled,
    },
    { headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}
