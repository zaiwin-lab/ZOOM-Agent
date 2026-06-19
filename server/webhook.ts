import type { Express } from "express";
import * as db from "./db";
import { ENV } from "./_core/env";
import { getBill } from "./_core/billplz";
import { grantSubscription, type PaidPlan } from "./_core/entitlements";

const MAX_TRANSCRIPT_ITEMS = 5000;

export function registerWebhookRoutes(app: Express) {
  // Billplz payment callback. We re-fetch the bill from Billplz (source of
  // truth) and only grant the plan when it reports paid === true.
  app.post("/api/webhook/billplz", async (req, res) => {
    try {
      if (ENV.webhookSecret) {
        const provided = typeof req.query.secret === "string" ? req.query.secret : "";
        if (provided !== ENV.webhookSecret) return res.status(401).json({ error: "Unauthorized" });
      }
      const billId: string | undefined = req.body?.billplz?.id || req.body?.id;
      if (!billId) return res.status(400).json({ error: "Missing bill id" });

      const bill = await getBill(billId);
      if (bill.paid && bill.reference_1) {
        const [userIdStr, plan] = String(bill.reference_1).split(":");
        const userId = Number(userIdStr);
        const validPlans: PaidPlan[] = ["monthly", "annual", "pay_per_use"];
        if (userId && validPlans.includes(plan as PaidPlan)) {
          await grantSubscription(userId, plan as PaidPlan);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[Billplz] callback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // MeetingBaaS webhook endpoint.
  // Authenticated via a shared secret in the query string (?secret=...), which
  // we embed in the webhook_url when deploying a bot. Rejects anonymous callers.
  app.post("/api/webhook/meetingbaas", async (req, res) => {
    try {
      if (ENV.webhookSecret) {
        const provided = typeof req.query.secret === "string" ? req.query.secret : "";
        if (provided !== ENV.webhookSecret) {
          return res.status(401).json({ error: "Unauthorized webhook" });
        }
      }

      const payload = req.body ?? {};
      const { event, data } = payload;

      if (!data?.bot_id || typeof data.bot_id !== "string") {
        return res.status(400).json({ error: "Missing bot_id" });
      }

      const meeting = await db.getMeetingByBaasJobId(data.bot_id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      if (event === "bot.status_change") {
        const status = data.status?.code;
        let meetingStatus: "joining" | "in_progress" | "processing" | "completed" | "failed" = "joining";
        if (status === "in_call_recording") meetingStatus = "in_progress";
        else if (status === "call_ended") meetingStatus = "processing";
        else if (status === "done") meetingStatus = "completed";
        else if (status === "error") meetingStatus = "failed";

        await db.updateMeeting(meeting.id, { status: meetingStatus });
      }

      if (event === "complete" && data.mp4) {
        const transcriptData = Array.isArray(data.transcript) ? data.transcript : [];
        if (transcriptData.length > 0) {
          const items = transcriptData
            .slice(0, MAX_TRANSCRIPT_ITEMS)
            .map((t: any) => ({
              meetingId: meeting.id,
              speakerName: String(t.speaker ?? "Unknown").slice(0, 128),
              content: String(
                t.words?.map((w: any) => w.text).join(" ") ?? t.text ?? "",
              ).slice(0, 10000),
              timestampMs: Math.round((Number(t.start) || 0) * 1000),
            }));
          await db.createTranscripts(items);
        }
        await db.updateMeeting(meeting.id, {
          status: "completed",
          endedAt: new Date(),
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Webhook] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
