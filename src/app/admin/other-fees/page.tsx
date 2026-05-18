"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Fee, Payment } from "@/lib/types";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "overview" | "billing" | "reports";

const METHOD_LABELS: Record<string, string> = {
  mtn_momo: "MTN MoMo", telecel: "Telecel Cash", at_money: "AT Money", cash: "Cash", bank: "Bank Transfer",
};

export default function OtherFeesPage() {
  const particulars = useAppStore((s) => s.feeParticulars);
  const instantBuckets = useAppStore((s) => s.instantBuckets);
  const fees = useAppStore((s) => s.fees);
  const payments = useAppStore((s) => s.payments);
  const students = useAppStore((s) => s.students);
  const classes = useAppStore((s) => s.classes);
  const addFee = useAppStore((s) => s.addFee);
  const recordPayment = useAppStore((s) => s.recordPayment);

  const [tab, setTab] = useState<Tab>("overview");

  // billing/payment state
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // bill form
  const [billParticularId, setBillParticularId] = useState("");
  const [billBucketId, setBillBucketId] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billTerm, setBillTerm] = useState<1 | 2 | 3>(2);
  const [billYear, setBillYear] = useState("2025/2026");

  // payment form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<Payment["method"]>("mtn_momo");
  const [payRef, setPayRef] = useState("");

  // reports state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const otherFeesParticulars = useMemo(() =>
    particulars.filter((p) => /OTHER|FEEDING|SEMINAR|GRADUATION|UNIFORM|CAMPING|LIBRARY/i.test(p.name) || p.frequency === "one_time"),
    [particulars],
  );

  const otherFees = useMemo(() => {
    const names = new Set(otherFeesParticulars.map((p) => p.name));
    return fees.filter((f) => names.has(f.fee_type));
  }, [fees, otherFeesParticulars]);

  const totalBilled = otherFees.reduce((s, f) => s + f.amount, 0);
  const totalCollected = otherFees.reduce((s, f) => s + f.paid_amount, 0);

  const recentPayments = useMemo(() => {
    const otherFeeIds = new Set(otherFees.map((f) => f.id));
    return payments.filter((p) => p.fee_id && otherFeeIds.has(p.fee_id))
      .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
      .slice(0, 20);
  }, [payments, otherFees]);

  // Reports breakdown
  const filteredPayments = useMemo(() => {
    let pays = payments;
    const otherFeeIds = new Set(otherFees.map((f) => f.id));
    pays = pays.filter((p) => p.fee_id && otherFeeIds.has(p.fee_id));
    if (fromDate) pays = pays.filter((p) => p.paid_at >= fromDate);
    if (toDate) pays = pays.filter((p) => p.paid_at <= `${toDate}T23:59:59Z`);
    return pays;
  }, [payments, otherFees, fromDate, toDate]);

  const breakdownByParticular = useMemo(() => {
    const map = new Map<string, { billed: number; collected: number; txns: number }>();
    for (const p of otherFeesParticulars) {
      map.set(p.name, { billed: 0, collected: 0, txns: 0 });
    }
    for (const f of otherFees) {
      const cur = map.get(f.fee_type);
      if (cur) cur.billed += f.amount;
    }
    for (const py of filteredPayments) {
      const fee = otherFees.find((f) => f.id === py.fee_id);
      if (!fee) continue;
      const cur = map.get(fee.fee_type);
      if (cur) {
        cur.collected += py.amount;
        cur.txns += 1;
      }
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [otherFeesParticulars, otherFees, filteredPayments]);

  // Filter students for billing
  const filteredStudents = useMemo(() => {
    let list = students;
    if (classFilter) list = list.filter((s) => s.class_name === classFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.full_name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q));
    return list;
  }, [students, classFilter, search]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedStudentFees = selectedStudent
    ? otherFees.filter((f) => f.student_id === selectedStudent.id)
    : [];

  const onBillStudent = () => {
    if (!selectedStudent) { toast.error("Pick a student first"); return; }
    if (!billParticularId) { toast.error("Pick a fee particular"); return; }
    let amount = parseFloat(billAmount);
    if (billBucketId) {
      const bucket = instantBuckets.find((b) => b.id === billBucketId);
      if (bucket) amount = bucket.amount;
    }
    if (Number.isNaN(amount) || amount <= 0) { toast.error("Amount must be > 0"); return; }
    const particular = particulars.find((p) => p.id === billParticularId);
    if (!particular) return;
    addFee({
      student_id: selectedStudent.id,
      student_name: selectedStudent.full_name,
      class_name: selectedStudent.class_name,
      term: billTerm,
      academic_year: billYear,
      fee_type: particular.name,
      amount,
      due_date: undefined,
    });
    toast.success(`Billed ${selectedStudent.full_name.split(" ")[0]} ${formatGHS(amount)} for ${particular.name}`);
    setBillParticularId("");
    setBillBucketId("");
    setBillAmount("");
  };

  const onRecordPayment = (fee: Fee) => {
    const amt = parseFloat(payAmount);
    if (Number.isNaN(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    recordPayment(fee.student_id, amt, payMethod, payRef || undefined);
    toast.success(`Payment of ${formatGHS(amt)} recorded`);
    setPayAmount("");
    setPayRef("");
  };

  const bucketsForSelectedParticular = instantBuckets.filter((b) => b.particular_id === billParticularId);

  const tabs: Array<{ key: Tab; label: string; emoji: string }> = [
    { key: "overview", label: "Overview",          emoji: "📊" },
    { key: "billing",  label: "Billing & Payments", emoji: "💳" },
    { key: "reports",  label: "Reports",            emoji: "📈" },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">💼 Other Fees</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Manage instant fee particulars (feeding, uniforms, seminars, etc.), record payments, and view reports — separate from the main per-term billing.
          </p>
        </header>

        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full"
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

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-700">{otherFeesParticulars.filter((p) => p.active).length}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active particulars</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-indigo-700">{formatGHS(totalBilled)}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total billed</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-700">{formatGHS(totalCollected)}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total collected</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black" style={{ color: totalBilled - totalCollected > 0 ? "#ef4444" : "#22c55e" }}>{formatGHS(totalBilled - totalCollected)}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Outstanding</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-black text-gray-900 mb-3">📜 Recent Payments</h2>
              {recentPayments.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">No payments yet. Use the Billing & Payments tab to record.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                    <tr>
                      <th className="text-left py-2">Student</th>
                      <th className="text-left py-2">Fee</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-left py-2">Method</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((p) => {
                      const fee = otherFees.find((f) => f.id === p.fee_id);
                      return (
                        <tr key={p.id} className="border-b border-gray-50">
                          <td className="py-2 font-bold text-gray-800">{p.student_name}</td>
                          <td className="py-2 text-gray-600">{fee?.fee_type ?? "—"}</td>
                          <td className="py-2 text-right font-bold text-emerald-700">{formatGHS(p.amount)}</td>
                          <td className="py-2 text-gray-600">{METHOD_LABELS[p.method]}</td>
                          <td className="py-2 text-xs text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</td>
                          <td className="py-2 font-mono text-xs text-gray-500">{p.receipt_number}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4 lg:col-span-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Find student</p>
              <input className="input" placeholder="Search by name or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="input mt-2" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="">All classes</option>
                {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ul className="mt-3 max-h-80 overflow-y-auto divide-y">
                {filteredStudents.length === 0 && <li className="text-xs text-gray-400 py-3 text-center">No students match.</li>}
                {filteredStudents.slice(0, 50).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(s.id)}
                      className="w-full text-left py-2 px-2 hover:bg-indigo-50 rounded text-sm flex justify-between"
                      style={{ background: selectedStudentId === s.id ? "rgba(107,33,168,0.1)" : undefined }}
                    >
                      <span className="font-bold">{s.full_name}</span>
                      <span className="text-xs text-gray-500">{s.class_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {!selectedStudent ? (
                <div className="glass rounded-2xl p-8 text-center text-sm text-gray-400">
                  <p className="text-4xl mb-2">👈</p>
                  <p>Pick a student on the left to bill or record a payment.</p>
                </div>
              ) : (
                <>
                  <div className="glass rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Selected</p>
                    <p className="text-xl font-black text-gray-900">{selectedStudent.full_name}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.class_name} · {selectedStudent.student_id}</p>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-black text-gray-900 mb-3">➕ Bill a fee</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 font-bold">Fee particular</label>
                        <select className="input" value={billParticularId} onChange={(e) => { setBillParticularId(e.target.value); setBillBucketId(""); }}>
                          <option value="">— pick —</option>
                          {otherFeesParticulars.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      {bucketsForSelectedParticular.length > 0 && (
                        <div>
                          <label className="text-xs text-gray-500 font-bold">Bucket (auto-fills amount)</label>
                          <select className="input" value={billBucketId} onChange={(e) => {
                            setBillBucketId(e.target.value);
                            const b = bucketsForSelectedParticular.find((x) => x.id === e.target.value);
                            if (b) setBillAmount(String(b.amount));
                          }}>
                            <option value="">Custom amount</option>
                            {bucketsForSelectedParticular.map((b) => <option key={b.id} value={b.id}>{b.bucket_name} — GHS {b.amount.toFixed(2)}</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-gray-500 font-bold">Amount (GHS)</label>
                        <input className="input" type="number" min={0} value={billAmount} onChange={(e) => setBillAmount(e.target.value)} disabled={!!billBucketId} />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-bold">Term</label>
                          <select className="input" value={billTerm} onChange={(e) => setBillTerm(Number(e.target.value) as 1 | 2 | 3)}>
                            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 font-bold">Year</label>
                          <input className="input" value={billYear} onChange={(e) => setBillYear(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <button type="button" className="btn-gold mt-3" onClick={onBillStudent}>+ Add bill</button>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-black text-gray-900 mb-3">💳 Outstanding bills</h3>
                    {selectedStudentFees.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No other-fee bills yet.</p>
                    ) : (
                      <ul className="divide-y">
                        {selectedStudentFees.map((f) => {
                          const balance = f.amount - f.paid_amount;
                          return (
                            <li key={f.id} className="py-3 flex flex-wrap items-center gap-2">
                              <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">{f.fee_type}</p>
                                <p className="text-xs text-gray-500">Term {f.term} {f.academic_year} · {f.status}</p>
                              </div>
                              <span className="text-sm font-mono">{formatGHS(f.paid_amount)} / {formatGHS(f.amount)}</span>
                              {balance > 0 && (
                                <>
                                  <input className="input max-w-[100px]" type="number" placeholder={formatGHS(balance)} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                                  <select className="input max-w-[140px]" value={payMethod} onChange={(e) => setPayMethod(e.target.value as Payment["method"])}>
                                    {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                  </select>
                                  <input className="input max-w-[120px]" placeholder="Ref (optional)" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                                  <button type="button" className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white" }} onClick={() => onRecordPayment(f)}>Record</button>
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-black text-gray-900 mb-3">📅 Fee Collection Report</h3>
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-bold">From</label>
                  <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">To</label>
                  <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <button type="button" className="text-xs px-3 py-1.5 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setFromDate(""); setToDate(""); }}>Clear</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-indigo-700">{formatGHS(totalBilled)}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Billed</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-700">{formatGHS(filteredPayments.reduce((s, p) => s + p.amount, 0))}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Collected</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-amber-700">{filteredPayments.length}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Transactions</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-purple-700">{filteredPayments.length > 0 ? formatGHS(filteredPayments.reduce((s, p) => s + p.amount, 0) / filteredPayments.length) : "—"}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg / Transaction</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="font-black text-gray-900 mb-3">📊 Breakdown by fee particular</h3>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Fee Particular</th>
                    <th className="text-right py-2">Billed</th>
                    <th className="text-right py-2">Collected</th>
                    <th className="text-right py-2">Txns</th>
                    <th className="text-right py-2">% Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownByParticular.map((r) => {
                    const pct = r.billed > 0 ? Math.round((r.collected / r.billed) * 100) : 0;
                    return (
                      <tr key={r.name} className="border-b border-gray-50">
                        <td className="py-2 font-bold text-gray-800">{r.name}</td>
                        <td className="py-2 text-right font-mono">{formatGHS(r.billed)}</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{formatGHS(r.collected)}</td>
                        <td className="py-2 text-right text-gray-600">{r.txns}</td>
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
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .input:disabled { background: #f3f4f6; color: #6b7280; }
        `}</style>
      </div>
    </DashboardShell>
  );
}
