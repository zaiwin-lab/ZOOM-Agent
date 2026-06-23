import { ENV } from "./env";

export type TranscriptItem = { speaker: string; content: string; timestampMs: number };

/**
 * Fetch the authoritative transcript for a bot directly from MeetingBaaS and
 * normalize it. Robust to field-name variants (words[].word vs .text, or a
 * flat text/transcription field) so spoken content is never dropped.
 */
export async function fetchBaasTranscript(botId: string): Promise<TranscriptItem[]> {
  const key = ENV.meetingBaasApiKey;
  if (!key || !botId) return [];
  try {
    const r = await fetch(`https://api.meetingbaas.com/bots/${encodeURIComponent(botId)}`, {
      headers: { "x-meeting-baas-api-key": key },
    });
    if (!r.ok) return [];
    const data: any = await r.json();
    const segments: any[] =
      data?.bot_data?.transcripts ?? data?.transcripts ?? data?.transcript ?? [];
    if (!Array.isArray(segments)) return [];

    return segments
      .map((seg: any): TranscriptItem => {
        const words = Array.isArray(seg?.words)
          ? seg.words
              .map((w: any) => (typeof w === "string" ? w : (w?.word ?? w?.text ?? "")))
              .join(" ")
          : "";
        const content = String(words || seg?.text || seg?.transcription || "").trim();
        const start = Number(seg?.start ?? seg?.offset ?? seg?.words?.[0]?.start) || 0;
        return {
          speaker: String(seg?.speaker ?? "Speaker").slice(0, 128),
          content: content.slice(0, 10000),
          timestampMs: Math.round(start * 1000),
        };
      })
      .filter((s) => s.content.length > 0);
  } catch (e) {
    console.error("[MeetingBaaS] fetch transcript failed:", e);
    return [];
  }
}
