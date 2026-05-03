"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem { icon: string; label: string; href: string; }

interface Props {
  title: string;
  subtitle: string;
  role: string;
  roleColor: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function DashboardShell({ title, subtitle, role, roleColor, navItems, children }: Props) {
  const path = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4ff" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen"
        style={{ background: "#0A1628", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg,#FFD700,#E5B800)" }}>🦅</div>
            <div>
              <div className="text-white font-bold text-xs leading-tight">Phoenix International</div>
              <div className="text-blue-400 text-[10px]">School Ghana</div>
            </div>
          </Link>
          <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: roleColor + "20" }}>
              {role === "Admin" ? "🏛️" : role === "Teacher" ? "👩‍🏫" : role === "Parent" ? "👨‍👩‍👧" : "🎒"}
            </div>
            <div>
              <div className="text-white text-xs font-bold">{title}</div>
              <div className="text-[11px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                style={{ background: roleColor + "20", color: roleColor }}>
                {role}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? roleColor + "15" : "transparent",
                  color: active ? roleColor : "rgba(255,255,255,0.65)",
                  borderLeft: active ? `3px solid ${roleColor}` : "3px solid transparent",
                  fontWeight: active ? 700 : 500,
                }}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-blue-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 flex items-center justify-between px-6"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,48,135,0.1)" }}>
          <div>
            <div className="font-black text-gray-900 text-sm">{title}</div>
            <div className="text-xs text-gray-400">{subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: roleColor }}>
              {title.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
