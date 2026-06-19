import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Bot, Check, LogOut, Plus, Settings, User } from "lucide-react";
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
        <Link href="/meetings/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> {t.dashboard.newMeeting}
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 no-underline font-heading font-medium text-sm transition-colors">
          <User className="w-4 h-4" /> {t.profile.title}
        </Link>
        <Link href="/subscription" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/10 no-underline font-heading font-medium text-sm">
          <Settings className="w-4 h-4" /> {t.subscription.title}
        </Link>
      </nav>
      <button onClick={() => logoutMutation.mutate()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 font-heading font-medium text-sm transition-colors w-full">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </aside>
  );
}

const PLANS = [
  {
    id: "monthly" as const,
    label: "MONTHLY",
    price: "RM 50",
    period: "/month",
    desc: "Unlimited meetings. Billed monthly.",
    features: ["Unlimited meetings", "Real-time transcription", "AI summaries & action items", "PDF & text export", "Priority support"],
    color: "navy",
  },
  {
    id: "annual" as const,
    label: "ANNUAL",
    badge: "✦ Best Value ✦",
    price: "RM 300",
    period: "/year",
    originalPrice: "RM 600/year",
    desc: "Save RM 300 vs monthly billing.",
    features: ["Everything in Monthly", "Save 50% vs monthly", "Annual receipt for claims", "Dedicated support", "Early access"],
    color: "gold",
  },
  {
    id: "pay_per_use" as const,
    label: "PAY PER USE",
    price: "RM 10",
    period: "/meeting",
    desc: "No subscription. Pay only when you use it.",
    features: ["No monthly commitment", "Full AI Agent features", "Transcription & summary", "Export notes", "Top up anytime"],
    color: "navy-light",
  },
];

export default function Subscription() {
  const { isAuthenticated, loading } = useAuth();
  const { lang } = useLang();
  const t = useTranslations(lang).subscription;
  const utils = trpc.useUtils();

  const { data: subscription, refetch } = trpc.subscription.get.useQuery(undefined, { enabled: isAuthenticated });
  const [promoCode, setPromoCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | "pay_per_use">("monthly");
  const [activating, setActivating] = useState(false);

  const activateMutation = trpc.subscription.activate.useMutation({
    onSuccess: (res) => {
      // If a payment gateway is configured, the server returns a payment URL —
      // send the user there to pay. Otherwise it's granted directly.
      if (res && (res as { paymentUrl?: string }).paymentUrl) {
        window.location.href = (res as { paymentUrl: string }).paymentUrl;
        return;
      }
      toast.success("Subscription activated!");
      refetch();
      setActivating(false);
    },
    onError: (e) => { toast.error(e.message); setActivating(false); },
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => { toast.success("Subscription cancelled"); refetch(); },
  });

  const handleActivate = (plan: "monthly" | "annual" | "pay_per_use") => {
    setActivating(true);
    activateMutation.mutate({ plan, promoCode: promoCode.trim() || undefined });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-kobis-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  const isActive = subscription?.status === "active";
  const currentPlan = subscription?.plan;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="font-heading font-black text-2xl text-gray-900 mb-2">{t.title}</h1>

        {/* Current plan status */}
        {subscription && (
          <div className="mb-8 p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.currentPlan}</p>
              <p className="font-heading font-bold text-gray-900 capitalize">{currentPlan?.replace("_", " ") ?? "Free"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Status: <span className={`font-semibold ${isActive ? "text-emerald-600" : "text-gray-500"}`}>{subscription.status}</span></p>
            </div>
            {isActive && (
              <button onClick={() => cancelMutation.mutate()}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-500 font-heading font-semibold text-sm hover:bg-red-50 transition-colors">
                {t.cancel}
              </button>
            )}
          </div>
        )}

        {/* Free trial banner */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kobis-gold text-white font-heading font-semibold text-sm">
            🎉 First month FREE — No credit card required for free trial
          </div>
        </div>

        {/* Promo code */}
        <div className="mb-8 max-w-sm">
          <label className="block text-sm font-heading font-semibold text-gray-700 mb-2">{t.promoCode}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              placeholder={t.promoPlaceholder}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kobis-blue/30 focus:border-kobis-blue transition-colors"
            />
          </div>
          {promoCode.toLowerCase() === "blabla" && (
            <p className="text-emerald-600 text-xs font-heading font-semibold mt-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Valid tester code! Enjoy free access.
            </p>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`rounded-2xl p-6 flex flex-col relative ${plan.color === "gold" ? "bg-kobis-gold" : plan.color === "navy-light" ? "bg-cta-gradient border border-white/10" : "bg-hero-gradient"}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white rounded-full text-kobis-gold font-heading font-bold text-xs whitespace-nowrap shadow">
                  {plan.badge}
                </div>
              )}
              <p className={`font-heading font-bold text-xs tracking-widest uppercase mb-3 ${plan.color === "gold" ? "text-white/80" : "text-kobis-gold"}`}>{plan.label}</p>
              <div className="mb-1">
                <span className={`font-heading font-black text-4xl ${plan.color === "gold" ? "text-white" : "text-white"}`}>{plan.price}</span>
                <span className={`text-base ${plan.color === "gold" ? "text-white/70" : "text-gray-400"}`}>{plan.period}</span>
              </div>
              {plan.originalPrice && <p className={`text-sm line-through mb-1 ${plan.color === "gold" ? "text-white/60" : "text-gray-500"}`}>{plan.originalPrice}</p>}
              <p className={`text-sm mb-4 ${plan.color === "gold" ? "text-white/80" : "text-gray-400"}`}>{plan.desc}</p>
              <ul className="space-y-1.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${plan.color === "gold" ? "text-white" : "text-gray-300"}`}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {currentPlan === plan.id && isActive ? (
                <div className={`py-2.5 rounded-xl text-center text-sm font-heading font-bold ${plan.color === "gold" ? "bg-white/20 text-white" : "bg-white/10 text-white"}`}>
                  ✓ Current Plan
                </div>
              ) : (
                <button onClick={() => handleActivate(plan.id)} disabled={activating}
                  className={`py-2.5 rounded-xl text-sm font-heading font-bold transition-colors disabled:opacity-60 ${plan.color === "gold" ? "bg-white text-kobis-gold hover:bg-white/90" : "btn-blue text-white"}`}>
                  {activating ? "Activating..." : t.activate}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm mt-6">Then from RM 10/meeting or RM 50/month. Cancel anytime.</p>
      </main>
    </div>
  );
}
