"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";

type ReportType = "summary" | "transactions" | "expenses" | "trial" | "backdated";

const REPORT_OPTIONS: Array<{ key: ReportType; label: string; emoji: string; description: string }> = [
  { key: "summary",      label: "Finance Summary",      emoji: "📊", description: "Top-line income / expense / net position" },
  { key: "transactions", label: "Finance Transactions", emoji: "📒", description: "All transactions in the date range" },
  { key: "expenses",     label: "Expense Transactions", emoji: "💸", description: "Filtered to expense outflows only" },
  { key: "trial",        label: "Trial Balance",        emoji: "⚖️", description: "Per-account income vs expense balance" },
  { key: "backdated",    label: "Back-Dated Transactions", emoji: "🕰️", description: "Transactions where the date is before they were entered" },
];

export default function FinanceReportsPage() {
  const transactions = useAppStore((s) => s.financeTransactions);
  const accounts = useAppStore((s) => s.chartAccounts);
  const groups = useAppStore((s) => s.accountGroups);

  const [type, setType] = useState<ReportType>("summary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const inRange = useMemo(() => transactions.filter((t) => {
    if (fromDate && t.date < fromDate) return false;
    if (toDate && t.date > toDate) return false;
    return true;
  }), [transactions, fromDate, toDate]);

  const paid = inRange.filter((t) => t.status === "paid");

  const summary = useMemo(() => {
    let inc = 0, exp = 0, pending = 0;
    for (const t of paid) {
      if (t.kind === "receipt") inc += t.amount;
      else if (t.kind === "payment") exp += t.amount;
    }
    for (const t of inRange) {
      if (t.kind === "payment" && t.status !== "paid" && t.status !== "rejected") pending += t.amount;
    }
    return { inc, exp, pending, net: inc - exp };
  }, [paid, inRange]);

  const byAccount = useMemo(() => {
    const map = new Map<string, { name: string; flow: string; income: number; expense: number; group: string }>();
    for (const a of accounts) {
      const g = groups.find((x) => x.id === a.group_id);
      map.set(a.id, { name: a.name, flow: a.flow, income: 0, expense: 0, group: g?.name ?? "—" });
    }
    for (const t of paid) {
      if (t.spending_from_id) {
        const cur = map.get(t.spending_from_id);
        if (cur && t.kind === "receipt") cur.income += t.amount;
        if (cur && t.kind === "payment") cur.income -= t.amount;  // money leaving income account
      }
      if (t.spending_to_id) {
        const cur = map.get(t.spending_to_id);
        if (cur && t.kind === "payment") cur.expense += t.amount;
      }
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, balance: v.income - v.expense }))
      .filter((r) => r.income !== 0 || r.expense !== 0);
  }, [paid, accounts, groups]);

  const backdated = useMemo(() => inRange.filter((t) => {
    const txDate = new Date(t.date).getTime();
    const enteredAt = new Date(t.created_at).getTime();
    return txDate < enteredAt - 24 * 60 * 60 * 1000;  // tx date is more than 1 day before entry
  }), [inRange]);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📊 Finance Reports</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Top-level views of the school&apos;s finances. Trial balance, expense audit, back-dated transactions — auditor-ready cuts of the bookkeeping data.
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {REPORT_OPTIONS.map((opt) => (
            <button key={opt.key} type="button" onClick={() => setType(opt.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: type === opt.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: type === opt.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
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
          <p className="text-xs text-gray-500 ml-auto self-center">
            {REPORT_OPTIONS.find((o) => o.key === type)?.description}
          </p>
        </div>

        {type === "summary" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-emerald-700">{formatGHS(summary.inc)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Income (paid)</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-red-600">{formatGHS(summary.exp)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expenses (paid)</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black text-amber-600">{formatGHS(summary.pending)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expenses pending</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-3xl font-black" style={{ color: summary.net >= 0 ? "#16a34a" : "#ef4444" }}>{formatGHS(summary.net)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net position</p>
            </div>
          </div>
        )}

        {(type === "transactions" || type === "expenses") && (
          <div className="glass rounded-2xl p-5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Kind</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = type === "expenses" ? inRange.filter((t) => t.kind === "payment") : inRange;
                  if (rows.length === 0) return <tr><td colSpan={5} className="text-center py-6 text-gray-400">No transactions in range.</td></tr>;
                  return rows.slice(0, 200).map((t) => (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2 text-xs text-gray-500 font-mono">{t.date}</td>
                      <td className="py-2 font-bold text-gray-800">{t.description}</td>
                      <td className="py-2 text-xs capitalize text-gray-600">{t.kind.replace("_", " ")}</td>
                      <td className="py-2 text-right font-mono font-bold" style={{ color: t.kind === "receipt" ? "#16a34a" : "#ef4444" }}>
                        {formatGHS(t.amount)}
                      </td>
                      <td className="py-2 text-xs capitalize text-gray-600">{t.status.replace("_", " ")}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

        {type === "trial" && (
          <div className="glass rounded-2xl p-5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Account</th>
                  <th className="text-left py-2">Group</th>
                  <th className="text-right py-2">Income</th>
                  <th className="text-right py-2">Expense</th>
                  <th className="text-right py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {byAccount.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-400">No paid transactions in range yet.</td></tr>}
                {byAccount.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="py-2 font-bold text-gray-800">{r.name}</td>
                    <td className="py-2 text-xs text-gray-500">{r.group}</td>
                    <td className="py-2 text-right font-mono text-emerald-700">{formatGHS(r.income)}</td>
                    <td className="py-2 text-right font-mono text-red-600">{formatGHS(r.expense)}</td>
                    <td className="py-2 text-right font-mono font-bold" style={{ color: r.balance >= 0 ? "#16a34a" : "#ef4444" }}>{formatGHS(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {type === "backdated" && (
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-3">{backdated.length} back-dated entries — transactions whose <span className="font-bold">date</span> is more than a day before they were <span className="font-bold">entered</span>. Audit these carefully.</p>
            {backdated.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">
                <span className="block text-3xl mb-1">✅</span>
                No back-dated entries in this window.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Tx date</th>
                    <th className="text-left py-2">Entered</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {backdated.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2 text-xs text-gray-500 font-mono">{t.date}</td>
                      <td className="py-2 text-xs text-gray-500 font-mono">{t.created_at.slice(0, 10)}</td>
                      <td className="py-2 font-bold text-gray-800">{t.description}</td>
                      <td className="py-2 text-right font-mono">{formatGHS(t.amount)}</td>
                      <td className="py-2 text-xs capitalize text-gray-600">{t.status.replace("_", " ")}</td>
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
