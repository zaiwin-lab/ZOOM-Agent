import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations, LANGUAGE_LABELS, LANGUAGE_NAMES, type Language } from "@/lib/i18n";
import { Bot, Brain, Clock, Download, Globe, Mic, Search, Shield, Zap, FileText, Users, Menu, X, ChevronDown, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const LANGUAGES: Language[] = ["en", "bm", "zh", "iban"];

function Navbar() {
  const { lang, setLang } = useLang();
  const t = useTranslations(lang);
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/98 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.08)] border-b border-slate-100"
        : "bg-white border-b border-slate-100"
    }`}>
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-heading font-bold text-navy-900 text-[15px] leading-none" style={{color:"oklch(20% 0.08 258)"}}>Meeting Agent</span>
            <span className="font-heading font-semibold text-kobis-gold text-[9px] tracking-[0.15em] uppercase leading-none mt-0.5">AI Meeting Assistant</span>
          </div>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: t.nav.features, href: "#features" },
            { label: t.nav.howItWorks, href: "#how-it-works" },
            { label: t.nav.pricing, href: "#pricing" },
          ].map(link => (
            <a key={link.href} href={link.href}
              className="font-heading font-medium text-sm text-slate-600 hover:text-kobis-blue transition-colors duration-150 relative group/link">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-kobis-gold group-hover/link:w-full transition-all duration-200 rounded-full" />
            </a>
          ))}
        </div>

        {/* Desktop Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              onBlur={() => setTimeout(() => setLangOpen(false), 150)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-heading font-medium text-slate-600 hover:border-kobis-blue/40 hover:text-kobis-blue transition-all duration-150">
              <Globe className="w-3.5 h-3.5" />
              {LANGUAGE_LABELS[lang]}
              <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/60 py-1.5 min-w-[168px] z-50">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-heading font-medium transition-colors flex items-center justify-between ${
                      lang === l ? "text-kobis-blue bg-blue-50/60" : "text-slate-600 hover:bg-slate-50"
                    }`}>
                    {LANGUAGE_NAMES[l]}
                    {lang === l && <Check className="w-3.5 h-3.5 text-kobis-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <Link href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-kobis-blue text-white text-sm font-heading font-semibold no-underline hover:opacity-90 transition-opacity"
              style={{backgroundColor:"oklch(40% 0.14 255)"}}>
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()} className="font-heading font-medium text-sm text-slate-600 hover:text-kobis-blue transition-colors">{t.nav.signIn}</a>
              <a href={getLoginUrl()} className="btn-blue px-4 py-2 rounded-lg text-sm text-white no-underline flex items-center gap-1.5">
                {t.nav.startFree} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 bg-white border-l border-slate-100">
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-hero-gradient flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-heading font-bold text-sm" style={{color:"oklch(20% 0.08 258)"}}>Meeting Agent</span>
                </div>
                <SheetClose asChild>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </SheetClose>
              </div>

              {/* Mobile nav links */}
              <div className="flex-1 px-4 py-6 space-y-1">
                {[
                  { label: t.nav.features, href: "#features" },
                  { label: t.nav.howItWorks, href: "#how-it-works" },
                  { label: t.nav.pricing, href: "#pricing" },
                ].map(link => (
                  <SheetClose asChild key={link.href}>
                    <a href={link.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-heading font-medium text-sm hover:bg-slate-50 hover:text-kobis-blue transition-colors no-underline">
                      {link.label}
                    </a>
                  </SheetClose>
                ))}

                {/* Language section */}
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-heading font-semibold text-slate-400 tracking-widest uppercase mb-2">Language</p>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    {LANGUAGES.map(l => (
                      <SheetClose asChild key={l}>
                        <button onClick={() => setLang(l)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-all text-left ${
                            lang === l
                              ? "bg-kobis-blue text-white shadow-sm"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                          style={lang === l ? {backgroundColor:"oklch(40% 0.14 255)"} : {}}>
                          {LANGUAGE_NAMES[l]}
                        </button>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="px-4 pb-8 pt-4 border-t border-slate-100 space-y-2.5">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Link href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-heading font-bold text-sm text-white no-underline"
                      style={{backgroundColor:"oklch(40% 0.14 255)"}}>
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SheetClose>
                ) : (
                  <>
                    <a href={getLoginUrl()}
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-slate-200 font-heading font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-colors no-underline">
                      {t.nav.signIn}
                    </a>
                    <a href={getLoginUrl()}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-heading font-bold text-sm text-white no-underline btn-gold">
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

function HeroSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).hero;

  return (
    <section className="bg-hero-gradient min-h-screen flex items-center pt-16">
      <div className="container py-28 text-center">

        {/* Beta badge — gold pill, subtle and premium */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-10"
          style={{
            borderColor: "oklch(68% 0.14 68 / 0.35)",
            backgroundColor: "oklch(68% 0.14 68 / 0.10)",
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-kobis-gold animate-pulse" style={{backgroundColor:"oklch(68% 0.14 68)"}} />
          <span className="text-kobis-gold-light text-xs font-heading font-semibold tracking-[0.18em] uppercase">{t.badge}</span>
        </div>

        {/* Headline — large, confident, premium weight */}
        <h1 className="font-heading font-black text-white leading-[1.05] mb-3"
          style={{fontSize:"clamp(2.8rem, 7vw, 5rem)"}}>
          {t.headline1}
        </h1>
        <h1 className="font-heading font-black leading-[1.05] mb-8"
          style={{fontSize:"clamp(2.8rem, 7vw, 5rem)", color:"oklch(80% 0.12 67)"}}>
          {t.headline2}
        </h1>

        {/* Powered by — elegant small caps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-kobis-gold/40" style={{background:"linear-gradient(90deg, transparent, oklch(68% 0.14 68 / 0.4))"}} />
          <p className="text-xs font-heading font-semibold tracking-[0.2em] uppercase" style={{color:"oklch(68% 0.14 68)"}}>{t.poweredBy}</p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-kobis-gold/40" style={{background:"linear-gradient(270deg, transparent, oklch(68% 0.14 68 / 0.4))"}} />
        </div>

        {/* Description */}
        <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{color:"oklch(78% 0.04 252)"}}>
          {t.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a href={getLoginUrl()}
            className="btn-gold px-8 py-4 rounded-xl text-[15px] font-heading font-bold no-underline inline-flex items-center gap-2">
            {t.ctaPrimary} <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#how-it-works"
            className="px-8 py-4 rounded-xl text-[15px] font-heading font-semibold text-white no-underline inline-flex items-center gap-2 transition-all duration-200"
            style={{border:"1px solid oklch(100% 0 0 / 0.18)", backgroundColor:"oklch(100% 0 0 / 0.05)"}}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(100% 0 0 / 0.10)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(100% 0 0 / 0.05)")}>
            {t.ctaSecondary}
          </a>
        </div>

        {/* Trust line */}
        <p className="text-sm mb-14" style={{color:"oklch(60% 0.04 252)"}}>{t.trust}</p>

        {/* Trust badges — clean glass cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {[
            { title: t.badge1Title, sub: t.badge1Sub },
            { title: t.badge2Title, sub: t.badge2Sub },
            { title: t.badge3Title, sub: t.badge3Sub },
          ].map((b, i) => (
            <div key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-xl"
              style={{
                border: "1px solid oklch(100% 0 0 / 0.10)",
                backgroundColor: "oklch(100% 0 0 / 0.05)",
              }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:"oklch(68% 0.14 68)"}} />
              <div className="text-left">
                <div className="text-white font-heading font-semibold text-sm">{b.title}</div>
                <div className="text-xs font-medium" style={{color:"oklch(68% 0.14 68)"}}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).features;
  const icons = [Bot, Mic, Brain, Search, Download, Clock];

  return (
    <section id="features" className="py-28 bg-white">
      <div className="container">
        {/* Section label */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
            <p className="text-kobis-gold font-heading font-bold text-[11px] tracking-[0.2em] uppercase">{t.label}</p>
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
          </div>
          <h2 className="font-heading text-[2.2rem] font-black mb-4" style={{color:"oklch(18% 0.06 258)"}}>{t.title}</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{color:"oklch(52% 0.02 250)"}}>{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={i}
                className="p-7 rounded-2xl border transition-all duration-300 group cursor-default"
                style={{borderColor:"oklch(90% 0.01 252)"}}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(40% 0.14 255 / 0.25)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px oklch(40% 0.14 255 / 0.08)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(90% 0.01 252)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}>
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{backgroundColor:"oklch(40% 0.14 255 / 0.08)"}}>
                  <Icon className="w-5 h-5" style={{color:"oklch(40% 0.14 255)"}} />
                </div>
                <h3 className="font-heading font-bold text-[1rem] mb-2" style={{color:"oklch(18% 0.06 258)"}}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:"oklch(52% 0.02 250)"}}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).howItWorks;
  const icons = [Zap, Users, FileText];

  return (
    <section id="how-it-works" className="py-28" style={{backgroundColor:"oklch(97% 0.015 252)"}}>
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
            <p className="text-kobis-gold font-heading font-bold text-[11px] tracking-[0.2em] uppercase">{t.label}</p>
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
          </div>
          <h2 className="font-heading text-[2.2rem] font-black mb-4" style={{color:"oklch(18% 0.06 258)"}}>{t.title}</h2>
          <p className="text-lg" style={{color:"oklch(52% 0.02 250)"}}>{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="relative p-8 rounded-2xl text-center overflow-hidden bg-hero-gradient border"
                style={{borderColor:"oklch(100% 0 0 / 0.08)"}}>
                {/* Step number watermark */}
                <div className="absolute top-4 right-5 font-heading font-black select-none pointer-events-none"
                  style={{fontSize:"4.5rem", lineHeight:1, color:"oklch(100% 0 0 / 0.06)"}}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px z-10"
                    style={{background:"oklch(68% 0.14 68 / 0.5)"}} />
                )}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{backgroundColor:"oklch(68% 0.14 68 / 0.15)"}}>
                  <Icon className="w-7 h-7" style={{color:"oklch(80% 0.12 67)"}} />
                </div>
                <h3 className="font-heading font-bold text-white text-[1rem] mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:"oklch(72% 0.04 252)"}}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).pricing;

  return (
    <section id="pricing" className="py-28 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
            <p className="text-kobis-gold font-heading font-bold text-[11px] tracking-[0.2em] uppercase">{t.label}</p>
            <div className="h-px w-8" style={{background:"oklch(68% 0.14 68)"}} />
          </div>
          <h2 className="font-heading text-[2.2rem] font-black mb-4" style={{color:"oklch(18% 0.06 258)"}}>{t.title}</h2>
          <p className="text-lg" style={{color:"oklch(52% 0.02 250)"}}>{t.subtitle}</p>
        </div>

        {/* Free banner */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-heading font-semibold text-sm text-white"
            style={{background:"linear-gradient(135deg, oklch(68% 0.14 68), oklch(60% 0.13 70))"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            {t.freeBanner}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* Monthly */}
          <div className="rounded-2xl p-8 flex flex-col border bg-hero-gradient"
            style={{borderColor:"oklch(100% 0 0 / 0.08)"}}>
            <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5" style={{color:"oklch(80% 0.12 67)"}}>
              {t.monthly.label}
            </p>
            <div className="mb-2">
              <span className="font-heading font-black text-white" style={{fontSize:"3rem"}}>{t.monthly.price}</span>
              <span className="text-base ml-1" style={{color:"oklch(60% 0.04 252)"}}>{t.monthly.period}</span>
            </div>
            <p className="text-sm mb-6" style={{color:"oklch(60% 0.04 252)"}}>{t.monthly.desc}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {t.monthly.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{color:"oklch(80% 0.04 252)"}}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{color:"oklch(68% 0.14 68)"}} />
                  {f}
                </li>
              ))}
            </ul>
            <a href={getLoginUrl()} className="btn-blue px-6 py-3 rounded-xl text-center text-sm font-heading font-bold text-white no-underline block">
              {t.monthly.cta}
            </a>
          </div>

          {/* Annual — Best Value, gold card */}
          <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden"
            style={{background:"linear-gradient(145deg, oklch(68% 0.14 68), oklch(56% 0.12 70))"}}>
            {/* Best value badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="px-5 py-1.5 rounded-b-xl font-heading font-bold text-[10px] tracking-widest uppercase bg-white shadow-md"
                style={{color:"oklch(56% 0.12 70)"}}>
                {t.annual.badge}
              </div>
            </div>
            <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5 mt-4" style={{color:"oklch(100% 0 0 / 0.75)"}}>
              {t.annual.label}
            </p>
            <div className="mb-1">
              <span className="font-heading font-black text-white" style={{fontSize:"3rem"}}>{t.annual.price}</span>
              <span className="text-base ml-1" style={{color:"oklch(100% 0 0 / 0.65)"}}>{t.annual.period}</span>
            </div>
            <p className="text-sm line-through mb-1" style={{color:"oklch(100% 0 0 / 0.45)"}}>{t.annual.originalPrice}</p>
            <p className="text-sm mb-6" style={{color:"oklch(100% 0 0 / 0.75)"}}>{t.annual.desc}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {t.annual.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-white text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 text-white/80" />
                  {f}
                </li>
              ))}
            </ul>
            <a href={getLoginUrl()}
              className="px-6 py-3 rounded-xl text-center text-sm font-heading font-bold no-underline block transition-all duration-150"
              style={{backgroundColor:"oklch(100% 0 0)", color:"oklch(56% 0.12 70)"}}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "oklch(97% 0 0)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "oklch(100% 0 0)")}>
              {t.annual.cta}
            </a>
          </div>

          {/* Pay Per Use */}
          <div className="rounded-2xl p-8 flex flex-col border bg-hero-gradient"
            style={{borderColor:"oklch(100% 0 0 / 0.08)"}}>
            <p className="font-heading font-bold text-[10px] tracking-[0.2em] uppercase mb-5" style={{color:"oklch(80% 0.12 67)"}}>
              {t.payPerUse.label}
            </p>
            <div className="mb-2">
              <span className="font-heading font-black text-white" style={{fontSize:"3rem"}}>{t.payPerUse.price}</span>
              <span className="text-base ml-1" style={{color:"oklch(60% 0.04 252)"}}>{t.payPerUse.period}</span>
            </div>
            <p className="text-sm mb-6" style={{color:"oklch(60% 0.04 252)"}}>{t.payPerUse.desc}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {t.payPerUse.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{color:"oklch(80% 0.04 252)"}}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{color:"oklch(68% 0.14 68)"}} />
                  {f}
                </li>
              ))}
            </ul>
            <a href={getLoginUrl()}
              className="px-6 py-3 rounded-xl text-center text-sm font-heading font-bold no-underline block border transition-all duration-150"
              style={{borderColor:"oklch(68% 0.14 68 / 0.6)", color:"oklch(80% 0.12 67)"}}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "oklch(68% 0.14 68 / 0.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
              }}>
              {t.payPerUse.cta}
            </a>
          </div>
        </div>

        {/* Tester code row */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border text-sm"
            style={{borderColor:"oklch(68% 0.14 68 / 0.25)", backgroundColor:"oklch(68% 0.14 68 / 0.04)"}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:"oklch(68% 0.14 68)"}} />
            <span style={{color:"oklch(45% 0.02 250)"}}>{t.testerCode}</span>
            <a href={getLoginUrl()} className="font-heading font-semibold hover:underline" style={{color:"oklch(40% 0.14 255)"}}>{t.testerCta}</a>
          </div>
          <p className="text-sm mt-3" style={{color:"oklch(62% 0.02 250)"}}>{t.testerSub}</p>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { lang } = useLang();
  const t = useTranslations(lang).cta;

  return (
    <section className="py-28 bg-cta-gradient relative overflow-hidden">
      {/* Subtle gold glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{background:"radial-gradient(ellipse 50% 60% at 50% 100%, oklch(68% 0.14 68 / 0.08), transparent)"}} />
      <div className="container text-center relative">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="h-px w-8" style={{background:"oklch(68% 0.14 68 / 0.5)"}} />
          <span className="text-xs font-heading font-semibold tracking-[0.2em] uppercase" style={{color:"oklch(68% 0.14 68)"}}>Get Started Today</span>
          <div className="h-px w-8" style={{background:"oklch(68% 0.14 68 / 0.5)"}} />
        </div>
        <h2 className="font-heading font-black text-white mb-4"
          style={{fontSize:"clamp(2rem, 5vw, 3.2rem)"}}>
          {t.title}
        </h2>
        <p className="text-lg mb-12 max-w-xl mx-auto" style={{color:"oklch(72% 0.04 252)"}}>{t.subtitle}</p>
        <a href={getLoginUrl()}
          className="btn-gold px-10 py-4 rounded-xl text-[15px] font-heading font-bold text-white no-underline inline-flex items-center gap-2">
          {t.button} <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const { lang, setLang } = useLang();
  const t = useTranslations(lang).footer;

  return (
    <footer className="border-t py-12" style={{backgroundColor:"oklch(14% 0.06 260)", borderColor:"oklch(100% 0 0 / 0.07)"}}>
      <div className="container">
        {/* Gold divider */}
        <div className="gold-divider mb-10 opacity-30" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-hero-gradient flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-bold text-white text-[14px] leading-none">Meeting Agent</span>
                <span className="font-heading font-semibold text-[9px] tracking-[0.15em] uppercase leading-none mt-0.5" style={{color:"oklch(68% 0.14 68)"}}>AI Meeting Assistant</span>
              </div>
            </div>
            <p className="text-xs" style={{color:"oklch(45% 0.03 252)"}}>{t.innovated}</p>
          </div>

          {/* Language pills */}
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-[10px] font-heading font-semibold tracking-[0.2em] uppercase" style={{color:"oklch(45% 0.03 252)"}}>{t.language}</p>
            <div className="flex items-center gap-1.5">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all duration-150"
                  style={lang === l
                    ? {backgroundColor:"oklch(68% 0.14 68)", color:"oklch(14% 0.04 60)"}
                    : {color:"oklch(50% 0.03 252)", border:"1px solid oklch(100% 0 0 / 0.10)"}}>
                  {LANGUAGE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-center md:text-right max-w-xs" style={{color:"oklch(40% 0.03 252)"}}>{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
