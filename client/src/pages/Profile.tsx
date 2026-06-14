import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, LogOut, Plus, Settings, User } from "lucide-react";
import { useState, useRef } from "react";
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
        <Link href="/meetings/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> {t.dashboard.newMeeting}
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/10 no-underline font-heading font-medium text-sm">
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

export default function Profile() {
  const { isAuthenticated, loading, user } = useAuth();
  const { lang } = useLang();
  const t = useTranslations(lang).profile;
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success(t.saved);
      utils.profile.get.invalidate();
      setSaving(false);
    },
    onError: () => { setSaving(false); toast.error("Failed to save"); },
  });

  const uploadMutation = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      setAvatarPreview(data.url);
      utils.profile.get.invalidate();
      toast.success("Avatar updated!");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      uploadMutation.mutate({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    updateMutation.mutate({ displayName: displayName || profile?.displayName || undefined });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  const currentAvatar = avatarPreview ?? profile?.avatarUrl;
  const currentName = displayName || profile?.displayName || user?.name || "";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="font-heading font-black text-2xl text-gray-900 mb-8">{t.title}</h1>

        <div className="max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-kobis-blue/10 border-4 border-kobis-blue/20 overflow-hidden flex items-center justify-center">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-kobis-blue/50" />
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-kobis-blue text-white flex items-center justify-center shadow-md hover:bg-kobis-blue/90 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-gray-400 text-xs mt-2">{t.avatar}</p>
          </div>

          {/* Display name */}
          <div className="mb-5">
            <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.displayName}</label>
            <input
              type="text"
              value={currentName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={user?.name ?? "Your name"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div className="mb-8">
            <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.email}</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed"
            />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-blue w-full py-3 rounded-xl text-sm font-heading font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "Saving..." : t.save}
          </button>
        </div>
      </main>
    </div>
  );
}
