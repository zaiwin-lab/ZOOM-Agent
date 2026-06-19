import * as db from "../db";

export type PaidPlan = "monthly" | "annual" | "pay_per_use";

/**
 * Grant a subscription/credits to a user. Single source of truth used by both
 * the payment callback (after verified payment) and the no-gateway fallback.
 */
export async function grantSubscription(userId: number, plan: PaidPlan, promoCode?: string) {
  const now = new Date();
  let endDate: Date | undefined;
  let credits = 0;

  if (plan === "monthly") endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  else if (plan === "annual") endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  else if (plan === "pay_per_use") credits = 1;

  await db.upsertSubscription({
    userId,
    plan,
    status: "active",
    promoCode,
    startDate: now,
    endDate,
    meetingCredits: credits,
  });

  // Mirror onto the user row + mark trial used.
  const dbInstance = await db.getDb();
  if (dbInstance) {
    const { users } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await dbInstance
      .update(users)
      .set({
        freeTrialUsed: true,
        subscriptionPlan: plan,
        subscriptionStatus: "active",
        promoCodeUsed: promoCode,
      })
      .where(eq(users.id, userId));
  }
}
