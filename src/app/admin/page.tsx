import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const navItems = [
  { icon: "📊", label: "Overview", href: "/admin" },
  { icon: "🎒", label: "Students", href: "/admin#students" },
  { icon: "💳", label: "Fee Management", href: "/admin#fees" },
  { icon: "👩‍🏫", label: "Staff & Payroll", href: "/admin#staff" },
  { icon: "📡", label: "Attendance", href: "/admin#attendance" },
  { icon: "📢", label: "Announcements", href: "/admin#announcements" },
  { icon: "🏦", label: "Canteen Wallet", href: "/admin#canteen" },
  { icon: "🎓", label: "BECE Tracking", href: "/admin#bece" },
  { icon: "⚙️", label: "Settings", href: "/admin#settings" },
];

const stats = [
  { label: "Total Students", value: "612", icon: "🎒", color: "#003087", change: "+14 this term", bg: "rgba(0,48,135,0.08)" },
  { label: "Fees Collected", value: "GH₵84,200", icon: "💳", color: "#22c55e", change: "78% of target", bg: "rgba(34,197,94,0.08)" },
  { label: "Outstanding Fees", value: "GH₵23,600", icon: "⚠️", color: "#ef4444", change: "38 students", bg: "rgba(239,68,68,0.08)" },
  { label: "Today's Attendance", value: "94.2%", icon: "✅", color: "#00D4FF", change: "576 / 612 present", bg: "rgba(0,212,255,0.08)" },
  { label: "Staff on Duty", value: "48", icon: "👩‍🏫", color: "#8b5cf6", change: "2 on leave", bg: "rgba(139,92,246,0.08)" },
  { label: "BECE Readiness", value: "JHS 3: 71%", icon: "🎓", color: "#FFD700", change: "Avg aggregate: 14", bg: "rgba(255,215,0,0.08)" },
];

const recentPayments = [
  { name: "Kwame Asante", class: "JHS 2A", amount: "GH₵800", via: "MTN MoMo", time: "9:02 AM", status: "Cleared" },
  { name: "Ama Boateng", class: "Primary 5B", amount: "GH₵650", via: "Telecel Cash", time: "9:48 AM", status: "Cleared" },
  { name: "Kofi Mensah", class: "JHS 3A", amount: "GH₵800", via: "MTN MoMo", time: "10:15 AM", status: "Cleared" },
  { name: "Efua Owusu", class: "Crèche", amount: "GH₵400", via: "AT Money", time: "11:00 AM", status: "Cleared" },
  { name: "Nana Appiah", class: "KG 2", amount: "GH₵500", via: "MTN MoMo", time: "11:30 AM", status: "Cleared" },
  { name: "Yaa Darko", class: "Primary 3A", amount: "GH₵650", via: "Telecel Cash", time: "12:05 PM", status: "Pending" },
];

const levelBreakdown = [
  { level: "Crèche", count: 42, color: "#FFD700" },
  { level: "Nursery 1 & 2", count: 68, color: "#00D4FF" },
  { level: "KG 1 & 2", count: 95, color: "#22c55e" },
  { level: "Primary 1–6", count: 284, color: "#003087" },
  { level: "JHS 1", count: 54, color: "#8b5cf6" },
  { level: "JHS 2", count: 42, color: "#f59e0b" },
  { level: "JHS 3", count: 27, color: "#ef4444" },
];

export default function AdminDashboard() {
  return (
    <DashboardShell title="Admin Dashboard" subtitle="Phoenix International School · Term 2, 2026"
      role="Admin" roleColor="#003087" navItems={navItems}>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="feature-icon w-11 h-11 rounded-xl text-xl" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: s.bg, color: s.color }}>{s.change}</div>
            </div>
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Payments */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Recent Payments</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              Today
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Student</th>
                  <th className="text-left pb-3 font-semibold">Class</th>
                  <th className="text-left pb-3 font-semibold">Amount</th>
                  <th className="text-left pb-3 font-semibold">Via</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.name} className="table-row border-t border-gray-50">
                    <td className="py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="py-3 text-gray-500">{p.class}</td>
                    <td className="py-3 font-bold text-gray-900">{p.amount}</td>
                    <td className="py-3 text-gray-500 text-xs">{p.via}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-bold"
                        style={p.status === "Cleared"
                          ? { background: "rgba(34,197,94,0.1)", color: "#22c55e" }
                          : { background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Students by Level</h3>
          <div className="space-y-3">
            {levelBreakdown.map((l) => {
              const pct = Math.round((l.count / 612) * 100);
              return (
                <div key={l.level}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{l.level}</span>
                    <span className="font-bold text-gray-900">{l.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: l.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "📲", label: "Send Bulk SMS", color: "#003087", bg: "rgba(0,48,135,0.08)" },
            { icon: "🔒", label: "Lock Defaulters", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
            { icon: "📄", label: "Generate Reports", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
            { icon: "➕", label: "Add Student", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          ].map((a) => (
            <button key={a.label} className="flex flex-col items-center gap-2 p-4 rounded-xl card-hover text-center"
              style={{ background: a.bg }}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-bold" style={{ color: a.color }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fee Hard-Lock Banner */}
      <div className="mt-6 rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))", border: "1px solid rgba(239,68,68,0.2)" }}>
        <span className="text-3xl">🔒</span>
        <div className="flex-1">
          <div className="font-black text-gray-900 mb-1">38 students with outstanding fees</div>
          <div className="text-sm text-gray-500">Report cards and BECE mock results are automatically hard-locked for these students until payment is cleared.</div>
        </div>
        <button className="btn-gold text-xs whitespace-nowrap">Send MoMo Reminder</button>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Switch to Teacher Portal", href: "/teacher", icon: "👩‍🏫", color: "#003087" },
          { label: "Switch to Parent Portal", href: "/parent", icon: "👨‍👩‍👧", color: "#1565C0" },
          { label: "Switch to Student Portal", href: "/student", icon: "🎒", color: "#E5B800" },
          { label: "BECE Simulator", href: "/bece", icon: "🎓", color: "#8b5cf6" },
        ].map((l) => (
          <Link key={l.href} href={l.href}
            className="glass rounded-xl p-4 flex items-center gap-2 text-sm font-semibold card-hover"
            style={{ color: l.color }}>
            <span className="text-xl">{l.icon}</span>{l.label}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
