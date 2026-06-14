import type { Express } from "express";
import * as db from "./db";

export function registerWebhookRoutes(app: Express) {
  // MeetingBaaS webhook endpoint
  app.post("/api/webhook/meetingbaas", async (req, res) => {
    try {
      const payload = req.body;
      const { event, data } = payload;

      if (!data?.bot_id) {
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
        // Transcript data from MeetingBaaS
        const transcriptData = data.transcript ?? [];
        if (transcriptData.length > 0) {
          const items = transcriptData.map((t: any) => ({
            meetingId: meeting.id,
            speakerName: t.speaker ?? "Unknown",
            content: t.words?.map((w: any) => w.text).join(" ") ?? t.text ?? "",
            timestampMs: Math.round((t.start ?? 0) * 1000),
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
