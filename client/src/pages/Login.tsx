import { useState } from "react";
import { Link } from "wouter";
import { Bot, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const login = trpc.auth.emailLogin.useMutation({
    onSuccess: () => {
      // Full reload so the session cookie is picked up by auth.me everywhere.
      window.location.href = "/dashboard";
    },
    onError: (e) => setError(e.message || "Login failed. Please try again."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    login.mutate({ email: trimmed, name: name.trim() || undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-5">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-7">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(145deg, oklch(48% 0.16 254), oklch(32% 0.12 256))", boxShadow: "0 2px 14px oklch(48% 0.16 254 / 0.5)" }}>
              <Bot className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-extrabold text-white text-[15px] leading-none tracking-tight">Meeting Agent</span>
              <span className="font-heading font-semibold text-[9px] tracking-[0.18em] uppercase leading-none mt-1" style={{ color: "oklch(76% 0.13 67)" }}>AI Meeting Assistant</span>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl p-8 mockup-surface">
          <h1 className="font-heading font-black text-white text-[1.5rem] mb-1.5 text-center">Sign in to continue</h1>
          <p className="text-sm text-center mb-7" style={{ color: "oklch(74% 0.04 252)" }}>
            Enter your email to access your meeting workspace.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold mb-1.5" style={{ color: "oklch(80% 0.04 252)" }}>Email address</label>
              <input
                type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-colors"
                style={{ background: "oklch(100% 0 0 / 0.06)", border: "1px solid oklch(100% 0 0 / 0.14)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-semibold mb-1.5" style={{ color: "oklch(80% 0.04 252)" }}>Name <span style={{ color: "oklch(60% 0.03 252)" }}>(optional)</span></label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-colors"
                style={{ background: "oklch(100% 0 0 / 0.06)", border: "1px solid oklch(100% 0 0 / 0.14)" }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: "oklch(72% 0.17 25)" }}>{error}</p>}

            <button type="submit" disabled={login.isPending}
              className="btn-gold w-full px-6 py-3.5 rounded-xl text-[15px] inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {login.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "oklch(58% 0.03 252)" }}>
          By continuing you agree to our terms. <Link href="/" className="hover:underline" style={{ color: "oklch(76% 0.13 67)" }}>Back to home</Link>
        </p>
      </div>
    </div>
  );
}
