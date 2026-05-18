"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";

type ReportType = "summary" | "by-class" | "by-particular" | "defaulters" | "transactions";

const REPORT_OPTIONS: Array<{ key: ReportType; label: string; emoji: string; description: string }> = [
  { key: "summary",       label: "Finance Summary",       emoji: "📊", description: "School-wide collected, outstanding, and txn totals" },
  { key: "by-class",      label: "Collection by Class",   emoji: "🎒", description: "Billed / collected / outstanding broken down by class" },
  { key: "by-particular", label: "Collection by Fee",     emoji: "📑", description: "How much each fee particular has earned" },
  { key: "defaulters",    label: "Fee Defaulters",        emoji: "🚨", description: "Students with outstanding balance > 0" },
  { key: "transactions",  label: "Transactions Log",      emoji: "📜", description: "All payments in the selected date range" },
];

export default function FeeReportsPage() {
  const fees = useAppStore((s) => s.fees);
  const payments = useAppStore((s) => s.payments);
  const students = useAppStore((s) => s.students);
  const classes = useAppStore((s) => s.classes);

  const [type, setType] = useState<ReportType>("summary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredPayments = useMemo(() => {
    let pays = payments;
    if (fromDate) pays = pays.filter((p) => p.paid_at >= fromDate);
    if (toDate) pays = pays.filter((p) => p.paid_at <= `${toDate}T23:59:59Z`);
    return pays;
  }, [payments, fromDate, toDate]);

  const totalBilled = fees.reduce((s, f) => s + f.amount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.paid_amount, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const totalInRange = filteredPayments.reduce((s, p) => s + p.amount, 0);

  // By-class breakdown
  const byClass = useMemo(() => {
    const map = new Map<string, { billed: number; collected: number; students: number }>();
    for (const c of classes) map.set(c.name, { billed: 0, collected: 0, students: 0 });
    for (const s of students) {
      const cur = map.get(s.class_name);
      if (cur) cur.students += 1;
    }
    for (const f of fees) {
      const cur = map.get(f.class_name ?? "");
      if (cur) { cur.billed += f.amount; cur.collected += f.paid_amount; }
    }
    return Array.from(map.entries())
      .filter(([, v]) => v.students > 0 || v.billed > 0)
      .map(([name, v]) => ({ name, ...v }));
  }, [fees, students, classes]);

  // By-particular breakdown
  const byParticular = useMemo(() => {
    const map = new Map<string, { billed: number; collected: number; count: number }>();
    for (const f of fees) {
      const cur = map.get(f.fee_type) ?? { billed: 0, collected: 0, count: 0 };
      cur.billed += f.amount;
      cur.collected += f.paid_amount;
      cur.count += 1;
      map.set(f.fee_type, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.billed - a.billed);
  }, [fees]);

  // Defaulters
  const defaulters = useMemo(() => {
    const studentMap = new Map<string, { name: string; class_name: string; balance: number; bills: number }>();
    for (const f of fees) {
      const balance = f.amount - f.paid_amount;
      if (balance <= 0) continue;
      const cur = studentMap.get(f.student_id) ?? { name: f.student_name ?? "?", class_name: f.class_name ?? "?", balance: 0, bills: 0 };
      cur.balance += balance;
      cur.bills += 1;
      studentMap.set(f.student_id, cur);
    }
    return Array.from(studentMap.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.balance - a.balance);
  }, [fees]);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📈 Fee Reports</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            School-wide visibility on what&apos;s been billed, collected, and outstanding. Filter by date range when you need a specific window.
          </p>
        </header>

        {/* Report picker pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {REPORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setType(opt.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: type === opt.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: type === opt.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</label>
            <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</label>
            <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button type="button" className="text-xs px-3 py-1.5 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setFromDate(""); setToDate(""); }}>Clear</button>
          <p className="text-xs text-gray-500 ml-auto">
            {REPORT_OPTIONS.find((o) => o.key === type)?.description}
          </p>
        </div>

        {type === "summary" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-indigo-700">{formatGHS(totalBilled)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Billed</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-emerald-700">{formatGHS(totalCollected)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Collected</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black" style={{ color: totalOutstanding > 0 ? "#ef4444" : "#22c55e" }}>{formatGHS(totalOutstanding)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Outstanding</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-purple-700">{formatGHS(totalInRange)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">In Date Range</p>
            </div>
          </div>
        )}

        {type === "by-class" && (
          <div className="glass rounded-2xl p-5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Class</th>
                  <th className="text-right py-2">Students</th>
                  <th className="text-right py-2">Billed</th>
                  <th className="text-right py-2">Collected</th>
                  <th className="text-right py-2">Outstanding</th>
                  <th className="text-right py-2">% Collected</th>
                </tr>
              </thead>
              <tbody>
                {byClass.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No data yet.</td></tr>}
                {byClass.map((r) => {
                  const pct = r.billed > 0 ? Math.round((r.collected / r.billed) * 100) : 0;
                  return (
                    <tr key={r.name} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{r.name}</td>
                      <td className="py-2 text-right text-gray-600">{r.students}</td>
                      <td className="py-2 text-right font-mono">{formatGHS(r.billed)}</td>
                      <td className="py-2 text-right font-mono text-emerald-700">{formatGHS(r.collected)}</td>
                      <td className="py-2 text-right font-mono" style={{ color: r.billed - r.collected > 0 ? "#ef4444" : "#22c55e" }}>{formatGHS(r.billed - r.collected)}</td>
                      <td className="py-2 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }} />
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
        )}

        {type === "by-particular" && (
          <div className="glass rounded-2xl p-5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Fee</th>
                  <th className="text-right py-2"># Bills</th>
                  <th className="text-right py-2">Billed</th>
                  <th className="text-right py-2">Collected</th>
                  <th className="text-right py-2">% Collected</th>
                </tr>
              </thead>
              <tbody>
                {byParticular.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-400">No fees billed yet.</td></tr>}
                {byParticular.map((r) => {
                  const pct = r.billed > 0 ? Math.round((r.collected / r.billed) * 100) : 0;
                  return (
                    <tr key={r.name} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{r.name}</td>
                      <td className="py-2 text-right text-gray-600">{r.count}</td>
                      <td className="py-2 text-right font-mono">{formatGHS(r.billed)}</td>
                      <td className="py-2 text-right font-mono text-emerald-700">{formatGHS(r.collected)}</td>
                      <td className="py-2 text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }} />
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
        )}

        {type === "defaulters" && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-900">{defaulters.length} student{defaulters.length === 1 ? "" : "s"} owing money</h3>
              <span className="text-sm font-bold" style={{ color: "#ef4444" }}>{formatGHS(defaulters.reduce((s, d) => s + d.balance, 0))} total</span>
            </div>
            {defaulters.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">
                <span className="block text-3xl mb-1">🎉</span>
                No defaulters — every billed fee is paid up.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Student</th>
                    <th className="text-left py-2">Class</th>
                    <th className="text-right py-2"># Bills</th>
                    <th className="text-right py-2">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{d.name}</td>
                      <td className="py-2 text-gray-600">{d.class_name}</td>
                      <td className="py-2 text-right text-gray-600">{d.bills}</td>
                      <td className="py-2 text-right font-mono font-bold" style={{ color: "#ef4444" }}>{formatGHS(d.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {type === "transactions" && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-900">{filteredPayments.length} transaction{filteredPayments.length === 1 ? "" : "s"} {fromDate || toDate ? "in range" : "(all-time)"}</h3>
              <span className="text-sm font-bold text-emerald-700">{formatGHS(totalInRange)} total</span>
            </div>
            {filteredPayments.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">No transactions in this window.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Student</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-left py-2">Method</th>
                    <th className="text-left py-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredPayments].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()).slice(0, 200).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-2 text-xs text-gray-500">{new Date(p.paid_at).toLocaleString()}</td>
                      <td className="py-2 font-bold text-gray-800">{p.student_name}</td>
                      <td className="py-2 text-right font-mono text-emerald-700 font-bold">{formatGHS(p.amount)}</td>
                      <td className="py-2 text-gray-600">{p.method}</td>
                      <td className="py-2 font-mono text-xs text-gray-500">{p.receipt_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
