import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, LogOut, Plus, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
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
        <Link href="/meetings/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/10 no-underline font-heading font-medium text-sm">
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

export default function NewMeeting() {
  const { isAuthenticated, loading, user } = useAuth();
  const { lang } = useLang();
  const t = useTranslations(lang).newMeeting;
  const [, navigate] = useLocation();

  const [meetingUrl, setMeetingUrl] = useState("");
  const [botName, setBotName] = useState("");
  const [botAvatarUrl, setBotAvatarUrl] = useState("");
  const [step, setStep] = useState<"form" | "deploying" | "done">("form");
  const [createdId, setCreatedId] = useState<number | null>(null);

  const createMutation = trpc.meetings.create.useMutation({
    onSuccess: async (data) => {
      setCreatedId(data.meetingId);
      setStep("deploying");
      deployMutation.mutate({ meetingId: data.meetingId });
    },
    onError: (e) => { toast.error(e.message); setStep("form"); },
  });

  const deployMutation = trpc.meetings.deployBot.useMutation({
    onSuccess: () => {
      setStep("done");
      toast.success(t.success);
    },
    onError: (e) => { toast.error(e.message); setStep("form"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl.trim()) { toast.error("Please enter a meeting URL"); return; }
    setStep("deploying");
    createMutation.mutate({
      meetingUrl: meetingUrl.trim(),
      botName: botName.trim() || user?.name || "AI Agent",
      botAvatarUrl: botAvatarUrl.trim() || undefined,
    });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="font-heading font-black text-2xl text-gray-900 mb-8">{t.title}</h1>

        <div className="max-w-lg">
          {step === "done" ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">{t.success}</h2>
              <p className="text-gray-500 text-sm mb-8">Your AI Agent is joining the meeting. Check back soon for your notes.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard" className="btn-blue px-6 py-3 rounded-xl text-sm font-heading font-bold text-white no-underline">
                  View Dashboard
                </Link>
                <button onClick={() => { setStep("form"); setMeetingUrl(""); setBotName(""); setBotAvatarUrl(""); }}
                  className="px-6 py-3 rounded-xl text-sm font-heading font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  New Meeting
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
              {/* Meeting URL */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.urlLabel} *</label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={e => setMeetingUrl(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors"
                />
                <p className="text-gray-400 text-xs mt-1">Supports Zoom and Google Meet links</p>
              </div>

              {/* Bot name */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.botNameLabel}</label>
                <input
                  type="text"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  placeholder={user?.name ?? t.botNamePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors"
                />
                <p className="text-gray-400 text-xs mt-1">The name participants will see in the meeting</p>
              </div>

              {/* Bot avatar URL */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.avatarLabel}</label>
                <input
                  type="url"
                  value={botAvatarUrl}
                  onChange={e => setBotAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors"
                />
              </div>

              {/* Preview */}
              {(botName || botAvatarUrl) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-kobis-blue/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {botAvatarUrl ? <img src={botAvatarUrl} alt="Bot" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <Bot className="w-5 h-5 text-kobis-blue" />}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-gray-900 text-sm">{botName || user?.name || "AI Agent"}</p>
                    <p className="text-gray-400 text-xs">AI Agent Preview</p>
                  </div>
                </div>
              )}

              <button type="submit" disabled={step === "deploying"}
                className="btn-gold w-full py-3.5 rounded-xl text-sm font-heading font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {step === "deploying" ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t.deploying}</>
                ) : (
                  <><Bot className="w-4 h-4" /> {t.deploy}</>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
