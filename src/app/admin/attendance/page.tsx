"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";

type Tab = "sheet" | "report" | "lateness";

const STATUS_META: Record<string, { bg: string; color: string; label: string; emoji: string }> = {
  present: { bg: "rgba(34,197,94,0.1)",  color: "#22c55e", label: "Present", emoji: "✅" },
  late:    { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Late",    emoji: "⏰" },
  absent:  { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", label: "Absent",  emoji: "❌" },
  excused: { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Excused", emoji: "🩺" },
};

export default function AttendanceAdminPage() {
  const attendance = useAppStore((s) => s.attendance);
  const students   = useAppStore((s) => s.students);
  const classes    = useAppStore((s) => s.classes);
  const markParentNotified = useAppStore((s) => s.markParentNotified);

  const [tab, setTab] = useState<Tab>("sheet");
  const today = new Date().toISOString().split("T")[0];

  // Sheet tab state
  const [date, setDate] = useState(today);
  const [classFilter, setClassFilter] = useState("all");

  // Report tab state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportClass, setReportClass] = useState("all");

  // Lateness tab state
  const [latenessClass, setLatenessClass] = useState("all");
  const [latenessFromDate, setLatenessFromDate] = useState("");

  // ── Sheet derived ──
  const dayRecords = useMemo(() => attendance.filter((a) =>
    a.date === date && (classFilter === "all" || a.class_name === classFilter),
  ), [attendance, date, classFilter]);

  const counts = useMemo(() => ({
    present: dayRecords.filter((a) => a.status === "present").length,
    late:    dayRecords.filter((a) => a.status === "late").length,
    absent:  dayRecords.filter((a) => a.status === "absent").length,
    excused: dayRecords.filter((a) => a.status === "excused").length,
  }), [dayRecords]);

  const absentUnnotified = dayRecords.filter((a) => a.status === "absent" && !a.parent_notified);

  // ── Report derived ──
  const reportRecords = useMemo(() => attendance.filter((a) => {
    if (reportClass !== "all" && a.class_name !== reportClass) return false;
    if (fromDate && a.date < fromDate) return false;
    if (toDate && a.date > toDate) return false;
    return true;
  }), [attendance, reportClass, fromDate, toDate]);

  const reportByClass = useMemo(() => {
    const map = new Map<string, { present: number; late: number; absent: number; excused: number; total: number }>();
    for (const r of reportRecords) {
      const cur = map.get(r.class_name) ?? { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
      cur[r.status as 'present' | 'late' | 'absent' | 'excused']++;
      cur.total++;
      map.set(r.class_name, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [reportRecords]);

  const reportByStudent = useMemo(() => {
    const map = new Map<string, { name: string; class_name: string; present: number; late: number; absent: number; excused: number; total: number }>();
    for (const r of reportRecords) {
      const key = r.student_id;
      const cur = map.get(key) ?? { name: r.student_name ?? "?", class_name: r.class_name, present: 0, late: 0, absent: 0, excused: 0, total: 0 };
      cur[r.status as 'present' | 'late' | 'absent' | 'excused']++;
      cur.total++;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [reportRecords]);

  // ── Lateness derived ──
  const latenessRecords = useMemo(() => attendance.filter((a) => {
    if (a.status !== "late") return false;
    if (latenessClass !== "all" && a.class_name !== latenessClass) return false;
    if (latenessFromDate && a.date < latenessFromDate) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date)), [attendance, latenessClass, latenessFromDate]);

  const repeatLateOffenders = useMemo(() => {
    const map = new Map<string, { name: string; class_name: string; count: number; dates: string[] }>();
    for (const r of latenessRecords) {
      const cur = map.get(r.student_id) ?? { name: r.student_name ?? "?", class_name: r.class_name, count: 0, dates: [] };
      cur.count++;
      cur.dates.push(r.date);
      map.set(r.student_id, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .filter((r) => r.count >= 3)
      .sort((a, b) => b.count - a.count);
  }, [latenessRecords]);

  const tabs: Array<{ key: Tab; label: string; emoji: string }> = [
    { key: "sheet",    label: "Attendance Sheet",  emoji: "📋" },
    { key: "report",   label: "Attendance Report", emoji: "📊" },
    { key: "lateness", label: "Lateness Report",   emoji: "⏰" },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <header className="mb-5">
        <h1 className="text-2xl font-black text-white">📡 Attendance</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
          Mark today&apos;s attendance, generate summaries by class or student, and spot lateness patterns early.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
            style={{
              background: tab === t.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
              color: tab === t.key ? "white" : "rgba(196,181,253,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === "sheet" && (
        <>
          <div className="flex gap-3 mb-5 flex-wrap">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none" />
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
              <option value="all">All Classes</option>
              {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="glass rounded-2xl p-4">
              <div className="text-xl mb-1">📋</div>
              <div className="text-2xl font-black text-indigo-700">{dayRecords.length}</div>
              <div className="text-xs text-gray-500">Total marked</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xl mb-1">✅</div>
              <div className="text-2xl font-black text-emerald-700">{counts.present}</div>
              <div className="text-xs text-gray-500">Present</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xl mb-1">⏰</div>
              <div className="text-2xl font-black text-amber-600">{counts.late}</div>
              <div className="text-xs text-gray-500">Late</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xl mb-1">❌</div>
              <div className="text-2xl font-black text-red-600">{counts.absent}</div>
              <div className="text-xs text-gray-500">Absent</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-xl mb-1">📵</div>
              <div className="text-2xl font-black text-orange-600">{absentUnnotified.length}</div>
              <div className="text-xs text-gray-500">Not Notified</div>
            </div>
          </div>

          {absentUnnotified.length > 0 && (
            <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <span className="text-xl">📲</span>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{absentUnnotified.length} absent — parents not yet notified</div>
                <div className="text-xs" style={{ color: "rgba(196,181,253,0.7)" }}>Mark as notified once SMS/call sent to parent.</div>
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
                    const st = STATUS_META[a.status] ?? STATUS_META.excused;
                    const student = students.find((s) => s.id === a.student_id);
                    return (
                      <tr key={a.id} className="table-row border-t border-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{a.student_name ?? student?.full_name}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{a.class_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                            {st.emoji} {st.label}
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
        </>
      )}

      {tab === "report" && (
        <>
          <div className="glass rounded-2xl p-4 flex gap-3 flex-wrap items-end mb-5">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="block px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="block px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Class</label>
              <select value={reportClass} onChange={(e) => setReportClass(e.target.value)} className="block px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                <option value="all">All classes</option>
                {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button type="button" className="text-xs px-3 py-2 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setFromDate(""); setToDate(""); setReportClass("all"); }}>Clear</button>
            <p className="text-xs ml-auto self-center" style={{ color: "rgba(196,181,253,0.7)" }}>
              {reportRecords.length} record{reportRecords.length === 1 ? "" : "s"} in range
            </p>
          </div>

          <div className="glass rounded-2xl p-5 mb-5">
            <h3 className="font-black text-gray-900 mb-3">By Class</h3>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Class</th>
                  <th className="text-right py-2">✅ Present</th>
                  <th className="text-right py-2">⏰ Late</th>
                  <th className="text-right py-2">❌ Absent</th>
                  <th className="text-right py-2">🩺 Excused</th>
                  <th className="text-right py-2">% Present</th>
                </tr>
              </thead>
              <tbody>
                {reportByClass.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No data in range.</td></tr>}
                {reportByClass.map((r) => {
                  const pct = r.total > 0 ? Math.round(((r.present + r.late) / r.total) * 100) : 0;
                  return (
                    <tr key={r.name} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{r.name}</td>
                      <td className="py-2 text-right font-mono text-emerald-700">{r.present}</td>
                      <td className="py-2 text-right font-mono text-amber-600">{r.late}</td>
                      <td className="py-2 text-right font-mono text-red-600">{r.absent}</td>
                      <td className="py-2 text-right font-mono text-gray-600">{r.excused}</td>
                      <td className="py-2 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? "#22c55e" : pct >= 75 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className="font-bold w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-black text-gray-900 mb-3">By Student (top 30 by lowest attendance)</h3>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Class</th>
                  <th className="text-right py-2">Present</th>
                  <th className="text-right py-2">Late</th>
                  <th className="text-right py-2">Absent</th>
                  <th className="text-right py-2">% Attended</th>
                </tr>
              </thead>
              <tbody>
                {reportByStudent.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No data in range.</td></tr>}
                {reportByStudent
                  .map((r) => ({ ...r, pct: r.total > 0 ? (r.present + r.late) / r.total : 1 }))
                  .sort((a, b) => a.pct - b.pct)
                  .slice(0, 30)
                  .map((r) => {
                    const pct = Math.round(r.pct * 100);
                    return (
                      <tr key={r.id} className="border-b border-gray-50">
                        <td className="py-2 font-bold text-gray-800">{r.name}</td>
                        <td className="py-2 text-gray-600">{r.class_name}</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{r.present}</td>
                        <td className="py-2 text-right font-mono text-amber-600">{r.late}</td>
                        <td className="py-2 text-right font-mono text-red-600">{r.absent}</td>
                        <td className="py-2 text-right">
                          <div className="inline-flex items-center gap-1.5 text-xs">
                            <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? "#22c55e" : pct >= 75 ? "#f59e0b" : "#ef4444" }} />
                            </div>
                            <span className="font-bold w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "lateness" && (
        <>
          <div className="glass rounded-2xl p-4 flex gap-3 flex-wrap items-end mb-5">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From date</label>
              <input type="date" value={latenessFromDate} onChange={(e) => setLatenessFromDate(e.target.value)} className="block px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Class</label>
              <select value={latenessClass} onChange={(e) => setLatenessClass(e.target.value)} className="block px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                <option value="all">All classes</option>
                {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button type="button" className="text-xs px-3 py-2 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setLatenessFromDate(""); setLatenessClass("all"); }}>Clear</button>
            <p className="text-xs ml-auto self-center" style={{ color: "rgba(196,181,253,0.7)" }}>
              {latenessRecords.length} late record{latenessRecords.length === 1 ? "" : "s"}
            </p>
          </div>

          {repeatLateOffenders.length > 0 && (
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <p className="font-black text-white text-sm mb-2">🚨 Repeat lateness ({repeatLateOffenders.length} student{repeatLateOffenders.length === 1 ? "" : "s"} late 3+ times)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {repeatLateOffenders.slice(0, 6).map((r) => (
                  <div key={r.id} className="glass rounded-xl p-3">
                    <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.class_name}</p>
                    <p className="text-xs mt-1"><span className="font-bold text-amber-700">{r.count}× late</span> · latest {r.dates[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5">
            <h3 className="font-black text-gray-900 mb-3">Lateness Log</h3>
            {latenessRecords.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">
                <span className="block text-4xl mb-2">🎉</span>
                No late records in this window.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Student</th>
                    <th className="text-left py-2">Class</th>
                    <th className="text-left py-2">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {latenessRecords.slice(0, 200).map((r) => (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-xs text-gray-500">{r.date}</td>
                      <td className="py-2 font-bold text-gray-800">{r.student_name}</td>
                      <td className="py-2 text-gray-600">{r.class_name}</td>
                      <td className="py-2 text-xs text-gray-500">
                        {r.context === "bus" ? "🚌 Bus" : "🏫 Classroom"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
