import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, LogOut, Plus, Settings, Shield, User, Users } from "lucide-react";
import { Link, useLocation } from "wouter";

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
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/10 no-underline font-heading font-medium text-sm">
          <Shield className="w-4 h-4" /> Admin
        </Link>
      </nav>
      <button onClick={() => logoutMutation.mutate()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 font-heading font-medium text-sm transition-colors w-full">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}

export default function Admin() {
  const { isAuthenticated, loading, user } = useAuth();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const users = stats?.users;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }
  if (user?.role !== "admin") return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need admin privileges to access this page.</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-kobis-blue" />
          <h1 className="font-heading font-black text-2xl text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "blue" },
            { label: "Total Meetings", value: stats?.totalMeetings ?? 0, icon: Bot, color: "gold" },
            { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: Settings, color: "emerald" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color === "blue" ? "bg-kobis-blue/10" : s.color === "gold" ? "bg-kobis-gold/10" : "bg-emerald-100"}`}>
                  <Icon className={`w-5 h-5 ${s.color === "blue" ? "text-kobis-blue" : s.color === "gold" ? "text-kobis-gold" : "text-emerald-600"}`} />
                </div>
                <p className="text-gray-500 text-xs font-heading font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="font-heading font-black text-3xl text-gray-900">{s.value.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-bold text-gray-900 text-lg">All Users</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="text-left px-6 py-3 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Meetings</th>
                <th className="text-left px-6 py-3 text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!users || users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-heading font-medium">No users found</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-heading font-semibold text-gray-900 text-sm">{u.name ?? "—"}</div>
                      <div className="text-gray-400 text-xs">{u.email ?? "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold ${u.role === "admin" ? "bg-kobis-blue/10 text-kobis-blue" : "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.subscriptionPlan !== "free" ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold ${u.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {u.subscriptionPlan} · {u.subscriptionStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">—</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
