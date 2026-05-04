"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import type { UserRole } from "@/lib/types";
import toast from "react-hot-toast";

interface NavItem { icon: string; label: string; href: string }

interface Props {
  role: UserRole
  navItems: NavItem[]
  children: React.ReactNode
}

const ROLE_META: Record<UserRole, { title: string; color: string; icon: string }> = {
  admin:   { title: "Admin Portal",   color: "#1A3FA0", icon: "🏛️" },
  teacher: { title: "Teacher Portal", color: "#6B21A8", icon: "👩‍🏫" },
  parent:  { title: "Parent Portal",  color: "#2B55C9", icon: "👨‍👩‍👧" },
  student: { title: "Student Portal", color: "#8B35E0", icon: "🎒" },
}

export default function DashboardShell({ role, navItems, children }: Props) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const changeAccountPassword = useAppStore((s) => s.changeAccountPassword);
  const meta = ROLE_META[role];

  const [isLibraryMode, setIsLibraryMode] = useState(false);
  const [showPwChange, setShowPwChange] = useState(false);
  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return }
    if (!loading && user && user.role !== role) { router.replace(`/${user.role}`); }
  }, [user, loading, role, router]);

  // Library mode: detect + 5-min inactivity auto-logout
  useEffect(() => {
    const lib = sessionStorage.getItem("library_mode") === "1";
    setIsLibraryMode(lib);
    if (!lib) return;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await logout();
        sessionStorage.removeItem("library_mode");
        toast("Session ended — inactivity timeout", { icon: "🖥️" });
        router.replace("/library");
      }, 5 * 60 * 1000);
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [logout, router]);

  // Force password change on first login
  useEffect(() => {
    const forcePwId = localStorage.getItem("phoenix-force-pw-change");
    if (forcePwId) setShowPwChange(true);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <img src="/logo.svg" alt="Phoenix" className="w-20 h-24 object-contain animate-float opacity-80" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    router.replace("/login");
  };

  const handleEndLibrarySession = async () => {
    await logout();
    sessionStorage.removeItem("library_mode");
    toast.success("Library session ended. Thank you!");
    router.replace("/library");
  };

  const handlePwChange = () => {
    if (pwForm.password.length < 6) { toast.error("Minimum 6 characters"); return; }
    if (pwForm.password !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    const forcePwId = localStorage.getItem("phoenix-force-pw-change");
    if (forcePwId) {
      changeAccountPassword(forcePwId, pwForm.password);
      localStorage.removeItem("phoenix-force-pw-change");
    }
    setShowPwChange(false);
    setPwForm({ password: "", confirm: "" });
    toast.success("Password set successfully — welcome aboard!");
  };

  return (
    <div className="flex" style={{ background: "#F4F2FF" }}>
      {/* Force-password-change modal — blocks entire UI until done */}
      {showPwChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(10,22,40,0.92)" }}>
          <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "#0C0A1E", border: "1px solid rgba(168,85,247,0.35)" }}>
            <div className="text-4xl text-center mb-5">🔐</div>
            <h2 className="font-black text-white text-xl text-center mb-1">Set Your Password</h2>
            <p className="text-blue-300 text-xs text-center mb-6">
              Your account was just created by school admin. Please set a personal password before you continue.
            </p>
            <div className="space-y-3 mb-6">
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={pwForm.password}
                onChange={(e) => setPwForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              <input
                type="password"
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handlePwChange()}
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
            </div>
            <button type="button" onClick={handlePwChange} className="btn-gold w-full py-3 text-sm font-black">
              Set Password &amp; Continue →
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "#0C0A1E", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <img src="/logo.svg" alt="Phoenix crest" className="w-9 h-11 object-contain shrink-0" />
            <div>
              <div className="text-white font-black text-xs leading-tight">Phoenix International</div>
              <div className="text-[10px]" style={{ color: "#C4B5FD" }}>School Ghana</div>
            </div>
          </Link>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: meta.color }}>
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{user.full_name}</div>
              <div className="text-[11px] font-bold px-1.5 py-0.5 rounded-full inline-block"
                style={{ background: meta.color + "25", color: meta.color }}>
                {meta.icon} {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = path === item.href || (item.href !== `/${role}` && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? meta.color + "18" : "transparent",
                  color: active ? meta.color : "rgba(255,255,255,0.6)",
                  borderLeft: active ? `3px solid ${meta.color}` : "3px solid transparent",
                  fontWeight: active ? 700 : 500,
                }}>
                <span className="text-base">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-blue-400 hover:text-white rounded-xl transition-colors">
            🏠 School Home
          </Link>
          {isLibraryMode && (
            <button type="button" onClick={handleEndLibrarySession}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-colors text-left"
              style={{ color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)" }}>
              🖥️ End Library Session
            </button>
          )}
          <button type="button" onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-xl transition-colors text-left">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{ background: "#0C0A1E", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Phoenix" className="w-7 h-8 object-contain" />
          <span className="text-white font-black text-sm">Phoenix</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: meta.color + "25", color: meta.color }}>
            {meta.icon} {role}
          </span>
          {isLibraryMode && (
            <button type="button" onClick={handleEndLibrarySession} className="text-yellow-400 text-xs font-bold">End</button>
          )}
          <button type="button" onClick={handleLogout} className="text-red-400 text-xs font-bold">Out</button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 min-h-screen">
        <main className="p-4 md:p-6 pt-20 md:pt-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
