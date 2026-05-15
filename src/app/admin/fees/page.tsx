"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Payment } from "@/lib/types";
import { CLASSES } from "@/lib/utils";
import toast from "react-hot-toast";


const FEE_TYPES = [
  { label: "School Fees",             icon: "🏫" },
  { label: "Feeding Fees",            icon: "🍱" },
  { label: "Bus / Transport Fees",    icon: "🚌" },
  { label: "Camp Fees",               icon: "⛺" },
  { label: "Uniform Fees",            icon: "👕" },
  { label: "Examination Fees",        icon: "📝" },
  { label: "Book & Stationery Fees",  icon: "📚" },
  { label: "Miscellaneous",           icon: "📋" },
];

const METHOD_LABELS: Record<string, string> = {
  mtn_momo: "MTN MoMo", telecel: "Telecel Cash", at_money: "AT Money", cash: "Cash", bank: "Bank Transfer",
};

const TERMS = [1, 2, 3] as const;

type Tab = "setup" | "outstanding" | "payments";

export default function FeesPage() {
  const students      = useAppStore((s) => s.students);
  const fees          = useAppStore((s) => s.fees);
  const payments      = useAppStore((s) => s.payments);
  const recordPayment = useAppStore((s) => s.recordPayment);
  const addFee        = useAppStore((s) => s.addFee);
  const discountPolicy    = useAppStore((s) => s.discountPolicy);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);

  const [tab, setTab] = useState<Tab>("setup");

  // ── Fee Setup form ────────────────────────────────────────────
  const [sf, setSf] = useState({
    fee_type:      "School Fees",
    custom_name:   "",
    amount:        "",
    scope:         "all" as "all" | "class" | "individual",
    class_name:    CLASSES[0] ?? "",
    student_id:    "",
    term:          2 as 1 | 2 | 3,
    academic_year: "2025/2026",
    due_date:      "",
  });

  // ── Payment modal ─────────────────────────────────────────────
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    student_id: "", amount: "", method: "mtn_momo" as Payment["method"], reference: "",
  });
  const [receipt, setReceipt] = useState<{
    studentName: string; className: string; amount: number;
    method: string; reference: string; receiptNo: string; date: string;
  } | null>(null);

  // ── Derived values ────────────────────────────────────────────
  const outstanding     = fees.filter((f) => f.status !== "cleared");
  const cleared         = fees.filter((f) => f.status === "cleared");
  const totalCollected  = payments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = outstanding.reduce((s, f) => s + (f.amount - f.paid_amount), 0);
  const recentPayments  = [...payments].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

  const feeLabel = sf.fee_type === "Miscellaneous" ? sf.custom_name.trim() : sf.fee_type;

  const targetStudents =
    sf.scope === "all"        ? students :
    sf.scope === "class"      ? students.filter((s) => s.class_name === sf.class_name) :
    sf.student_id             ? students.filter((s) => s.id === sf.student_id) : [];

  const alreadyCount = targetStudents.filter((s) =>
    fees.some((f) =>
      f.student_id === s.id && f.fee_type === feeLabel &&
      f.term === sf.term && f.academic_year === sf.academic_year
    )
  ).length;
  const willCreate = targetStudents.length - alreadyCount;

  // Existing fee-type summary for the right panel
  const feeTypeSummary = Array.from(
    fees.reduce((map, f) => {
      const key = `${f.fee_type}||${f.term}||${f.academic_year}`;
      const cur = map.get(key) ?? { type: f.fee_type, term: f.term, year: f.academic_year, count: 0, total: 0 };
      map.set(key, { ...cur, count: cur.count + 1, total: cur.total + f.amount });
      return map;
    }, new Map<string, { type: string; term: number; year: string; count: number; total: number }>())
  ).map(([, v]) => v).sort((a, b) => a.type.localeCompare(b.type));

  // ── Handlers ─────────────────────────────────────────────────
  const handleSetupFees = () => {
    if (!feeLabel)                    { toast.error("Enter a fee name"); return; }
    const amount = parseFloat(sf.amount);
    if (!amount || amount <= 0)       { toast.error("Enter a valid amount (GH₵)"); return; }
    if (targetStudents.length === 0)  { toast.error("No students match that selection"); return; }
    if (willCreate === 0) {
      toast("All selected students already have this fee for this term", { icon: "ℹ️" });
      return;
    }
    const discountApplies = discountPolicy.active && discountPolicy.applies_to_fee_types.includes(feeLabel);
    let created = 0;
    let discountedCount = 0;
    let totalSaved = 0;
    targetStudents.forEach((student) => {
      const exists = fees.some(
        (f) => f.student_id === student.id && f.fee_type === feeLabel &&
               f.term === sf.term && f.academic_year === sf.academic_year
      );
      if (!exists) {
        let finalAmount = amount;
        if (discountApplies && student.family_id) {
          const pct = computeFamilyDiscount(student.family_id);
          if (pct > 0) {
            finalAmount = Math.round((amount * (100 - pct)) * 100) / 10000 * 100;
            finalAmount = Math.round(amount * (1 - pct / 100) * 100) / 100;
            discountedCount++;
            totalSaved += amount - finalAmount;
          }
        }
        addFee({
          student_id:    student.id,
          student_name:  student.full_name,
          class_name:    student.class_name,
          term:          sf.term,
          academic_year: sf.academic_year,
          fee_type:      feeLabel,
          amount:        finalAmount,
          due_date:      sf.due_date || undefined,
        });
        created++;
      }
    });
    toast.success(`✅ Created ${created} fee record${created !== 1 ? "s" : ""}`);
    if (discountedCount > 0) {
      toast.success(`💰 Sibling discount applied to ${discountedCount} — saved GH₵ ${totalSaved.toFixed(2)} total`, { duration: 5000 });
    }
    if (alreadyCount > 0) toast(`${alreadyCount} student(s) already had this fee — skipped`, { icon: "ℹ️" });
    setSf((p) => ({ ...p, amount: "", custom_name: "" }));
  };

  const handlePay = () => {
    if (!payForm.student_id) { toast.error("Select a student"); return; }
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0)    { toast.error("Enter a valid amount"); return; }
    const student = students.find((s) => s.id === payForm.student_id);
    recordPayment(payForm.student_id, amt, payForm.method, payForm.reference || undefined);
    const receiptNo = `PIS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setReceipt({
      studentName: student?.full_name ?? "",
      className:   student?.class_name ?? "",
      amount:      amt,
      method:      METHOD_LABELS[payForm.method] ?? payForm.method,
      reference:   payForm.reference || "—",
      receiptNo,
      date:        new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    });
    setPayForm({ student_id: "", amount: "", method: "mtn_momo", reference: "" });
    setShowPayModal(false);
  };

  // ── UI ────────────────────────────────────────────────────────
  return (
    <DashboardShell role="admin" navItems={NAV}>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">Fee Management</h2>
        <button type="button" onClick={() => setShowPayModal(true)} className="btn-gold text-xs py-2 px-5">
          + Record Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Collected",    value: `GH₵${totalCollected.toLocaleString()}`,   color: "#22c55e", icon: "✅" },
          { label: "Total Outstanding",  value: `GH₵${totalOutstanding.toLocaleString()}`, color: "#ef4444", icon: "⚠️" },
          { label: "Cleared Students",   value: cleared.length,                             color: "#003087", icon: "🎉" },
          { label: "With Balance Due",   value: outstanding.length,                         color: "#f59e0b", icon: "🔒" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          ["setup",       "⚙️ Fee Setup"],
          ["outstanding", `⚠️ Outstanding (${outstanding.length})`],
          ["payments",    `💳 Payments (${payments.length})`],
        ] as [Tab, string][]).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={tab === t ? { background: "#003087", color: "white" } : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Fee Setup tab ──────────────────────────────────────── */}
      {tab === "setup" && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Form */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <h3 className="font-black text-gray-900 mb-1">Create Fee Records</h3>
            <p className="text-xs text-gray-500 mb-5">
              Set the fee type, amount, and who it applies to. Existing records for the same fee/term/year are skipped automatically.
            </p>

            {/* Fee type */}
            <div className="mb-4">
              <label className="block text-xs font-black text-gray-600 mb-2">Fee Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FEE_TYPES.map(({ label, icon }) => (
                  <button key={label} type="button"
                    onClick={() => setSf((p) => ({ ...p, fee_type: label, custom_name: "" }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left"
                    style={sf.fee_type === label
                      ? { background: "#003087", color: "white" }
                      : { background: "rgba(0,48,135,0.06)", color: "#003087" }}>
                    <span>{icon}</span><span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom name if Misc */}
            {sf.fee_type === "Miscellaneous" && (
              <div className="mb-4">
                <label className="block text-xs font-black text-gray-600 mb-1">Fee Name *</label>
                <input
                  value={sf.custom_name}
                  onChange={(e) => setSf((p) => ({ ...p, custom_name: e.target.value }))}
                  placeholder="e.g. Sports Day Levy, Excursion, PTA Dues…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            )}

            {/* Amount + Term + Year */}
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">Amount (GH₵) *</label>
                <input
                  type="number" min="0" step="0.01"
                  value={sf.amount}
                  onChange={(e) => setSf((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">Term *</label>
                <select aria-label="Term" value={sf.term} onChange={(e) => setSf((p) => ({ ...p, term: Number(e.target.value) as 1|2|3 }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {TERMS.map((t) => <option key={t} value={t}>Term {t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">Academic Year *</label>
                <input
                  value={sf.academic_year}
                  onChange={(e) => setSf((p) => ({ ...p, academic_year: e.target.value }))}
                  placeholder="2025/2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>

            {/* Due date */}
            <div className="mb-5">
              <label className="block text-xs font-black text-gray-600 mb-1">Due Date (optional)</label>
              <input type="date" aria-label="Due date" value={sf.due_date}
                onChange={(e) => setSf((p) => ({ ...p, due_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>

            {/* Scope */}
            <div className="mb-5">
              <label className="block text-xs font-black text-gray-600 mb-2">Apply To *</label>
              <div className="grid sm:grid-cols-3 gap-2 mb-3">
                {([
                  ["all",        "🏫 All Students",     `${students.length} students`],
                  ["class",      "📋 One Class",         "select class below"],
                  ["individual", "👤 One Student",       "select student below"],
                ] as [typeof sf.scope, string, string][]).map(([v, label, hint]) => (
                  <button key={v} type="button" onClick={() => setSf((p) => ({ ...p, scope: v }))}
                    className="flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all"
                    style={sf.scope === v
                      ? { background: "#003087", color: "white" }
                      : { background: "rgba(0,48,135,0.06)", color: "#374151" }}>
                    <span className="text-xs font-black">{label}</span>
                    <span className="text-[10px] opacity-70 mt-0.5">{hint}</span>
                  </button>
                ))}
              </div>

              {sf.scope === "class" && (
                <select aria-label="Select class" value={sf.class_name} onChange={(e) => setSf((p) => ({ ...p, class_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c} ({students.filter((s) => s.class_name === c).length} students)</option>
                  ))}
                </select>
              )}

              {sf.scope === "individual" && (
                <select aria-label="Select student" value={sf.student_id} onChange={(e) => setSf((p) => ({ ...p, student_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} · {s.class_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Preview + submit */}
            {feeLabel && sf.amount && targetStudents.length > 0 && (
              <div className="rounded-xl p-4 mb-4 text-sm"
                style={{ background: "rgba(0,48,135,0.06)", border: "1px solid rgba(0,48,135,0.15)" }}>
                <div className="font-black text-gray-900 mb-1">Preview</div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div>Fee: <strong>{feeLabel}</strong> · GH₵{parseFloat(sf.amount || "0").toLocaleString()} each</div>
                  <div>Term {sf.term}, {sf.academic_year}</div>
                  <div className="text-green-700 font-bold">
                    Will create {willCreate} new record{willCreate !== 1 ? "s" : ""}
                    {alreadyCount > 0 && ` · ${alreadyCount} already exist (will skip)`}
                  </div>
                  {willCreate > 0 && (
                    <div className="text-gray-500">Total value: GH₵{(willCreate * parseFloat(sf.amount)).toLocaleString()}</div>
                  )}
                </div>
              </div>
            )}

            <button type="button" onClick={handleSetupFees} className="btn-gold py-3 px-8 text-sm">
              Create Fee Records →
            </button>
          </div>

          {/* Existing structure panel */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-black text-gray-900 mb-4">Current Fee Structure</h3>
            {feeTypeSummary.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No fee records yet. Create some using the form.</p>
            ) : (
              <div className="space-y-2.5">
                {feeTypeSummary.map((s) => (
                  <div key={`${s.type}-${s.term}-${s.year}`}
                    className="p-3 rounded-xl" style={{ background: "rgba(0,48,135,0.04)" }}>
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-xs font-black text-gray-900 leading-tight">{s.type}</span>
                      <span className="text-xs font-black text-green-700">GH₵{s.total.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-400">Term {s.term} · {s.year} · {s.count} student{s.count !== 1 ? "s" : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Outstanding tab ────────────────────────────────────── */}
      {tab === "outstanding" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#0A1628" }}>
                <tr className="text-xs text-blue-300 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-left px-4 py-3 font-semibold">Fee Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Term</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  <th className="text-right px-4 py-3 font-semibold">Paid</th>
                  <th className="text-right px-4 py-3 font-semibold">Balance</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {outstanding.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">🎉 All fees cleared!</td></tr>
                ) : outstanding.map((f) => {
                  const balance = f.amount - f.paid_amount;
                  return (
                    <tr key={f.id} className="table-row border-t border-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{f.student_name}</div>
                        <div className="text-xs text-gray-400">{f.class_name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{f.fee_type}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Term {f.term} · {f.academic_year}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">GH₵{f.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-bold">GH₵{f.paid_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-black">GH₵{balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={f.status === "partial"
                            ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b" }
                            : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                          {f.status === "partial" ? "⚠️ Partial" : "🔒 Outstanding"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Payments tab ───────────────────────────────────────── */}
      {tab === "payments" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#0A1628" }}>
                <tr className="text-xs text-blue-300 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Method</th>
                  <th className="text-left px-4 py-3 font-semibold">Receipt No.</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No payments recorded yet.</td></tr>
                ) : recentPayments.map((p) => (
                  <tr key={p.id} className="table-row border-t border-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{p.student_name}</div>
                      <div className="text-xs text-gray-400">{p.class_name}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-green-600">GH₵{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{METHOD_LABELS[p.method]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.receipt_number}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.paid_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ──────────────────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black text-gray-900 text-lg mb-4">Record Fee Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Student *</label>
                <select value={payForm.student_id} onChange={(e) => setPayForm((p) => ({ ...p, student_id: e.target.value }))}
                  aria-label="Select student"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="">— Select student —</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amount (GH₵) *</label>
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Method *</label>
                <select value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value as Payment["method"] }))}
                  aria-label="Payment method"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {payForm.method === "bank" && (
                <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "rgba(0,48,135,0.06)", border: "1px solid rgba(0,48,135,0.15)" }}>
                  <div className="font-black text-gray-700 mb-1.5">🏦 School Bank Account</div>
                  {[["Bank","GCB Bank Ghana"],["Account Name","Phoenix Intl. School"],["Account No.","1024567890"],["Branch","Accra Central"]].map(([l,v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-bold text-gray-800 font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Transaction Reference (optional)</label>
                <input type="text" value={payForm.reference} onChange={(e) => setPayForm((p) => ({ ...p, reference: e.target.value }))}
                  placeholder={payForm.method === "bank" ? "Bank transaction ID" : "e.g. MTN-XXXXXXXX"}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowPayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handlePay} className="btn-gold flex-1 py-2.5">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ─────────────────────────────────────── */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div id="receipt-print" className="p-6">
              <div className="text-center mb-5">
                <div className="text-3xl mb-1">🦅</div>
                <div className="font-black text-gray-900 text-base">Phoenix International School Ghana</div>
                <div className="text-xs text-gray-500">Accra, Ghana</div>
                <div className="text-xs font-bold text-green-600 mt-1 px-3 py-0.5 rounded-full inline-block"
                  style={{ background: "rgba(34,197,94,0.1)" }}>✅ PAYMENT RECEIPT</div>
              </div>
              <div className="border-t border-dashed border-gray-200 my-3" />
              <div className="space-y-2 text-sm">
                {[
                  ["Receipt No.", receipt.receiptNo],
                  ["Date",        receipt.date],
                  ["Student",     receipt.studentName],
                  ["Class",       receipt.className],
                  ["Amount Paid", `GH₵${receipt.amount.toLocaleString()}`],
                  ["Method",      receipt.method],
                  ["Reference",   receipt.reference],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-gray-900 text-right max-w-[60%] break-all">{val}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-200 my-3" />
              <p className="text-[10px] text-gray-400 text-center">
                Official receipt — Phoenix International School Ghana.<br />Please keep this for your records.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={() => setReceipt(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Close</button>
              <button type="button"
                onClick={() => {
                  const el = document.getElementById("receipt-print");
                  if (!el) return;
                  const w = window.open("", "_blank");
                  if (!w) return;
                  w.document.write(`<html><head><title>Receipt ${receipt.receiptNo}</title><style>body{font-family:sans-serif;padding:24px;max-width:340px;margin:auto}.row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}.label{color:#666}.val{font-weight:700;text-align:right}.divider{border-top:1px dashed #ccc;margin:12px 0}.footer{text-align:center;font-size:10px;color:#999;margin-top:8px}</style></head><body>${el.innerHTML}<script>window.print();window.close();</script></body></html>`);
                  w.document.close();
                }}
                className="btn-gold flex-1 py-2.5">🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
