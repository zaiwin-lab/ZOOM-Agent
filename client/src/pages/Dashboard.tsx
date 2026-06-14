import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, Calendar, Clock, FileText, LogOut, Plus, Settings, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

function formatDuration(seconds?: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    joining: "bg-blue-100 text-blue-700",
    in_progress: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };
  const { lang } = useLang();
  const t = useTranslations(lang).dashboard.status;
  const label = t[status as keyof typeof t] ?? status;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

function Sidebar() {
  const { lang } = useLang();
  const t = useTranslations(lang);
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => navigate("/"),
  });

  return (
    <aside className="w-64 bg-hero-gradient min-h-screen flex flex-col py-6 px-4 fixed left-0 top-0 bottom-0">
      {/* Logo */}
      <Link href="/" className="flex flex-col mb-8 px-2 no-underline">
        <span className="font-heading font-bold text-white text-lg leading-none">Meeting Agent</span>
        <span className="font-heading font-semibold text-kobis-gold text-[10px] tracking-widest uppercase">AI MEETING ASSISTANT</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/10 no-underline font-heading font-medium text-sm">
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

      {/* Logout */}
      <button onClick={() => logoutMutation.mutate()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 font-heading font-medium text-sm transition-colors w-full">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const { lang } = useLang();
  const t = useTranslations(lang).dashboard;
  const [, navigate] = useLocation();

  const { data: meetings, isLoading } = trpc.meetings.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-black text-2xl text-gray-900">{t.title}</h1>
          <Link href="/meetings/new" className="btn-blue px-5 py-2.5 rounded-xl text-sm font-heading font-bold text-white no-underline flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t.newMeeting}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-heading font-medium text-lg mb-6">{t.noMeetings}</p>
            <Link href="/meetings/new" className="btn-gold px-6 py-3 rounded-xl text-sm font-heading font-bold text-white no-underline">
              {t.newMeeting}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">{t.columns.title}</th>
                  <th className="text-left px-6 py-4 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">{t.columns.status}</th>
                  <th className="text-left px-6 py-4 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">{t.columns.date}</th>
                  <th className="text-left px-6 py-4 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">{t.columns.duration}</th>
                  <th className="text-left px-6 py-4 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">{t.columns.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-heading font-semibold text-gray-900 text-sm">{m.title ?? `Meeting #${m.id}`}</div>
                      <div className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{m.meetingUrl}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDuration(m.durationSeconds)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.status === "completed" ? (
                        <Link href={`/meetings/${m.id}`} className="flex items-center gap-1.5 text-kobis-blue font-heading font-semibold text-sm hover:underline no-underline">
                          <FileText className="w-3.5 h-3.5" /> {t.viewNotes}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
