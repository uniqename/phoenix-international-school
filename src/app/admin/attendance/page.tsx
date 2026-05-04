"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES } from "@/lib/utils";

const NAV = [
  { icon: "📊", label: "Overview",       href: "/admin" },
  { icon: "🎒", label: "Students",       href: "/admin/students" },
  { icon: "💳", label: "Fee Management", href: "/admin/fees" },
  { icon: "👩‍🏫", label: "Staff",         href: "/admin/staff" },
  { icon: "💼", label: "Payroll",         href: "/admin/payroll" },
  { icon: "📡", label: "Attendance",      href: "/admin/attendance" },
  { icon: "🏦", label: "Canteen Wallet",  href: "/admin/canteen" },
  { icon: "📢", label: "Announcements",   href: "/admin/announcements" },
  { icon: "📸", label: "School Feed",     href: "/admin/feed" },
  { icon: "🔑", label: "Accounts",        href: "/admin/accounts" },
  { icon: "❓", label: "Question Bank", href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

export default function AttendanceAdminPage() {
  const attendance = useAppStore((s) => s.attendance);
  const students   = useAppStore((s) => s.students);
  const markParentNotified = useAppStore((s) => s.markParentNotified);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]         = useState(today);
  const [classFilter, setClass] = useState("all");

  const dayRecords = attendance.filter((a) => a.date === date && (classFilter === "all" || a.class_name === classFilter));
  const present    = dayRecords.filter((a) => a.status === "present" || a.status === "late").length;
  const absent     = dayRecords.filter((a) => a.status === "absent").length;
  const absentUnnotified = dayRecords.filter((a) => a.status === "absent" && !a.parent_notified);

  const statusStyle = (status: string) => {
    if (status === "present") return { bg: "rgba(34,197,94,0.1)",  color: "#22c55e",  label: "Present" };
    if (status === "late")    return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b",  label: "Late" };
    if (status === "absent")  return { bg: "rgba(239,68,68,0.1)",  color: "#ef4444",  label: "Absent" };
    return                           { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Excused" };
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <h2 className="text-xl font-black text-white mb-6">Attendance Overview</h2>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none" />
        <select value={classFilter} onChange={(e) => setClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
          <option value="all">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Records",  value: dayRecords.length, color: "#003087", icon: "📋" },
          { label: "Present",  value: present,           color: "#22c55e", icon: "✅" },
          { label: "Absent",   value: absent,            color: "#ef4444", icon: "❌" },
          { label: "Not Notified", value: absentUnnotified.length, color: "#f59e0b", icon: "📵" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {absentUnnotified.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="text-xl">📲</span>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-sm">{absentUnnotified.length} absent — parents not yet notified</div>
            <div className="text-xs text-gray-500">Mark as notified once SMS/call sent to parent.</div>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#0A1628" }}>
              <tr className="text-xs text-blue-300 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-semibold">Student</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Parent Notified</th>
              </tr>
            </thead>
            <tbody>
              {dayRecords.length > 0 ? dayRecords.map((a) => {
                const st = statusStyle(a.status);
                const student = students.find((s) => s.id === a.student_id);
                return (
                  <tr key={a.id} className="table-row border-t border-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{a.student_name ?? student?.full_name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{a.class_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === "absent" ? (
                        a.parent_notified
                          ? <span className="text-xs font-bold text-green-600">✅ Notified</span>
                          : <button type="button" onClick={() => markParentNotified(a.id)}
                              className="text-xs font-bold px-2 py-1 rounded-full"
                              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                              Mark Notified
                            </button>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No attendance records for this date/class.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
