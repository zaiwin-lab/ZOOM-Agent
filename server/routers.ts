import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";
import { billplzConfigured, createBill, planAmountCents } from "./_core/billplz";
import { grantSubscription } from "./_core/entitlements";
import * as db from "./db";

const PROMO_CODE = "blabla";
const FREE_MEETING_LIMIT = 3;

/**
 * Entitlement check: may this user start a new meeting?
 * Admins always; active subscription always; pay-per-use credits; otherwise a
 * small free allowance. Throws FORBIDDEN when the limit is reached.
 */
async function assertCanCreateMeeting(user: { id: number; role: string }) {
  if (user.role === "admin") return;
  const sub = await db.getSubscriptionByUser(user.id);
  const activeSub =
    sub && sub.status === "active" && (!sub.endDate || new Date(sub.endDate) > new Date());
  const hasCredits = !!sub && (sub.meetingCredits ?? 0) > 0;
  if (activeSub || hasCredits) return;

  const existing = await db.getMeetingsByUser(user.id);
  if (existing.length >= FREE_MEETING_LIMIT) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You've used your ${FREE_MEETING_LIMIT} free meetings. Please subscribe to continue.`,
    });
  }
}

/** Detect meeting platform from the URL host (Zoom / Google Meet / Teams). */
function detectPlatform(url: string): "zoom" | "google_meet" | "other" {
  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); } catch { host = url.toLowerCase(); }
  if (host.includes("zoom.us") || host.includes("zoom.com")) return "zoom";
  if (host.includes("meet.google.com")) return "google_meet";
  return "other";
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // Standalone email login for self-hosted / MVP deployments (no Manus OAuth).
    // Upserts the user and issues the same signed session cookie the app verifies.
    emailLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().max(128).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const email = input.email.trim().toLowerCase();
        const openId = `email:${email}`;
        await db.upsertUser({
          openId,
          email,
          name: input.name?.trim() || email.split("@")[0],
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        const token = await sdk.createSessionToken(openId, {
          name: input.name?.trim() || email.split("@")[0],
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true };
      }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      return user ?? ctx.user;
    }),
    update: protectedProcedure
      .input(z.object({ displayName: z.string().max(128).optional(), avatarUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    uploadAvatar: protectedProcedure
      .input(z.object({
        // Cap at ~2.7MB base64 (~2MB binary). SVG is intentionally excluded
        // because it can carry active/script content (stored-XSS risk).
        base64: z.string().max(2_800_000),
        mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        if (buffer.length > 2 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Image too large (max 2MB)." });
        }
        const ext = input.mimeType.split("/")[1].replace("jpeg", "jpg");
        const key = `avatars/${ctx.user.id}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.updateUserProfile(ctx.user.id, { avatarUrl: url });
        return { url };
      }),
  }),

  meetings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getMeetingsByUser(ctx.user.id);
    }),
    // MVP/demo helper: inject a sample transcript so the AI pipeline can be
    // tested without a live meeting bot. Owner-checked.
    seedDemoTranscript: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        const existing = await db.getTranscriptsByMeeting(meeting.id);
        if (existing.length === 0) {
          await db.createTranscripts([
            { meetingId: meeting.id, speakerName: "Sarah Lim", content: "Let's lock the Q3 launch date before we wrap.", timestampMs: 1000 },
            { meetingId: meeting.id, speakerName: "David Tan", content: "Marketing needs two weeks lead time for assets.", timestampMs: 8000 },
            { meetingId: meeting.id, speakerName: "Aisha R.", content: "I'll own the rollout checklist and share it by Friday.", timestampMs: 15000 },
            { meetingId: meeting.id, speakerName: "Sarah Lim", content: "Agreed. Target the 18th, soft launch internally first.", timestampMs: 22000 },
          ]);
        }
        await db.updateMeeting(meeting.id, { status: "processing" });
        return { success: true };
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.id);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return meeting;
      }),
    create: protectedProcedure
      .input(z.object({
        meetingUrl: z.string().url(),
        botName: z.string().max(128).optional(),
        botAvatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await assertCanCreateMeeting(ctx.user);
        const platform = detectPlatform(input.meetingUrl);
        const result = await db.createMeeting({
          userId: ctx.user.id,
          meetingUrl: input.meetingUrl,
          platform: platform as any,
          botName: input.botName ?? ctx.user.name ?? "AI Agent",
          botAvatarUrl: input.botAvatarUrl,
          status: "pending",
        });
        return { success: true, meetingId: (result as any).insertId };
      }),
    deployBot: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        // Guard against double-deploy (prevents duplicate bots / double charges).
        if (meeting.baasJobId || ["joining", "in_progress", "processing", "completed"].includes(meeting.status)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "A bot has already been deployed for this meeting." });
        }

        // MeetingBaaS API integration
        const baasApiKey = ENV.meetingBaasApiKey || process.env.MEETINGBAAS_API_KEY;
        if (baasApiKey) {
          // Tell MeetingBaaS where to post status + transcript, guarded by our secret.
          const webhookUrl = ENV.appUrl
            ? `${ENV.appUrl.replace(/\/+$/, "")}/api/webhook/meetingbaas${ENV.webhookSecret ? `?secret=${encodeURIComponent(ENV.webhookSecret)}` : ""}`
            : undefined;
          let resp: Response;
          try {
            resp = await fetch("https://api.meetingbaas.com/bots", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-meeting-baas-api-key": baasApiKey },
              body: JSON.stringify({
                meeting_url: meeting.meetingUrl,
                bot_name: meeting.botName ?? "AI Agent",
                bot_image: meeting.botAvatarUrl ?? undefined,
                reserved: false,
                speech_to_text: { provider: "Default" },
                ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
              }),
            });
          } catch (e) {
            console.error("[MeetingBaaS] Network error:", e);
            await db.updateMeeting(meeting.id, { status: "failed" });
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reach MeetingBaaS API. Check your network connection." });
          }
          if (resp.ok) {
            const data = await resp.json() as { bot_id?: string };
            await db.updateMeeting(meeting.id, { status: "joining", baasJobId: data.bot_id });
            return { success: true, baasJobId: data.bot_id };
          } else {
            const errText = await resp.text().catch(() => "");
            console.error(`[MeetingBaaS] API error ${resp.status}:`, errText);
            await db.updateMeeting(meeting.id, { status: "failed" });
            if (resp.status === 401 || resp.status === 403) {
              throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid MeetingBaaS API key. Please check your credentials." });
            }
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `MeetingBaaS API returned ${resp.status}. ${errText}` });
          }
        }

        // No API key configured — mark as demo mode
        await db.updateMeeting(meeting.id, { status: "joining" });
        return { success: true, demo: true };
      }),
    processAI: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });

        const transcriptRows = await db.getTranscriptsByMeeting(meeting.id);
        if (transcriptRows.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No transcript available" });

        const fullText = transcriptRows.map(t => `${t.speakerName ?? "Speaker"}: ${t.content}`).join("\n");

        const [summaryRes, actionRes] = await Promise.all([
          invokeLLM({
            messages: [
              { role: "system", content: "You are an expert meeting summariser. Return a concise executive summary and 3-5 key highlights as JSON: {summary: string, highlights: string[]}" },
              { role: "user", content: `Meeting transcript:\n${fullText}` },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "meeting_summary",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    highlights: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "highlights"],
                  additionalProperties: false,
                },
              },
            },
          }),
          invokeLLM({
            messages: [
              { role: "system", content: "Extract action items from this meeting transcript. Return JSON: {action_items: string[]}" },
              { role: "user", content: `Meeting transcript:\n${fullText}` },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "action_items",
                strict: true,
                schema: {
                  type: "object",
                  properties: { action_items: { type: "array", items: { type: "string" } } },
                  required: ["action_items"],
                  additionalProperties: false,
                },
              },
            },
          }),
        ]);

        const safeParse = (raw: unknown, fallback: any) => {
          try { return JSON.parse((raw as string) ?? ""); }
          catch { return fallback; }
        };
        const summaryData = safeParse(summaryRes.choices?.[0]?.message?.content, { summary: "", highlights: [] });
        const actionData = safeParse(actionRes.choices?.[0]?.message?.content, { action_items: [] });
        if (!summaryData.summary && (!summaryData.highlights || summaryData.highlights.length === 0)) {
          await db.updateMeeting(meeting.id, { status: "failed" });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI could not generate notes. Please retry." });
        }
        summaryData.highlights = summaryData.highlights ?? [];
        actionData.action_items = actionData.action_items ?? [];

        await db.updateMeeting(meeting.id, {
          summary: summaryData.summary,
          highlights: JSON.stringify(summaryData.highlights),
          status: "completed",
        });

        const existingItems = await db.getActionItemsByMeeting(meeting.id);
        if (existingItems.length === 0 && actionData.action_items.length > 0) {
          await db.createActionItems(
            actionData.action_items.map((content: string) => ({ meetingId: meeting.id, content }))
          );
        }

        // Notify owner that AI processing is complete (fire-and-forget)
        notifyOwner({
          title: "✅ Meeting Notes Ready — Meeting Agent",
          content: `AI processing completed for a meeting.\n\n**Meeting ID:** ${meeting.id}\n**URL:** ${meeting.meetingUrl}\n**Platform:** ${meeting.platform}\n**Summary preview:** ${summaryData.summary.slice(0, 200)}${summaryData.summary.length > 200 ? "..." : ""}\n**Action items:** ${actionData.action_items.length}\n**Time:** ${new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })} (MYT)`,
        }).catch(err => console.warn("[Notification] Meeting complete notify failed:", err));

        return { success: true };
      }),
  }),

  transcripts: router({
    list: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return db.getTranscriptsByMeeting(input.meetingId);
      }),
    search: protectedProcedure
      .input(z.object({ meetingId: z.number(), query: z.string() }))
      .query(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        const all = await db.getTranscriptsByMeeting(input.meetingId);
        if (!input.query.trim()) return all;
        const q = input.query.toLowerCase();
        return all.filter(t => t.content.toLowerCase().includes(q) || (t.speakerName ?? "").toLowerCase().includes(q));
      }),
  }),

  actionItems: router({
    list: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const meeting = await db.getMeetingById(input.meetingId);
        if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return db.getActionItemsByMeeting(input.meetingId);
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isCompleted: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        // Ownership check: the item's meeting must belong to the caller.
        const item = await db.getActionItemById(input.id);
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        const meeting = await db.getMeetingById(item.meetingId);
        if (!meeting || (meeting.userId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.toggleActionItem(input.id, input.isCompleted);
        return { success: true };
      }),
  }),

  subscription: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getSubscriptionByUser(ctx.user.id);
    }),
    activate: protectedProcedure
      .input(z.object({ plan: z.enum(["monthly", "annual", "pay_per_use"]), promoCode: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const isPromo = input.promoCode?.toLowerCase() === PROMO_CODE;

        // When a payment gateway is configured (and it isn't a promo override),
        // send the user to Billplz to pay; entitlement is granted only by the
        // verified payment callback — never for free from the client.
        if (billplzConfigured() && !isPromo) {
          if (!ENV.appUrl) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payment is not fully configured (missing app URL)." });
          }
          const base = ENV.appUrl.replace(/\/+$/, "");
          const bill = await createBill({
            email: ctx.user.email ?? `user-${ctx.user.id}@meeting-agent.local`,
            name: ctx.user.displayName || ctx.user.name || "Meeting Agent user",
            amountCents: planAmountCents(input.plan),
            description: `Meeting Agent — ${input.plan} plan`,
            callbackUrl: `${base}/api/webhook/billplz${ENV.webhookSecret ? `?secret=${encodeURIComponent(ENV.webhookSecret)}` : ""}`,
            redirectUrl: `${base}/subscription?status=processing`,
            reference: `${ctx.user.id}:${input.plan}`,
          });
          return { success: true, paymentUrl: bill.url };
        }

        // No gateway configured (or promo): grant directly (dev / demo behaviour).
        await grantSubscription(ctx.user.id, input.plan, input.promoCode);
        return { success: true };
      }),
    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      await db.upsertSubscription({
        userId: ctx.user.id,
        plan: "free",
        status: "cancelled",
        startDate: new Date(),
        meetingCredits: 0,
      });
      return { success: true };
    }),
  }),

  admin: router({
    stats: adminProcedure.query(async () => {
      const [allUsers, allMeetings, allSubs] = await Promise.all([
        db.getAllUsers(),
        db.getAllMeetings(),
        db.getAllSubscriptions(),
      ]);
      return {
        totalUsers: allUsers.length,
        totalMeetings: allMeetings.length,
        activeSubscriptions: allSubs.filter(s => s.status === "active").length,
        users: allUsers,
        meetings: allMeetings,
        subscriptions: allSubs,
      };
    }),
    promoteUser: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
