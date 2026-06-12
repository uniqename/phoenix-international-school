"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Principal and Admin share the same screens (the shell handles overlap at
// DashboardShell.tsx:39). One tile, two sign-in shortcuts under it.
const PORTALS = [
  { label: "Admin / Principal", sub: "Office · Oversight",      href: "/login?role=admin",   icon: "🏛️", from: "#0C0A1E", to: "#1A3FA0" },
  { label: "Teacher Portal",    sub: "Class & Subject Teachers", href: "/login?role=teacher", icon: "👩‍🏫", from: "#1E0B42", to: "#6B21A8" },
  { label: "Parent Portal",     sub: "Parents & Guardians",      href: "/login?role=parent",  icon: "👨‍👩‍👧", from: "#0D1E5C", to: "#2B55C9" },
  { label: "Student Portal",    sub: "Primary through JHS 3",    href: "/login?role=student", icon: "🎒",  from: "#2D0F5C", to: "#8B35E0" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(`/${user.role}`);
  }, [user, loading, router]);

  // If we're still loading after 5s something has hung (e.g. iOS WebView
  // network issue). Surface a recovery option so the user isn't trapped on
  // the bouncing logo.
  useEffect(() => {
    if (!loading) { setStuck(false); return; }
    const t = window.setTimeout(() => setStuck(true), 5000);
    return () => window.clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-6 safe-top safe-bottom">
        <img src="/logo-transparent.png" alt="Phoenix" className="w-32 h-32 object-contain animate-float opacity-95" />
        {stuck && (
          <div className="mt-8 text-center max-w-xs">
            <p className="text-xs text-white/70 mb-3">
              Taking longer than usual to load. You can continue without signing in:
            </p>
            <button
              type="button"
              onClick={() => { try { window.location.reload(); } catch { /* noop */ } }}
              className="btn-gold text-sm px-5 py-2"
            >
              🔁 Reload
            </button>
            <Link href="/login" className="block mt-3 text-xs font-bold text-yellow-300 underline">
              Continue to sign-in →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg grid-pattern flex flex-col safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Logo */}
        <div className="animate-float mb-8">
          <img src="/logo.png" alt="Phoenix International School Ghana crest"
            className="w-28 h-32 mx-auto object-contain drop-shadow-2xl" />
        </div>

        {/* Headline */}
        <div className="text-xs font-bold tracking-widest uppercase mb-3 text-white/70">🇬🇭 Accra, Ghana</div>
        <h1 className="text-5xl md:text-6xl font-black mb-2 leading-tight text-white">
          <span className="text-yellow-400">Phoenix</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            International
          </span>
        </h1>
        <p className="text-lg font-bold text-white/90 mb-1">School Management System</p>
        <p className="text-sm mb-2 text-white/70">
          The Pace Setters · Est. 2006 · Crèche through JHS 3
        </p>

        <div className="flex gap-4 justify-center mt-6 mb-12">
          <Link href="/login" className="btn-gold text-base px-8 py-3">Sign In →</Link>
          <Link href="/library"
            className="btn-outline text-base px-8 py-3">Library Kiosk</Link>
        </div>

        {/* Portal cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full">
          {PORTALS.map((p) => (
            <Link key={p.href} href={p.href}
              className="rounded-2xl p-4 flex flex-col gap-2 card-hover text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${p.from}, ${p.to})`,
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(30%,-30%)" }} />
              <span className="text-3xl relative">{p.icon}</span>
              <div className="font-black text-white text-xs relative">{p.label}</div>
              <div className="text-[10px] relative text-white/60">{p.sub}</div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="py-4 text-center text-xs border-t border-white/10 text-white/50">
        Phoenix International School Ghana © 2026 · All rights reserved
      </footer>
    </div>
  );
}
