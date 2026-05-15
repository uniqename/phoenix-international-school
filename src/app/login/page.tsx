"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import toast from "react-hot-toast";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; label: string; icon: string; color: string }> = {
  admin:     { email: "admin@phoenixgh.edu",     label: "Admin Demo",     icon: "🏛️", color: "#4D78F0" },
  principal: { email: "principal@phoenixgh.edu", label: "Principal Demo", icon: "👔", color: "#F59E0B" },
  teacher:   { email: "teacher@phoenixgh.edu",   label: "Teacher Demo",   icon: "👩‍🏫", color: "#A855F7" },
  parent:    { email: "parent@phoenixgh.edu",    label: "Parent Demo",    icon: "👨‍👩‍👧", color: "#60a5fa" },
  student:   { email: "student@phoenixgh.edu",   label: "Student Demo",   icon: "🎒",  color: "#c084fc" },
};

function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 animate-float">
            <img src="/logo.png" alt="Phoenix International School crest"
              className="w-24 h-28 mx-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Phoenix International</h1>
          <p className="text-sm font-bold" style={{ color: "#C4B5FD" }}>
            School Management System · Ghana
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(196,181,253,0.55)" }}>
            The Pace Setters · Est. 2006
          </p>
        </div>

        {/* Login form — dark glass */}
        <div className="rounded-3xl p-6 mb-4"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(196,181,253,0.85)" }}>
                Email or Phone Number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com or 024XXXXXXX"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(196,181,253,0.85)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}
              />
            </div>
            <button type="submit" disabled={submitting}
              className="btn-gold w-full py-3 text-sm disabled:opacity-60">
              {submitting ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        {/* Demo access — dark glass */}
        <div className="rounded-3xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <p className="text-xs text-center mb-3 font-semibold" style={{ color: "rgba(196,181,253,0.65)" }}>
            Quick Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
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
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(196,181,253,0.4)" }}>
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
