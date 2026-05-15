"use client";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";


export default function AdminOverview() {
  const students  = useAppStore((s) => s.students);
  const fees      = useAppStore((s) => s.fees);
  const payments  = useAppStore((s) => s.payments);
  const teachers  = useAppStore((s) => s.teachers);
  const attendance = useAppStore((s) => s.attendance);

  const today = new Date().toISOString().split("T")[0];
  const todayAtt = attendance.filter((a) => a.date === today);
  const presentToday = todayAtt.filter((a) => a.status === "present" || a.status === "late").length;
  const outstanding = fees.filter((f) => f.status !== "cleared");
  const feesCollected = payments.reduce((s, p) => s + p.amount, 0);
  const feesOutstanding = outstanding.reduce((s, f) => s + (f.amount - f.paid_amount), 0);

  const recentPayments = [...payments].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()).slice(0, 6);

  const levelBreakdown = [
    { level: "Crèche",       count: students.filter((s) => s.level === "creche").length,  color: "#FFD700" },
    { level: "Nursery",      count: students.filter((s) => s.level === "nursery").length, color: "#00D4FF" },
    { level: "KG",           count: students.filter((s) => s.level === "kg").length,      color: "#22c55e" },
    { level: "Primary",      count: students.filter((s) => s.level === "primary").length, color: "#003087" },
    { level: "JHS",          count: students.filter((s) => s.level === "jhs").length,     color: "#8b5cf6" },
  ];

  const methodLabel: Record<string, string> = { mtn_momo: "MTN MoMo", telecel: "Telecel", at_money: "AT Money", cash: "Cash", bank: "Bank" };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <h2 className="text-xl font-black text-white mb-6">School Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Students",    value: students.length,              icon: "🎒", color: "#003087", sub: "Crèche → JHS 3" },
          { label: "Fees Collected",    value: `GH₵${feesCollected.toLocaleString()}`, icon: "💳", color: "#22c55e", sub: "This term" },
          { label: "Outstanding Fees",  value: `GH₵${feesOutstanding.toLocaleString()}`, icon: "⚠️", color: "#ef4444", sub: `${outstanding.length} students` },
          { label: "Today's Attendance",value: todayAtt.length ? `${Math.round((presentToday / todayAtt.length) * 100)}%` : "—", icon: "✅", color: "#00D4FF", sub: `${presentToday}/${todayAtt.length} present` },
          { label: "Teaching Staff",    value: teachers.length,              icon: "👩‍🏫", color: "#8b5cf6", sub: "Active teachers" },
          { label: "Fee Defaulters",    value: outstanding.length,           icon: "🔒", color: "#f59e0b", sub: "Results hard-locked" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 card-hover">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-bold text-gray-600">{s.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Recent Payments</h3>
            <Link href="/admin/fees" className="text-xs text-blue-600 font-bold hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-2 font-semibold">Student</th>
                  <th className="text-left pb-2 font-semibold">Amount</th>
                  <th className="text-left pb-2 font-semibold">Via</th>
                  <th className="text-left pb-2 font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="table-row border-t border-gray-50">
                    <td className="py-2.5 font-semibold text-gray-800">{p.student_name}<div className="text-gray-400 font-normal">{p.class_name}</div></td>
                    <td className="py-2.5 font-black text-green-600">GH₵{p.amount.toLocaleString()}</td>
                    <td className="py-2.5 text-gray-500">{methodLabel[p.method]}</td>
                    <td className="py-2.5 font-mono text-gray-500">{p.receipt_number}</td>
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
            {levelBreakdown.map((l) => (
              <div key={l.level}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{l.level}</span>
                  <span className="font-black text-gray-900">{l.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${students.length ? (l.count / students.length) * 100 : 0}%`, background: l.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "➕", label: "Add Student",    href: "/admin/students", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
            { icon: "💳", label: "Record Payment", href: "/admin/fees",     color: "#003087", bg: "rgba(0,48,135,0.08)" },
            { icon: "📢", label: "Send Announcement", href: "/admin/announcements", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
            { icon: "💼", label: "Run Payroll",    href: "/admin/payroll",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl card-hover text-center"
              style={{ background: a.bg }}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-bold" style={{ color: a.color }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hard-lock alert */}
      {outstanding.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-4 mb-4"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="text-2xl">🔒</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-gray-900 text-sm">{outstanding.length} students with outstanding fees</div>
            <div className="text-xs text-gray-500">Report cards & BECE mock results are automatically blocked until payment is cleared.</div>
          </div>
          <Link href="/admin/fees" className="btn-gold text-xs whitespace-nowrap py-2 px-4">Manage Fees →</Link>
        </div>
      )}
    </DashboardShell>
  );
}
