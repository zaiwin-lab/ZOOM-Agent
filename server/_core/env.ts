export const ENV = {
  appId: process.env.VITE_APP_ID || "meeting-agent",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  meetingBaasApiKey: process.env.MEETINGBAAS_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
  // Public base URL of this app — used to build the webhook callback the bot
  // provider posts transcripts to. Railway injects RAILWAY_PUBLIC_DOMAIN.
  appUrl:
    process.env.APP_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : ""),
  // Shared secret guarding the webhook endpoint. Falls back to JWT_SECRET.
  webhookSecret: process.env.WEBHOOK_SECRET || process.env.JWT_SECRET || "",
  // Billplz (Malaysia payment gateway: FPX / DuitNow / cards).
  billplzApiKey: process.env.BILLPLZ_API_KEY ?? "",
  billplzCollectionId: process.env.BILLPLZ_COLLECTION_ID ?? "",
  billplzSandbox: process.env.BILLPLZ_SANDBOX === "true",
};
