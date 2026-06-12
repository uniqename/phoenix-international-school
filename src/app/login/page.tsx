"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import toast from "react-hot-toast";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; label: string; icon: string; color: string }> = {
  admin:     { email: "a_emmanuel.adjei@phoenixgh.edu",     label: "Admin Demo",     icon: "🏛️", color: "#4D78F0" },
  principal: { email: "pr_akua.boateng@phoenixgh.edu",      label: "Principal Demo", icon: "👔", color: "#F59E0B" },
  teacher:   { email: "t_adjoa.koomson@phoenixgh.edu",      label: "Teacher Demo",   icon: "👩‍🏫", color: "#A855F7" },
  parent:    { email: "p_kwame.asante@phoenixgh.edu",       label: "Parent Demo",    icon: "👨‍👩‍👧", color: "#60a5fa" },
  student:   { email: "s_kwame.asante.jr@phoenixgh.edu",    label: "Student Demo",   icon: "🎒",  color: "#c084fc" },
  driver:    { email: "d_kwesi@phoenixgh.edu",              label: "Driver Demo",    icon: "🚌", color: "#f59e0b" },
};

function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const { login, loginAsRole, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const role = params.get("role") as UserRole | null;
    if (role && DEMO_CREDENTIALS[role]) {
      setEmail(DEMO_CREDENTIALS[role].email);
      setPassword("demo1234");
    }
  }, [params]);

  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await login(email, password);
    if (error) toast.error(error);
    setSubmitting(false);
  };

  const handleDemo = (role: UserRole) => {
    loginAsRole(role);
    toast.success(`Signed in as ${DEMO_CREDENTIALS[role].label}`);
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4 safe-top safe-bottom">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 animate-float">
            <img src="/logo.png" alt="Phoenix International School crest"
              className="w-24 h-28 mx-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Phoenix International</h1>
          <p className="text-base font-bold text-white/90 mb-1">
            School Management System · Ghana
          </p>
          <p className="text-xs text-white/70">
            The Pace Setters · Est. 2006
          </p>
        </div>

        {/* Login form — dark glass */}
        <div className="rounded-3xl p-6 mb-4"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-white">
                Email or Phone Number
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com or 024XXXXXXX"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", color: "white" }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-lg text-white placeholder-white/50 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", color: "white" }}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded text-xs font-bold text-white/80 hover:text-white transition-colors">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="btn-gold w-full py-3 text-sm disabled:opacity-60">
              {submitting ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>


        {/* First-time setup helper — collapsed by default so the credentials
            aren't visible to anyone glancing at the screen. Tap once to expand. */}
        <div className="text-center mb-4">
          <button type="button" onClick={() => setShowSetup((s) => !s)}
            className="text-sm font-bold text-white/80 hover:text-white underline transition-colors">
            {showSetup ? "Hide setup help" : "First-time setting up the school? →"}
          </button>
        </div>

        {showSetup && (
          <div className="rounded-2xl p-4 mb-4 border-2 border-yellow-400/30" style={{ background: "rgba(255,215,0,0.12)" }}>
            <p className="text-sm font-bold mb-2 text-yellow-300">
              🔑 First-time school sign-in
            </p>
            <p className="text-xs mb-3 text-white/85 leading-relaxed">
              On day one only, the Admin and Principal sign in with the temporary credentials provided to your school in your handover document. The app will force a password change on first login.
            </p>
            <button type="button"
              onClick={() => { setEmail("a_admin@phoenixintl.school"); setShowSetup(false); toast("Enter the temporary admin password from your handover document"); }}
              className="w-full py-2.5 text-xs font-bold rounded-lg text-yellow-300 hover:text-yellow-200 transition-colors border-2 border-yellow-400/40 hover:border-yellow-400/60"
              style={{ background: "rgba(255,215,0,0.1)" }}>
              Auto-fill Admin Email
            </button>
            <p className="text-xs mt-2 text-white/70 italic">
              Hide this card after your first sign-in — staff and parents shouldn&apos;t see it.
            </p>
          </div>
        )}

        {/* Demo access — kept tiny and hidden behind a toggle so the production
            login feels professional, not training-flavoured. */}
        <details className="rounded-2xl p-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <summary className="text-xs font-bold cursor-pointer list-none"
            style={{ color: "rgba(196,181,253,0.55)" }}>
            🧪 Show training demos (sample data only)
          </summary>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((role) => {
              const d = DEMO_CREDENTIALS[role];
              return (
                <button key={role} type="button" onClick={() => handleDemo(role)}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.03]"
                  style={{ background: d.color + "20", color: d.color, border: `1px solid ${d.color}45` }}>
                  <span className="text-base">{d.icon}</span>{d.label}
                </button>
              );
            })}
          </div>
        </details>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(196,181,253,0.7)" }}>
          Teachers, parents and students: your account is created by the school office. You&apos;ll receive your sign-in details by SMS.
        </p>
        <p className="text-center text-[10px] mt-2" style={{ color: "rgba(196,181,253,0.4)" }}>
          © 2026 Phoenix International School Ghana
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
