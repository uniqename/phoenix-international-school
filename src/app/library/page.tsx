"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

const ROLES: {
  role: UserRole; icon: string; label: string; desc: string;
  from: string; to: string; items: string[]
}[] = [
  {
    role: "admin",
    icon: "🏛️",
    label: "Admin",
    from: "#0C0A1E", to: "#1A3FA0",
    desc: "School management & records",
    items: ["Student records", "Fee management", "Staff & payroll", "Announcements"],
  },
  {
    role: "teacher",
    icon: "👩‍🏫",
    label: "Teacher",
    from: "#1E0B42", to: "#6B21A8",
    desc: "Manage your classes",
    items: ["Gradebook & mark entry", "Attendance recording", "Assign homework", "Lesson planning"],
  },
  {
    role: "parent",
    icon: "👨‍👩‍👧",
    label: "Parent",
    from: "#0D1E5C", to: "#2B55C9",
    desc: "View your child's progress",
    items: ["Grades & report cards", "Fee balance & payments", "Homework status", "School announcements"],
  },
  {
    role: "student",
    icon: "🎒",
    label: "Student",
    from: "#2D0F5C", to: "#8B35E0",
    desc: "Access your portal",
    items: ["Submit homework files", "Check your grades", "BECE practice quizzes", "School feed"],
  },
];

export default function LibraryPage() {
  const { loginAsRole } = useAuth();
  const router = useRouter();
  const [entering, setEntering] = useState<UserRole | null>(null);

  useEffect(() => {
    sessionStorage.setItem("library_mode", "1");
  }, []);

  const enter = (role: UserRole) => {
    setEntering(role);
    loginAsRole(role);
    router.push(`/${role}`);
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Phoenix International School crest"
            className="w-10 h-12 object-contain" />
          <div>
            <div className="text-white font-black text-sm leading-tight">Phoenix International School Ghana</div>
            <div className="text-xs font-semibold" style={{ color: "#C4B5FD" }}>
              The Pace Setters · Est. 2006
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(139,53,224,0.18)", color: "#C4B5FD", border: "1px solid rgba(139,53,224,0.35)" }}>
          🖥️ Library Kiosk &nbsp;·&nbsp; Session auto-ends after 5 min idle
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">

        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-widest uppercase mb-3"
            style={{ color: "#C4B5FD" }}>Welcome to the school library kiosk</p>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">Who are you today?</h1>
          <p className="text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
            Select your role to open your portal on this shared computer.
          </p>
        </div>

        {/* Role cards — 1 col → 2 col → 4 col */}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {ROLES.map(({ role, icon, label, desc, from, to, items }) => (
            <button
              key={role}
              type="button"
              onClick={() => enter(role)}
              disabled={!!entering}
              className="rounded-2xl p-6 text-left flex flex-col transition-all hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 group relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${from}, ${to})`,
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: entering ? "wait" : "pointer",
              }}>
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10"
                style={{ background: "white", transform: "translate(35%, -35%)" }} />

              <div className="text-4xl mb-4 relative">{icon}</div>
              <div className="font-black text-white text-xl mb-0.5 relative">{label}</div>
              <div className="text-xs mb-4 relative" style={{ color: "rgba(255,255,255,0.65)" }}>{desc}</div>

              <ul className="flex-1 space-y-1.5 mb-5 relative">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "rgba(255,255,255,0.75)" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>›</span> {item}
                  </li>
                ))}
              </ul>

              <div className="text-xs font-black px-4 py-2 rounded-xl text-center relative transition-all"
                style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                {entering === role ? "Opening…" : `Enter as ${label} →`}
              </div>
            </button>
          ))}
        </div>

        {/* Rules strip */}
        <div className="w-full max-w-6xl rounded-2xl p-4 grid sm:grid-cols-4 gap-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { icon: "⏱️", text: "Session closes after 5 min of inactivity" },
            { icon: "🖥️", text: "Click \"End Library Session\" when you're done" },
            { icon: "🔒", text: "Never save your personal password on this computer" },
            { icon: "☁️", text: "All submissions are saved and sync to the school server" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(196,181,253,0.7)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-3 text-[11px] border-t border-white/5"
        style={{ color: "rgba(196,181,253,0.4)" }}>
        Phoenix International School Ghana &nbsp;·&nbsp; Library Shared Access Terminal
      </footer>
    </div>
  );
}
