import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations, LANGUAGE_LABELS, LANGUAGE_NAMES, type Language } from "@/lib/i18n";
import {
  Bot, Brain, Clock, Download, Globe, Mic, Search, Zap, FileText, Users,
  Menu, X, ChevronDown, ArrowRight, Check, CheckCircle2, Sparkles, Circle,
  Landmark, Server, Palette, ShieldCheck, Receipt, BadgeCheck,
} from "lucide-react";

/** Contact address for enterprise / white-label enquiries (change to your sales inbox). */
const ENTERPRISE_EMAIL = "zaiwin@gmail.com";
const ENTERPRISE_MAILTO = `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(
  "Meeting Agent — Enterprise / White-label enquiry",
)}`;

type EntCopy = {
  navLabel: string;
  label: string;
  title: string;
  statement: string;
  models: { title: string; desc: string }[];
  points: string[];
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
};

const ENTERPRISE_COPY: Record<Language, EntCopy> = {
  en: {
    navLabel: "Enterprise",
    label: "For Government & Enterprise",
    title: "Run Meeting Agent as your own in-house system",
    statement:
      "Meeting Agent is aligned with Malaysia's digital economy agenda — built for data sovereignty, ready for LHDN e-invoicing, and claimable under SME digitalisation grants. We deploy it as in-house, white-label software that keeps national data on national soil.",
    models: [
      { title: "Team Licence", desc: "Per-seat annual licensing with SSO, onboarding and training for your whole organisation." },
      { title: "White-label", desc: "Your brand, your domain. We host and run it; your customers see only you." },
      { title: "On-premise", desc: "Deployed on your own servers. Your meeting data never leaves your walls — built for government and GLC compliance." },
    ],
    points: ["Data stays in Malaysia", "LHDN e-invoicing ready", "SME grant-claimable"],
    ctaTitle: "Buying for your organisation?",
    ctaDesc: "Talk to us about enterprise licensing, white-label, or an on-premise deployment.",
    ctaButton: "Talk to us",
  },
  bm: {
    navLabel: "Korporat",
    label: "Untuk Kerajaan & Korporat",
    title: "Gunakan Meeting Agent sebagai sistem dalaman anda sendiri",
    statement:
      "Meeting Agent sejajar dengan agenda ekonomi digital Malaysia — dibina untuk kedaulatan data, sedia untuk e-invois LHDN, dan boleh dituntut di bawah geran pendigitalan PKS. Kami menyediakannya sebagai perisian dalaman berjenama sendiri yang memastikan data negara kekal di tanah air.",
    models: [
      { title: "Lesen Pasukan", desc: "Pelesenan tahunan setiap pengguna dengan SSO, onboarding dan latihan untuk seluruh organisasi anda." },
      { title: "White-label", desc: "Jenama anda, domain anda. Kami hos dan jalankan; pelanggan anda nampak anda sahaja." },
      { title: "On-premise", desc: "Dipasang pada pelayan anda sendiri. Data mesyuarat anda tidak pernah keluar — dibina untuk pematuhan kerajaan dan GLC." },
    ],
    points: ["Data kekal di Malaysia", "Sedia e-invois LHDN", "Boleh tuntut geran PKS"],
    ctaTitle: "Membeli untuk organisasi anda?",
    ctaDesc: "Hubungi kami tentang pelesenan korporat, white-label, atau pemasangan on-premise.",
    ctaButton: "Hubungi kami",
  },
  zh: {
    navLabel: "企业方案",
    label: "面向政府与企业",
    title: "将 Meeting Agent 部署为您自己的内部系统",
    statement:
      "Meeting Agent 契合马来西亚数字经济议程——专为数据主权打造，支持 LHDN 电子发票，并可通过中小企业数字化补助金申领。我们以白标内部软件形式部署，确保国家数据留在本国境内。",
    models: [
      { title: "团队授权", desc: "按席位年度授权，含单点登录、入职引导与全员培训。" },
      { title: "白标方案", desc: "您的品牌，您的域名。由我们托管运行，客户只看到您。" },
      { title: "本地部署", desc: "部署在您自己的服务器上。会议数据绝不外流——专为政府与 GLC 合规而建。" },
    ],
    points: ["数据留在马来西亚", "支持 LHDN 电子发票", "可申领中小企业补助金"],
    ctaTitle: "为您的机构采购？",
    ctaDesc: "联系我们了解企业授权、白标或本地部署方案。",
    ctaButton: "联系我们",
  },
  iban: {
    navLabel: "Korporat",
    label: "Ke Perintah & Korporat",
    title: "Guna Meeting Agent nyadi sistem dalam nuan empu",
    statement:
      "Meeting Agent nyukung agenda ekonomi digital Malaysia — digaga ke kedaulatan data, sedia ke e-invois LHDN, lalu ulih dituntut ba baruh geran pendigitalan PKS. Kami masang iya nyadi software berjenama nuan empu ti ngaga data menua tetap ba menua kitai.",
    models: [
      { title: "Lesen Raban", desc: "Lesen taunan tiap pengguna enggau SSO, onboarding enggau latih ke semua organisasi nuan." },
      { title: "White-label", desc: "Jenama nuan, domain nuan. Kami hos lalu jalankan; pelanggan nuan meda nuan aja." },
      { title: "On-premise", desc: "Dipasang ba server nuan empu. Data mesyuarat nuan nadai kala pansut — digaga ke pematuhan perintah enggau GLC." },
    ],
    points: ["Data tetap ba Malaysia", "Sedia e-invois LHDN", "Ulih tuntut geran PKS"],
    ctaTitle: "Meli ke organisasi nuan?",
    ctaDesc: "Kontak kami pasal lesen korporat, white-label, tauka pasang on-premise.",
    ctaButton: "Kontak kami",
  },
};
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const LANGUAGES: Language[] = ["en", "bm", "zh", "iban"];

/* ── Shared motion ─────────────────────────────────────────────── */
const EASE = [0.23, 1, 0.32, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.08 },
  }),
};

/** Section wrapper that reveals children once, with a staggered lift. */
function Reveal({
  children,
  className,
  id,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div id={id} className={className}>{children}</div>;
  }
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={rise}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/* ── Navbar ────────────────────────────────────────────────────── */
function Navbar() {
  const { lang, setLang } = useLang();
  const t = useTranslations(lang);
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(14%_0.05_260_/_0.82)] backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254), oklch(32% 0.12 256))", boxShadow: "0 2px 14px oklch(48% 0.16 254 / 0.5)" }}>
            <Bot className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-heading font-extrabold text-white text-[15px] leading-none tracking-tight">Meeting Agent</span>
            <span className="font-heading font-semibold text-[9px] tracking-[0.18em] uppercase leading-none mt-1" style={{ color: "oklch(76% 0.13 67)" }}>AI Meeting Assistant</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {[
            { label: t.nav.features, href: "#features" },
            { label: t.nav.howItWorks, href: "#how-it-works" },
            { label: t.nav.pricing, href: "#pricing" },
            { label: ENTERPRISE_COPY[lang].navLabel, href: "#enterprise" },
          ].map((link) => (
            <a key={link.href} href={link.href}
              className="font-heading font-medium text-sm text-slate-300 hover:text-white transition-colors duration-150 relative group/link whitespace-nowrap">
              {link.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-[oklch(76%_0.13_67)] group-hover/link:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLangOpen(false), 150)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-sm font-heading font-medium text-slate-300 hover:border-white/30 hover:text-white transition-all duration-150">
              <Globe className="w-3.5 h-3.5" />
              {LANGUAGE_LABELS[lang]}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 rounded-xl py-1.5 min-w-[176px] z-50 mockup-surface">
                {LANGUAGES.map((l) => (
                  <button key={l} onMouseDown={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-heading font-medium transition-colors flex items-center justify-between ${
                      lang === l ? "text-white" : "text-slate-400 hover:text-white"
                    }`}>
                    {LANGUAGE_NAMES[l]}
                    {lang === l && <Check className="w-3.5 h-3.5" style={{ color: "oklch(76% 0.13 67)" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-gold px-4 py-2 rounded-lg text-sm no-underline flex items-center gap-1.5">
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()} className="font-heading font-medium text-sm text-slate-300 hover:text-white transition-colors">{t.nav.signIn}</a>
              <a href={getLoginUrl()} className="btn-gold px-4 py-2 rounded-lg text-sm no-underline flex items-center gap-1.5">
                {t.nav.startFree} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>

        {/* Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 border-l border-white/10" style={{ background: "oklch(15% 0.05 260)" }}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254), oklch(32% 0.12 256))" }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-heading font-bold text-sm text-white">Meeting Agent</span>
                </div>
                <SheetClose asChild>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
                </SheetClose>
              </div>

              <div className="flex-1 px-4 py-6 space-y-1">
                {[
                  { label: t.nav.features, href: "#features" },
                  { label: t.nav.howItWorks, href: "#how-it-works" },
                  { label: t.nav.pricing, href: "#pricing" },
                  { label: ENTERPRISE_COPY[lang].navLabel, href: "#enterprise" },
                ].map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 font-heading font-medium text-sm hover:bg-white/5 hover:text-white transition-colors no-underline">
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-heading font-semibold text-slate-500 tracking-widest uppercase mb-2">Language</p>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    {LANGUAGES.map((l) => (
                      <SheetClose asChild key={l}>
                        <button onClick={() => setLang(l)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-all text-left ${
                            lang === l ? "text-[oklch(15%_0.05_260)]" : "bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                          style={lang === l ? { backgroundColor: "oklch(76% 0.13 67)" } : {}}>
                          {LANGUAGE_NAMES[l]}
                        </button>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-8 pt-4 border-t border-white/10 space-y-2.5">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-heading font-bold text-sm no-underline btn-gold">
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SheetClose>
                ) : (
                  <>
                    <a href={getLoginUrl()} className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-white/15 font-heading font-semibold text-sm text-slate-200 hover:bg-white/5 transition-colors no-underline">{t.nav.signIn}</a>
                    <a href={getLoginUrl()} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-heading font-bold text-sm no-underline btn-gold">
                      {t.nav.startFree} <ArrowRight className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

/* ── Live product mockup (hero visual) ─────────────────────────── */
const TRANSCRIPT = [
  { who: "Sarah Lim", initials: "SL", hue: 254, text: "Let's lock the Q3 launch date before we wrap." },
  { who: "David Tan", initials: "DT", hue: 150, text: "Marketing needs two weeks lead time for assets." },
  { who: "Aisha R.", initials: "AR", hue: 28, text: "I'll own the rollout checklist and share by Friday." },
  { who: "Sarah Lim", initials: "SL", hue: 254, text: "Agreed. Target the 18th, soft launch internally first." },
];

function LiveMockup() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? TRANSCRIPT.length : 1);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setCount((c) => (c >= TRANSCRIPT.length ? 1 : c + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const lines = TRANSCRIPT.slice(0, count);

  return (
    <div className="relative">
      {/* ambient glows */}
      <div className="absolute -top-10 -left-10 w-48 h-48 glow-blue rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -right-8 w-56 h-56 glow-gold rounded-full pointer-events-none" />

      <div className={`relative rounded-2xl overflow-hidden mockup-surface ${reduce ? "" : "animate-float"}`}>
        {/* window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(70% 0.18 25)" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(80% 0.15 85)" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(75% 0.16 150)" }} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-heading font-semibold" style={{ color: "oklch(72% 0.04 252)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(70% 0.18 25)" }} />
            REC · Q3 Strategy Sync
          </div>
        </div>

        <div className="p-4 grid gap-3">
          {/* bot joined row */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: "oklch(48% 0.16 254 / 0.12)", border: "1px solid oklch(48% 0.16 254 / 0.25)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254), oklch(32% 0.12 256))" }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[12px] font-heading font-medium text-white/90">Agent joined and is transcribing…</span>
          </div>

          {/* transcript */}
          <div className="grid gap-2.5 min-h-[150px]">
            {lines.map((l, i) => (
              <motion.div
                key={`${count}-${i}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-heading font-bold text-white"
                  style={{ background: `oklch(55% 0.13 ${l.hue})` }}>
                  {l.initials}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-heading font-semibold" style={{ color: "oklch(76% 0.13 67)" }}>{l.who}</span>
                  <p className="text-[12px] leading-snug" style={{ color: "oklch(82% 0.03 252)" }}>
                    {l.text}
                    {!reduce && i === lines.length - 1 && (
                      <span className="inline-block w-1.5 h-3 ml-0.5 align-middle animate-caret" style={{ background: "oklch(76% 0.13 67)" }} />
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* floating AI summary card */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        className="absolute -bottom-8 -left-6 w-[230px] rounded-xl p-4 mockup-surface hidden sm:block"
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(76% 0.13 67)" }} />
          <span className="text-[11px] font-heading font-bold text-white">AI Summary</span>
        </div>
        <div className="space-y-2">
          {[
            "Q3 launch targeted for the 18th",
            "Internal soft launch goes first",
          ].map((s) => (
            <div key={s} className="flex items-start gap-2 text-[11px]" style={{ color: "oklch(80% 0.03 252)" }}>
              <CheckCircle2 className="w-3 h-3 mt-px flex-shrink-0" style={{ color: "oklch(72% 0.16 150)" }} />
              {s}
            </div>
          ))}
          <div className="flex items-start gap-2 text-[11px] pt-1 mt-1 border-t border-white/10" style={{ color: "oklch(80% 0.03 252)" }}>
            <Circle className="w-3 h-3 mt-px flex-shrink-0" style={{ color: "oklch(76% 0.13 67)" }} />
            <span><b className="font-heading text-white/90">Aisha</b> — rollout checklist by Fri</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────── */
function HeroSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).hero;
  const reduce = useReducedMotion();

  return (
    <section className="relative bg-hero-gradient overflow-hidden pt-28 pb-24 lg:pt-36 lg:pb-32">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="container relative">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
          {/* copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7"
              style={{ borderColor: "oklch(68% 0.14 68 / 0.35)", backgroundColor: "oklch(68% 0.14 68 / 0.10)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "oklch(76% 0.13 67)" }} />
              <span className="text-xs font-heading font-semibold tracking-[0.16em] uppercase" style={{ color: "oklch(80% 0.12 67)" }}>{t.badge}</span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
              className="font-heading font-black text-white leading-[1.04] text-balance mb-6"
              style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", letterSpacing: "-0.025em" }}
            >
              {t.headline1}{" "}
              <span style={{ color: "oklch(80% 0.12 67)" }}>{t.headline2}</span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
              className="text-[17px] leading-relaxed max-w-xl mx-auto lg:mx-0 mb-4 text-pretty"
              style={{ color: "oklch(82% 0.03 252)" }}
            >
              {t.description}
            </motion.p>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="text-xs font-heading font-semibold tracking-[0.18em] uppercase mb-9"
              style={{ color: "oklch(68% 0.14 68)" }}
            >
              {t.poweredBy}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3.5 mb-7"
            >
              <a href={getLoginUrl()} className="btn-gold px-7 py-3.5 rounded-xl text-[15px] no-underline inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                {t.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how-it-works"
                className="px-7 py-3.5 rounded-xl text-[15px] font-heading font-semibold text-white no-underline inline-flex items-center gap-2 transition-all duration-200 w-full sm:w-auto justify-center"
                style={{ border: "1px solid oklch(100% 0 0 / 0.18)", backgroundColor: "oklch(100% 0 0 / 0.05)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "oklch(100% 0 0 / 0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "oklch(100% 0 0 / 0.05)")}>
                {t.ctaSecondary}
              </a>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.34 }}
              className="flex flex-wrap items-center lg:justify-start justify-center gap-x-6 gap-y-2"
            >
              {[
                { title: t.badge1Title, sub: t.badge1Sub },
                { title: t.badge2Title, sub: t.badge2Sub },
                { title: t.badge3Title, sub: t.badge3Sub },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(76% 0.13 67)" }} />
                  <span className="text-sm font-heading font-medium" style={{ color: "oklch(80% 0.03 252)" }}>
                    <span className="text-white font-semibold">{b.title}</span> · {b.sub}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* visual */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="px-4 sm:px-10 lg:px-0 lg:pl-6"
          >
            <LiveMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Features (bento) ──────────────────────────────────────────── */
function SectionHeading({ label, title, subtitle, light = false }: { label: string; title: string; subtitle: string; light?: boolean }) {
  return (
    <Reveal className="max-w-2xl mx-auto text-center mb-14">
      <p className="font-heading font-bold text-[11px] tracking-[0.22em] uppercase mb-4" style={{ color: "oklch(60% 0.13 70)" }}>{label}</p>
      <h2 className="font-heading font-black text-balance mb-4" style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", letterSpacing: "-0.02em", color: light ? "oklch(98% 0 0)" : "oklch(18% 0.06 258)" }}>{title}</h2>
      <p className="text-[17px] leading-relaxed text-pretty" style={{ color: light ? "oklch(75% 0.04 252)" : "oklch(45% 0.02 250)" }}>{subtitle}</p>
    </Reveal>
  );
}

function FeaturesSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).features;
  const icons = [Bot, Mic, Brain, Search, Download, Clock];

  return (
    <section id="features" className="py-24 lg:py-28 bg-white">
      <div className="container">
        <SectionHeading label={t.label} title={t.title} subtitle={t.subtitle} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[1fr]">
          {t.items.map((item, i) => {
            const Icon = icons[i];
            const feature = i === 0; // first card spans wider for rhythm
            return (
              <Reveal key={i} delay={i} className={feature ? "md:col-span-2" : ""}>
                <div className="group h-full p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: "oklch(90% 0.01 252)", background: feature ? "linear-gradient(150deg, oklch(97% 0.015 252), oklch(99.5% 0.003 252))" : "oklch(100% 0 0)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(48% 0.16 254 / 0.3)"; e.currentTarget.style.boxShadow = "0 16px 40px -12px oklch(40% 0.14 255 / 0.16)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "oklch(90% 0.01 252)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254 / 0.12), oklch(68% 0.14 68 / 0.10))" }}>
                      <Icon className="w-5 h-5" style={{ color: "oklch(42% 0.15 255)" }} />
                    </div>
                    {feature && <h3 className="font-heading font-bold text-[1.15rem]" style={{ color: "oklch(18% 0.06 258)" }}>{item.title}</h3>}
                  </div>
                  {!feature && <h3 className="font-heading font-bold text-[1.02rem] mb-2" style={{ color: "oklch(18% 0.06 258)" }}>{item.title}</h3>}
                  <p className="text-sm leading-relaxed text-pretty" style={{ color: "oklch(48% 0.02 250)", maxWidth: feature ? "44ch" : undefined }}>{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────── */
function HowItWorksSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).howItWorks;
  const icons = [Zap, Users, FileText];

  return (
    <section id="how-it-works" className="py-24 lg:py-28 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div className="container relative">
        <SectionHeading label={t.label} title={t.title} subtitle={t.subtitle} light />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* connecting rail */}
          <div className="hidden md:block absolute top-[2.1rem] left-[16%] right-[16%] h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(68% 0.14 68 / 0.4), transparent)" }} />
          {t.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={i} delay={i} className="relative">
                <div className="relative h-full p-8 rounded-2xl text-center"
                  style={{ background: "oklch(100% 0 0 / 0.04)", border: "1px solid oklch(100% 0 0 / 0.09)", backdropFilter: "blur(4px)" }}>
                  <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "oklch(15% 0.05 260)", border: "1px solid oklch(68% 0.14 68 / 0.4)", boxShadow: "0 8px 24px oklch(13% 0.05 260 / 0.6)" }}>
                    <Icon className="w-7 h-7" style={{ color: "oklch(80% 0.12 67)" }} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-heading font-black"
                      style={{ background: "oklch(68% 0.14 68)", color: "oklch(15% 0.04 60)" }}>{i + 1}</span>
                  </div>
                  <h3 className="font-heading font-bold text-white text-[1.05rem] mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-pretty mx-auto" style={{ color: "oklch(74% 0.04 252)", maxWidth: "34ch" }}>{step.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────────────── */
function PricingSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).pricing;

  return (
    <section id="pricing" className="py-24 lg:py-28 bg-white">
      <div className="container">
        <SectionHeading label={t.label} title={t.title} subtitle={t.subtitle} />

        <Reveal className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-heading font-semibold text-sm text-white"
            style={{ background: "linear-gradient(135deg, oklch(60% 0.13 70), oklch(52% 0.11 72))", boxShadow: "0 6px 20px oklch(60% 0.13 70 / 0.35)" }}>
            <Sparkles className="w-4 h-4" />
            {t.freeBanner}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
          {/* Monthly */}
          <Reveal delay={0} className="h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col border" style={{ borderColor: "oklch(90% 0.01 252)", background: "oklch(99% 0.004 252)" }}>
              <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: "oklch(52% 0.02 250)" }}>{t.monthly.label}</p>
              <div className="mb-2"><span className="font-heading font-black" style={{ fontSize: "2.8rem", color: "oklch(18% 0.06 258)" }}>{t.monthly.price}</span><span className="text-base ml-1" style={{ color: "oklch(52% 0.02 250)" }}>{t.monthly.period}</span></div>
              <p className="text-sm mb-6" style={{ color: "oklch(48% 0.02 250)" }}>{t.monthly.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {t.monthly.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "oklch(32% 0.02 250)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(60% 0.13 70)" }} />{f}
                  </li>
                ))}
              </ul>
              <a href={getLoginUrl()} className="btn-blue px-6 py-3 rounded-xl text-center text-sm no-underline block">{t.monthly.cta}</a>
            </div>
          </Reveal>

          {/* Annual — featured */}
          <Reveal delay={1} className="h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col relative overflow-hidden md:-mt-3 md:mb-0"
              style={{ background: "linear-gradient(160deg, oklch(24% 0.09 256), oklch(15% 0.06 260))", boxShadow: "0 24px 60px -16px oklch(20% 0.08 258 / 0.6)", border: "1px solid oklch(68% 0.14 68 / 0.4)" }}>
              <div className="absolute -top-px left-1/2 -translate-x-1/2">
                <div className="px-5 py-1.5 rounded-b-xl font-heading font-bold text-[10px] tracking-widest uppercase" style={{ background: "oklch(68% 0.14 68)", color: "oklch(15% 0.04 60)" }}>{t.annual.badge}</div>
              </div>
              <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5 mt-4" style={{ color: "oklch(80% 0.12 67)" }}>{t.annual.label}</p>
              <div className="mb-1"><span className="font-heading font-black text-white" style={{ fontSize: "2.8rem" }}>{t.annual.price}</span><span className="text-base ml-1" style={{ color: "oklch(70% 0.04 252)" }}>{t.annual.period}</span></div>
              <p className="text-sm line-through mb-1" style={{ color: "oklch(58% 0.04 252)" }}>{t.annual.originalPrice}</p>
              <p className="text-sm mb-6" style={{ color: "oklch(78% 0.04 252)" }}>{t.annual.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {t.annual.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(80% 0.12 67)" }} />{f}
                  </li>
                ))}
              </ul>
              <a href={getLoginUrl()} className="btn-gold px-6 py-3 rounded-xl text-center text-sm no-underline block">{t.annual.cta}</a>
            </div>
          </Reveal>

          {/* Pay per use */}
          <Reveal delay={2} className="h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col border" style={{ borderColor: "oklch(90% 0.01 252)", background: "oklch(99% 0.004 252)" }}>
              <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: "oklch(52% 0.02 250)" }}>{t.payPerUse.label}</p>
              <div className="mb-2"><span className="font-heading font-black" style={{ fontSize: "2.8rem", color: "oklch(18% 0.06 258)" }}>{t.payPerUse.price}</span><span className="text-base ml-1" style={{ color: "oklch(52% 0.02 250)" }}>{t.payPerUse.period}</span></div>
              <p className="text-sm mb-6" style={{ color: "oklch(48% 0.02 250)" }}>{t.payPerUse.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {t.payPerUse.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "oklch(32% 0.02 250)" }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(60% 0.13 70)" }} />{f}
                  </li>
                ))}
              </ul>
              <a href={getLoginUrl()} className="px-6 py-3 rounded-xl text-center text-sm font-heading font-bold no-underline block border transition-all duration-150"
                style={{ borderColor: "oklch(42% 0.15 255 / 0.4)", color: "oklch(42% 0.15 255)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "oklch(42% 0.15 255 / 0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                {t.payPerUse.cta}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="text-center mt-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-6 py-3 rounded-full border text-sm"
            style={{ borderColor: "oklch(60% 0.13 70 / 0.3)", backgroundColor: "oklch(68% 0.14 68 / 0.05)" }}>
            <span style={{ color: "oklch(40% 0.02 250)" }}>{t.testerCode}</span>
            <a href={getLoginUrl()} className="font-heading font-semibold hover:underline" style={{ color: "oklch(42% 0.15 255)" }}>{t.testerCta}</a>
          </div>
          <p className="text-sm mt-3" style={{ color: "oklch(55% 0.02 250)" }}>{t.testerSub}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── For Government & Enterprise ───────────────────────────────── */
function EnterpriseSection() {
  const { lang } = useLang();
  const e = ENTERPRISE_COPY[lang];
  const modelIcons = [Users, Palette, Server];

  return (
    <section id="enterprise" className="py-24 lg:py-28 relative overflow-hidden" style={{ background: "oklch(11% 0.045 260)" }}>
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-40 glow-gold rounded-full pointer-events-none opacity-60" />
      <div className="container relative">
        <Reveal className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ borderColor: "oklch(68% 0.14 68 / 0.35)", backgroundColor: "oklch(68% 0.14 68 / 0.10)" }}>
            <Landmark className="w-3.5 h-3.5" style={{ color: "oklch(80% 0.12 67)" }} />
            <span className="text-xs font-heading font-semibold tracking-[0.16em] uppercase" style={{ color: "oklch(80% 0.12 67)" }}>{e.label}</span>
          </div>
          <h2 className="font-heading font-black text-white text-balance mb-6" style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.7rem)", letterSpacing: "-0.02em" }}>{e.title}</h2>

          {/* Government / grant alignment statement */}
          <div className="rounded-2xl px-6 py-5 mx-auto max-w-2xl"
            style={{ background: "oklch(100% 0 0 / 0.04)", border: "1px solid oklch(68% 0.14 68 / 0.28)" }}>
            <p className="text-[15px] leading-relaxed text-pretty" style={{ color: "oklch(86% 0.03 252)" }}>{e.statement}</p>
          </div>

          {/* compliance pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 mt-7">
            {[ShieldCheck, Receipt, BadgeCheck].map((Ic, i) => (
              <div key={i} className="flex items-center gap-2">
                <Ic className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(72% 0.16 150)" }} />
                <span className="text-sm font-heading font-medium" style={{ color: "oklch(82% 0.03 252)" }}>{e.points[i]}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* deployment models */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {e.models.map((m, i) => {
            const Icon = modelIcons[i];
            const flagship = i === 2; // on-premise is the government wedge
            return (
              <Reveal key={i} delay={i} className="h-full">
                <div className="h-full p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: flagship ? "linear-gradient(160deg, oklch(26% 0.09 256), oklch(15% 0.06 260))" : "oklch(100% 0 0 / 0.035)",
                    border: flagship ? "1px solid oklch(68% 0.14 68 / 0.4)" : "1px solid oklch(100% 0 0 / 0.10)",
                  }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "oklch(68% 0.14 68 / 0.14)", border: "1px solid oklch(68% 0.14 68 / 0.3)" }}>
                    <Icon className="w-5 h-5" style={{ color: "oklch(80% 0.12 67)" }} />
                  </div>
                  <h3 className="font-heading font-bold text-white text-[1.05rem] mb-2">{m.title}</h3>
                  <p className="text-sm leading-relaxed text-pretty" style={{ color: "oklch(74% 0.04 252)" }}>{m.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* talk to us */}
        <Reveal>
          <div className="rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
            style={{ background: "linear-gradient(135deg, oklch(24% 0.09 256), oklch(16% 0.06 260))", border: "1px solid oklch(68% 0.14 68 / 0.3)" }}>
            <div>
              <h3 className="font-heading font-black text-white text-[1.3rem] mb-1.5">{e.ctaTitle}</h3>
              <p className="text-[15px] text-pretty" style={{ color: "oklch(78% 0.04 252)" }}>{e.ctaDesc}</p>
            </div>
            <a href={ENTERPRISE_MAILTO} className="btn-gold px-7 py-3.5 rounded-xl text-[15px] no-underline inline-flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              {e.ctaButton} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Closing CTA ───────────────────────────────────────────────── */
function CtaSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).cta;

  return (
    <section className="py-24 lg:py-28 bg-cta-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, oklch(68% 0.14 68 / 0.10), transparent)" }} />
      <Reveal className="container text-center relative">
        <h2 className="font-heading font-black text-white mb-4 text-balance mx-auto" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.02em", maxWidth: "18ch" }}>{t.title}</h2>
        <p className="text-[17px] mb-10 max-w-xl mx-auto text-pretty" style={{ color: "oklch(76% 0.04 252)" }}>{t.subtitle}</p>
        <a href={getLoginUrl()} className="btn-gold px-9 py-4 rounded-xl text-[15px] no-underline inline-flex items-center gap-2">
          {t.button} <ArrowRight className="w-4 h-4" />
        </a>
      </Reveal>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer() {
  const { lang, setLang } = useLang();
  const t = useTranslations(lang).footer;

  return (
    <footer className="border-t py-12" style={{ backgroundColor: "oklch(13% 0.05 260)", borderColor: "oklch(100% 0 0 / 0.07)" }}>
      <div className="container">
        <div className="gold-divider mb-10 opacity-30" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254), oklch(32% 0.12 256))" }}>
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-bold text-white text-[14px] leading-none">Meeting Agent</span>
                <span className="font-heading font-semibold text-[9px] tracking-[0.15em] uppercase leading-none mt-0.5" style={{ color: "oklch(68% 0.14 68)" }}>AI Meeting Assistant</span>
              </div>
            </div>
            <p className="text-xs" style={{ color: "oklch(48% 0.03 252)" }}>{t.innovated}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <p className="text-[10px] font-heading font-semibold tracking-[0.2em] uppercase" style={{ color: "oklch(48% 0.03 252)" }}>{t.language}</p>
            <div className="flex items-center gap-1.5">
              {LANGUAGES.map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className="px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all duration-150"
                  style={lang === l ? { backgroundColor: "oklch(68% 0.14 68)", color: "oklch(14% 0.04 60)" } : { color: "oklch(55% 0.03 252)", border: "1px solid oklch(100% 0 0 / 0.10)" }}>
                  {LANGUAGE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-center md:text-right max-w-xs" style={{ color: "oklch(42% 0.03 252)" }}>{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(13% 0.05 260)" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <EnterpriseSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
