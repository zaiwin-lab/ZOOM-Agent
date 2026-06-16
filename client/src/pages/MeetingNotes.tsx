import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, CheckSquare, ChevronLeft, Download, LogOut, Plus, Search, Settings, Sparkles, Square, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

function Sidebar() {
  const { lang } = useLang();
  const t = useTranslations(lang);
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/") });

  return (
    <aside className="w-64 bg-hero-gradient min-h-screen flex flex-col py-6 px-4 fixed left-0 top-0 bottom-0">
      <Link href="/" className="flex flex-col mb-8 px-2 no-underline">
        <span className="font-heading font-bold text-white text-lg leading-none">Meeting Agent</span>
        <span className="font-heading font-semibold text-kobis-gold text-[10px] tracking-widest uppercase">AI MEETING ASSISTANT</span>
      </Link>
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <Bot className="w-4 h-4" /> {t.dashboard.title}
        </Link>
        <Link href="/meetings/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> {t.dashboard.newMeeting}
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <User className="w-4 h-4" /> {t.profile.title}
        </Link>
        <Link href="/subscription" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <Settings className="w-4 h-4" /> {t.subscription.title}
        </Link>
      </nav>
      <button onClick={() => logoutMutation.mutate()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 font-heading font-medium text-sm transition-colors w-full">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}

function formatMs(ms?: number | null) {
  if (!ms) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function MeetingNotes() {
  const { isAuthenticated, loading } = useAuth();
  const { lang } = useLang();
  const params = useParams<{ id: string }>();
  const meetingId = parseInt(params.id ?? "0");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "actions">("transcript");

  const { data: meeting, refetch: refetchMeeting } = trpc.meetings.get.useQuery({ id: meetingId }, { enabled: isAuthenticated && !!meetingId });
  const { data: transcripts, refetch: refetchTranscripts } = trpc.transcripts.search.useQuery({ meetingId, query: searchQuery }, { enabled: isAuthenticated && !!meetingId });
  const { data: actionItems, refetch: refetchActions } = trpc.actionItems.list.useQuery({ meetingId }, { enabled: isAuthenticated && !!meetingId });

  const processAI = trpc.meetings.processAI.useMutation({
    onSuccess: () => { toast.success("AI processing complete!"); refetchMeeting(); refetchActions(); },
    onError: (e) => toast.error(e.message),
  });

  const seedDemo = trpc.meetings.seedDemoTranscript.useMutation({
    onSuccess: () => { toast.success("Demo transcript loaded — now click Generate AI Notes."); refetchTranscripts(); refetchMeeting(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleAction = trpc.actionItems.toggle.useMutation({
    onSuccess: () => refetchActions(),
  });

  const handleExportPDF = () => {
    if (!meeting || !transcripts) return;
    const highlights = meeting.highlights ? JSON.parse(meeting.highlights) as string[] : [];
    const content = [
      `MEETING NOTES`,
      `Title: ${meeting.title ?? `Meeting #${meeting.id}`}`,
      `Date: ${new Date(meeting.createdAt).toLocaleString()}`,
      `URL: ${meeting.meetingUrl}`,
      ``,
      `SUMMARY`,
      meeting.summary ?? "Not yet generated",
      ``,
      `KEY HIGHLIGHTS`,
      ...highlights.map((h, i) => `${i + 1}. ${h}`),
      ``,
      `ACTION ITEMS`,
      ...(actionItems ?? []).map((a, i) => `${i + 1}. [${a.isCompleted ? "x" : " "}] ${a.content}`),
      ``,
      `FULL TRANSCRIPT`,
      ...(transcripts ?? []).map(t => `[${formatMs(t.timestampMs)}] ${t.speakerName ?? "Speaker"}: ${t.content}`),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-notes-${meeting.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported!");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  const highlights = meeting?.highlights ? JSON.parse(meeting.highlights) as string[] : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-heading font-medium text-sm no-underline transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="font-heading font-black text-xl text-gray-900">{meeting?.title ?? `Meeting #${meetingId}`}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(!transcripts || transcripts.length === 0) && (
              <button onClick={() => seedDemo.mutate({ meetingId })} disabled={seedDemo.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-kobis-blue/40 text-kobis-blue font-heading font-semibold text-sm hover:bg-kobis-blue/5 transition-colors disabled:opacity-60">
                <Sparkles className="w-4 h-4" />
                {seedDemo.isPending ? "Loading…" : "Load demo transcript"}
              </button>
            )}
            {!meeting?.summary && (
              <button onClick={() => processAI.mutate({ meetingId })} disabled={processAI.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-kobis-gold text-white font-heading font-semibold text-sm hover:bg-kobis-gold/90 transition-colors disabled:opacity-60">
                <Sparkles className="w-4 h-4" />
                {processAI.isPending ? "Processing..." : "Generate AI Notes"}
              </button>
            )}
            <button onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-heading font-semibold text-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 w-fit shadow-sm">
          {(["transcript", "summary", "actions"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-heading font-semibold transition-all capitalize ${activeTab === tab ? "bg-kobis-blue text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
              {tab === "actions" ? "Action Items" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Transcript tab */}
        {activeTab === "transcript" && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search transcript..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors bg-white"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {!transcripts || transcripts.length === 0 ? (
                <div className="py-16 text-center text-gray-400 font-heading font-medium">
                  {searchQuery ? "No results found" : "No transcript available yet"}
                </div>
              ) : (
                transcripts.map((t) => (
                  <div key={t.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-baseline gap-3">
                      <span className="text-kobis-blue font-heading font-bold text-xs w-12 flex-shrink-0">{formatMs(t.timestampMs)}</span>
                      <span className="text-kobis-gold font-heading font-semibold text-sm w-28 flex-shrink-0">{t.speakerName ?? "Speaker"}</span>
                      <span className="text-gray-700 text-sm leading-relaxed">{t.content}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Summary tab */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-heading font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-kobis-gold" /> Executive Summary
              </h3>
              {meeting?.summary ? (
                <p className="text-gray-700 leading-relaxed">{meeting.summary}</p>
              ) : (
                <p className="text-gray-400 italic">No summary generated yet. Click "Generate AI Notes" to process.</p>
              )}
            </div>
            {highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-heading font-bold text-gray-900 text-lg mb-4">Key Highlights</h3>
                <ul className="space-y-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-kobis-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-kobis-gold font-heading font-bold text-xs">{i + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{h}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action items tab */}
        {activeTab === "actions" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {!actionItems || actionItems.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-heading font-medium">
                No action items yet. Generate AI notes to extract them.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {actionItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <button onClick={() => toggleAction.mutate({ id: item.id, isCompleted: !item.isCompleted })}
                      className="mt-0.5 flex-shrink-0 text-kobis-blue hover:text-kobis-blue/70 transition-colors">
                      {item.isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <p className={`text-sm leading-relaxed ${item.isCompleted ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {item.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
