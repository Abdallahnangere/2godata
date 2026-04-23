import { execute, query, queryOne } from "@/lib/db";

export type AppConfigRecord = {
  supportEmail: string;
  supportPhonePrimary: string;
  supportPhoneSecondary: string | null;
  whatsappNumber: string;
  whatsappMessage: string;
  cashbackRate: number;
  referralRate: number;
  cashbackEnabled: boolean;
  referralEnabled: boolean;
  defaultNotificationsEnabled: boolean;
  defaultSoundEffectsEnabled: boolean;
  defaultTheme: "light" | "dark" | "system";
  aboutText: string;
  helpText: string;
};

export const DEFAULT_APP_CONFIG: AppConfigRecord = {
  supportEmail: "support@2godata.com",
  supportPhonePrimary: "09000000000",
  supportPhoneSecondary: null,
  whatsappNumber: "2349000000000",
  whatsappMessage: "Hello 2GO DATA, I need support.",
  cashbackRate: 2,
  referralRate: 2,
  cashbackEnabled: true,
  referralEnabled: true,
  defaultNotificationsEnabled: true,
  defaultSoundEffectsEnabled: true,
  defaultTheme: "light",
  aboutText: "2GO DATA helps you buy data, airtime, cable, and electricity from one wallet.",
  helpText: "Need help? Reach us by email, phone, or WhatsApp.",
};

let runtimeReady = false;

const ddlStatements = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" VARCHAR(64)`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByUserId" TEXT REFERENCES "User"(id) ON DELETE SET NULL`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cashbackBalance" NUMERIC(15, 2) NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cashbackTotalEarned" NUMERIC(15, 2) NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cashbackTotalRedeemed" NUMERIC(15, 2) NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralBalance" NUMERIC(15, 2) NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralTotalEarned" NUMERIC(15, 2) NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "soundEffectsEnabled" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "themePreference" VARCHAR(16) NOT NULL DEFAULT 'system'`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingAnnouncementsEnabled" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agentApplicationStatus" VARCHAR(16) NOT NULL DEFAULT 'NONE'`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agentAppliedAt" TIMESTAMPTZ`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agentReviewedAt" TIMESTAMPTZ`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smsNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsappNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode") WHERE "referralCode" IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS "User_referredByUserId_idx" ON "User"("referredByUserId")`,
  `CREATE TABLE IF NOT EXISTS "AppConfig" (
      id TEXT PRIMARY KEY,
      "supportEmail" TEXT NOT NULL,
      "supportPhonePrimary" TEXT NOT NULL,
      "supportPhoneSecondary" TEXT,
      "whatsappNumber" TEXT NOT NULL,
      "whatsappMessage" TEXT NOT NULL,
      "cashbackRate" NUMERIC(8, 2) NOT NULL DEFAULT 2,
      "referralRate" NUMERIC(8, 2) NOT NULL DEFAULT 2,
      "cashbackEnabled" BOOLEAN NOT NULL DEFAULT true,
      "referralEnabled" BOOLEAN NOT NULL DEFAULT true,
      "defaultNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
      "defaultSoundEffectsEnabled" BOOLEAN NOT NULL DEFAULT true,
      "defaultTheme" VARCHAR(16) NOT NULL DEFAULT 'light',
      "aboutText" TEXT NOT NULL DEFAULT '',
      "helpText" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE TABLE IF NOT EXISTS "AgentApplication" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
      message TEXT,
      status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
      "reviewNote" TEXT,
      "reviewedBy" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
      "reviewedAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE INDEX IF NOT EXISTS "AgentApplication_status_createdAt_idx" ON "AgentApplication"(status, "createdAt" DESC)`,
  `CREATE TABLE IF NOT EXISTS "UserRewardLedger" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "refereeUserId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
      "sourceType" VARCHAR(32) NOT NULL,
      "sourceId" TEXT NOT NULL,
      "entryType" VARCHAR(32) NOT NULL,
      "baseAmount" NUMERIC(15, 2) NOT NULL DEFAULT 0,
      rate NUMERIC(8, 2) NOT NULL DEFAULT 0,
      amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      metadata JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "UserRewardLedger_entry_unique"
    ON "UserRewardLedger"("userId", "sourceType", "sourceId", "entryType")`,
  `CREATE INDEX IF NOT EXISTS "UserRewardLedger_user_createdAt_idx" ON "UserRewardLedger"("userId", "createdAt" DESC)`,
];

export async function ensureRuntimeTables() {
  if (runtimeReady) return;

  for (const statement of ddlStatements) {
    await execute(statement);
  }

  await execute(
    `INSERT INTO "AppConfig"
      (id, "supportEmail", "supportPhonePrimary", "supportPhoneSecondary", "whatsappNumber", "whatsappMessage",
       "cashbackRate", "referralRate", "cashbackEnabled", "referralEnabled",
       "defaultNotificationsEnabled", "defaultSoundEffectsEnabled", "defaultTheme", "aboutText", "helpText")
     VALUES
      ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (id) DO NOTHING`,
    [
      DEFAULT_APP_CONFIG.supportEmail,
      DEFAULT_APP_CONFIG.supportPhonePrimary,
      DEFAULT_APP_CONFIG.supportPhoneSecondary,
      DEFAULT_APP_CONFIG.whatsappNumber,
      DEFAULT_APP_CONFIG.whatsappMessage,
      DEFAULT_APP_CONFIG.cashbackRate,
      DEFAULT_APP_CONFIG.referralRate,
      DEFAULT_APP_CONFIG.cashbackEnabled,
      DEFAULT_APP_CONFIG.referralEnabled,
      DEFAULT_APP_CONFIG.defaultNotificationsEnabled,
      DEFAULT_APP_CONFIG.defaultSoundEffectsEnabled,
      DEFAULT_APP_CONFIG.defaultTheme,
      DEFAULT_APP_CONFIG.aboutText,
      DEFAULT_APP_CONFIG.helpText,
    ]
  );

  const users = await query<{ id: string; phone: string | null }>(
    `SELECT id, phone FROM "User" WHERE "referralCode" IS NULL OR "referralCode" = ''`
  );
  for (const user of users) {
    const code = buildReferralCode(user.id, user.phone);
    await execute(
      `UPDATE "User" SET "referralCode" = $1 WHERE id = $2 AND ("referralCode" IS NULL OR "referralCode" = '')`,
      [code, user.id]
    );
  }

  runtimeReady = true;
}

function buildReferralCode(userId: string, phone?: string | null) {
  const base = (phone || userId).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `2GO${base.slice(-6)}`;
}

export async function getAppConfig(): Promise<AppConfigRecord> {
  await ensureRuntimeTables();
  const row = await queryOne<any>(`SELECT * FROM "AppConfig" WHERE id = 'default'`);
  return normalizeAppConfig(row);
}

export function normalizeAppConfig(row: any): AppConfigRecord {
  return {
    supportEmail: row?.supportEmail || DEFAULT_APP_CONFIG.supportEmail,
    supportPhonePrimary: row?.supportPhonePrimary || DEFAULT_APP_CONFIG.supportPhonePrimary,
    supportPhoneSecondary: row?.supportPhoneSecondary || DEFAULT_APP_CONFIG.supportPhoneSecondary,
    whatsappNumber: row?.whatsappNumber || DEFAULT_APP_CONFIG.whatsappNumber,
    whatsappMessage: row?.whatsappMessage || DEFAULT_APP_CONFIG.whatsappMessage,
    cashbackRate: Number(row?.cashbackRate ?? DEFAULT_APP_CONFIG.cashbackRate),
    referralRate: Number(row?.referralRate ?? DEFAULT_APP_CONFIG.referralRate),
    cashbackEnabled: row?.cashbackEnabled ?? DEFAULT_APP_CONFIG.cashbackEnabled,
    referralEnabled: row?.referralEnabled ?? DEFAULT_APP_CONFIG.referralEnabled,
    defaultNotificationsEnabled:
      row?.defaultNotificationsEnabled ?? DEFAULT_APP_CONFIG.defaultNotificationsEnabled,
    defaultSoundEffectsEnabled:
      row?.defaultSoundEffectsEnabled ?? DEFAULT_APP_CONFIG.defaultSoundEffectsEnabled,
    defaultTheme: row?.defaultTheme || DEFAULT_APP_CONFIG.defaultTheme,
    aboutText: row?.aboutText || DEFAULT_APP_CONFIG.aboutText,
    helpText: row?.helpText || DEFAULT_APP_CONFIG.helpText,
  };
}

export async function ensureUserReferralCode(userId: string, phone?: string | null) {
  await ensureRuntimeTables();
  const existing = await queryOne<{ referralCode: string | null }>(
    `SELECT "referralCode" FROM "User" WHERE id = $1`,
    [userId]
  );
  if (existing?.referralCode) return existing.referralCode;
  const code = buildReferralCode(userId, phone);
  await execute(`UPDATE "User" SET "referralCode" = $1 WHERE id = $2`, [code, userId]);
  return code;
}

export async function awardRewardsForPurchase(input: {
  userId: string;
  sourceType: "data" | "airtime" | "cable" | "power";
  sourceId: string;
  amount: number;
}) {
  await ensureRuntimeTables();
  const config = await getAppConfig();
  const user = await queryOne<{
    referredByUserId: string | null;
  }>(`SELECT "referredByUserId" FROM "User" WHERE id = $1`, [input.userId]);

  if (config.cashbackEnabled && config.cashbackRate > 0) {
    const cashbackAmount = Number(((input.amount * config.cashbackRate) / 100).toFixed(2));
    if (cashbackAmount > 0) {
      const existingCashback = await queryOne(
        `SELECT id FROM "UserRewardLedger"
         WHERE "userId" = $1 AND "sourceType" = $2 AND "sourceId" = $3 AND "entryType" = 'CASHBACK_EARN'`,
        [input.userId, input.sourceType, input.sourceId]
      );
      if (!existingCashback) {
        await execute(
          `INSERT INTO "UserRewardLedger"
            ("userId", "sourceType", "sourceId", "entryType", "baseAmount", rate, amount, metadata)
           VALUES ($1, $2, $3, 'CASHBACK_EARN', $4, $5, $6, $7::jsonb)`,
          [
            input.userId,
            input.sourceType,
            input.sourceId,
            input.amount,
            config.cashbackRate,
            cashbackAmount,
            JSON.stringify({ reason: "purchase_cashback" }),
          ]
        );
        await execute(
          `UPDATE "User"
           SET "cashbackBalance" = "cashbackBalance" + $1,
               "cashbackTotalEarned" = "cashbackTotalEarned" + $1
           WHERE id = $2`,
          [cashbackAmount, input.userId]
        );
      }
    }
  }

  if (config.referralEnabled && config.referralRate > 0 && user?.referredByUserId) {
    const referralAmount = Number(((input.amount * config.referralRate) / 100).toFixed(2));
    if (referralAmount > 0) {
      const existingReferral = await queryOne(
        `SELECT id FROM "UserRewardLedger"
         WHERE "userId" = $1 AND "refereeUserId" = $2 AND "sourceType" = $3 AND "sourceId" = $4 AND "entryType" = 'REFERRAL_EARN'`,
        [user.referredByUserId, input.userId, input.sourceType, input.sourceId]
      );
      if (!existingReferral) {
        await execute(
          `INSERT INTO "UserRewardLedger"
            ("userId", "refereeUserId", "sourceType", "sourceId", "entryType", "baseAmount", rate, amount, metadata)
           VALUES ($1, $2, $3, $4, 'REFERRAL_EARN', $5, $6, $7, $8::jsonb)`,
          [
            user.referredByUserId,
            input.userId,
            input.sourceType,
            input.sourceId,
            input.amount,
            config.referralRate,
            referralAmount,
            JSON.stringify({ reason: "referral_purchase_reward" }),
          ]
        );
        await execute(
          `UPDATE "User"
           SET "referralBalance" = "referralBalance" + $1,
               "referralTotalEarned" = "referralTotalEarned" + $1
           WHERE id = $2`,
          [referralAmount, user.referredByUserId]
        );
      }
    }
  }
}

export async function redeemCashback(input: {
  userId: string;
  sourceType: string;
  sourceId: string;
  amount: number;
}) {
  await ensureRuntimeTables();
  if (input.amount <= 0) return 0;

  const user = await queryOne<{ cashbackBalance: number }>(
    `SELECT "cashbackBalance" FROM "User" WHERE id = $1`,
    [input.userId]
  );
  const available = Number(user?.cashbackBalance || 0);
  const redeemAmount = Math.min(available, input.amount);
  if (redeemAmount <= 0) return 0;

  await execute(
    `INSERT INTO "UserRewardLedger"
      ("userId", "sourceType", "sourceId", "entryType", "baseAmount", rate, amount, metadata)
     VALUES ($1, $2, $3, 'CASHBACK_REDEEM', $4, 0, $4, $5::jsonb)
     ON CONFLICT ("userId", "sourceType", "sourceId", "entryType") DO NOTHING`,
    [input.userId, input.sourceType, input.sourceId, redeemAmount, JSON.stringify({ reason: "cashback_redeem" })]
  );
  await execute(
    `UPDATE "User"
     SET "cashbackBalance" = GREATEST("cashbackBalance" - $1, 0),
         "cashbackTotalRedeemed" = "cashbackTotalRedeemed" + $1
     WHERE id = $2`,
    [redeemAmount, input.userId]
  );
  return redeemAmount;
}

export async function reverseCashbackRedemption(input: {
  userId: string;
  sourceType: string;
  sourceId: string;
  amount: number;
}) {
  await ensureRuntimeTables();
  if (input.amount <= 0) return;
  await execute(
    `INSERT INTO "UserRewardLedger"
      ("userId", "sourceType", "sourceId", "entryType", "baseAmount", rate, amount, metadata)
     VALUES ($1, $2, $3, 'CASHBACK_REDEEM_REVERSAL', $4, 0, $4, $5::jsonb)
     ON CONFLICT ("userId", "sourceType", "sourceId", "entryType") DO NOTHING`,
    [input.userId, input.sourceType, input.sourceId, input.amount, JSON.stringify({ reason: "cashback_reversal" })]
  );
  await execute(
    `UPDATE "User"
     SET "cashbackBalance" = "cashbackBalance" + $1,
         "cashbackTotalRedeemed" = GREATEST("cashbackTotalRedeemed" - $1, 0)
     WHERE id = $2`,
    [input.amount, input.userId]
  );
}
