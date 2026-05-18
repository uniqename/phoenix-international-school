"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { TransactionKind, TransactionStatus, FinancePaymentMode } from "@/lib/types";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

const KIND_META: Record<TransactionKind, { label: string; emoji: string; flow: "in" | "out" | "neutral" }> = {
  payment:       { label: "Payment (Expense)", emoji: "💸", flow: "out" },
  receipt:       { label: "Receipt (Income)",  emoji: "💰", flow: "in" },
  bank_transfer: { label: "Bank Transaction",  emoji: "🏦", flow: "neutral" },
};

const STATUS_META: Record<TransactionStatus, { bg: string; fg: string; emoji: string }> = {
  pending:      { bg: "rgba(245,158,11,0.1)", fg: "#a16207", emoji: "⏳" },
  pre_approved: { bg: "rgba(168,85,247,0.1)", fg: "#6B21A8", emoji: "🟣" },
  approved:     { bg: "rgba(26,63,160,0.1)",  fg: "#1A3FA0", emoji: "✅" },
  paid:         { bg: "rgba(34,197,94,0.1)",  fg: "#16a34a", emoji: "💵" },
  rejected:     { bg: "rgba(239,68,68,0.1)",  fg: "#b91c1c", emoji: "❌" },
};

const MODE_LABEL: Record<FinancePaymentMode, string> = {
  cash:          "Cash",
  momo:          "MoMo",
  cheque:        "Cheque",
  bank_transfer: "Bank Transfer",
  card:          "Card",
  pos:           "POS",
};

export default function FinancePaymentsPage() {
  const transactions = useAppStore((s) => s.financeTransactions);
  const accounts = useAppStore((s) => s.chartAccounts);
  const banks = useAppStore((s) => s.bankAccounts);
  const create = useAppStore((s) => s.createFinanceTransaction);
  const approve = useAppStore((s) => s.approveFinanceTransaction);
  const reject = useAppStore((s) => s.rejectFinanceTransaction);
  const pay = useAppStore((s) => s.payFinanceTransaction);

  const [showModal, setShowModal] = useState(false);
  const [kind, setKind] = useState<TransactionKind>("payment");
  const [payingTo, setPayingTo] = useState("");
  const [description, setDescription] = useState("");
  const [spendingFromId, setSpendingFromId] = useState("");
  const [spendingToId, setSpendingToId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<FinancePaymentMode>("cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [preApproved, setPreApproved] = useState(true);
  const [receiptRef, setReceiptRef] = useState("");
  const [notes, setNotes] = useState("");

  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "all">("all");
  const [filterKind, setFilterKind] = useState<TransactionKind | "all">("all");

  const filtered = useMemo(() => transactions.filter((t) => {
    if (filterKind !== "all" && t.kind !== filterKind) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  }), [transactions, filterKind, filterStatus]);

  const totals = useMemo(() => {
    let inc = 0, exp = 0, pendingExp = 0, paidExp = 0;
    for (const t of transactions) {
      if (t.kind === "receipt" && t.status === "paid") inc += t.amount;
      if (t.kind === "payment") {
        exp += t.amount;
        if (t.status === "paid") paidExp += t.amount;
        else if (t.status !== "rejected") pendingExp += t.amount;
      }
    }
    return { inc, exp, pendingExp, paidExp };
  }, [transactions]);

  const reset = () => {
    setKind("payment");
    setPayingTo("");
    setDescription("");
    setSpendingFromId("");
    setSpendingToId("");
    setBankAccountId("");
    setAmount("");
    setPaymentMode("cash");
    setDate(new Date().toISOString().slice(0, 10));
    setPreApproved(true);
    setReceiptRef("");
    setNotes("");
  };

  const onSave = () => {
    if (!description.trim()) { toast.error("Description required"); return; }
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) { toast.error("Amount must be > 0"); return; }
    if (kind === "payment" && !spendingToId) { toast.error("Pick an expense account (Spending To)"); return; }
    if (kind === "receipt" && !spendingFromId) { toast.error("Pick a revenue account (Spending From)"); return; }
    if (kind === "bank_transfer" && !bankAccountId) { toast.error("Pick a bank account"); return; }
    create({
      kind,
      paying_to: payingTo.trim() || undefined,
      description: description.trim(),
      spending_from_id: spendingFromId || undefined,
      spending_to_id: spendingToId || undefined,
      bank_account_id: bankAccountId || undefined,
      amount: amt,
      payment_mode: paymentMode,
      date,
      pre_approved: preApproved,
      receipt_reference: receiptRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success("Transaction recorded");
    setShowModal(false);
    reset();
  };

  const accountName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const bankName = (id?: string) => banks.find((b) => b.id === id)?.bank_name ?? "—";

  const filterStatusOptions: Array<TransactionStatus | "all"> = ["all", "pending", "pre_approved", "approved", "paid", "rejected"];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">💸 Finance Payments</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              Record payments (expenses), receipts (income), and bank transactions. Approver workflow honours the Phase 9 RBAC permissions.
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={() => { reset(); setShowModal(true); }}>+ New transaction</button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-2xl font-black text-emerald-700">{formatGHS(totals.inc)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Receipts (paid)</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-2xl font-black text-red-600">{formatGHS(totals.paidExp)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expenses (paid)</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-2xl font-black text-amber-600">{formatGHS(totals.pendingExp)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expenses pending</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-2xl font-black" style={{ color: totals.inc - totals.paidExp >= 0 ? "#16a34a" : "#ef4444" }}>{formatGHS(totals.inc - totals.paidExp)}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net (paid only)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {(["all", "payment", "receipt", "bank_transfer"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setFilterKind(k)}
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{
                  background: filterKind === k ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                  color: filterKind === k ? "white" : "rgba(196,181,253,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}>
                {k === "all" ? "All kinds" : `${KIND_META[k].emoji} ${KIND_META[k].label}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {filterStatusOptions.map((s) => (
              <button key={s} type="button" onClick={() => setFilterStatus(s)}
                className="text-xs font-bold px-3 py-1.5 rounded-full capitalize"
                style={{
                  background: filterStatus === s ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                  color: filterStatus === s ? "white" : "rgba(196,181,253,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}>
                {s === "all" ? "All statuses" : `${STATUS_META[s].emoji} ${s.replace("_", " ")}`}
              </button>
            ))}
          </div>
        </div>

        <section className="glass rounded-2xl p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <p className="text-4xl mb-2">📒</p>
              <p className="font-bold">No transactions yet.</p>
              <p className="text-xs mt-1">Use <span className="font-bold text-indigo-700">+ New transaction</span> to record the first one.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Kind</th>
                  <th className="text-left py-2">From / To</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const km = KIND_META[t.kind];
                  const sm = STATUS_META[t.status];
                  return (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2 text-xs text-gray-500 font-mono">{t.date}</td>
                      <td className="py-2">
                        <p className="font-bold text-gray-800">{t.description}</p>
                        {t.paying_to && <p className="text-xs text-gray-500">→ {t.paying_to}</p>}
                      </td>
                      <td className="py-2 text-xs">{km.emoji} {km.label}</td>
                      <td className="py-2 text-xs text-gray-600">
                        {t.spending_from_id && <span>From: {accountName(t.spending_from_id)}</span>}
                        {t.spending_from_id && t.spending_to_id && <br />}
                        {t.spending_to_id && <span>To: {accountName(t.spending_to_id)}</span>}
                        {t.bank_account_id && <span>Bank: {bankName(t.bank_account_id)}</span>}
                      </td>
                      <td className="py-2 text-right font-mono font-bold" style={{ color: km.flow === "in" ? "#16a34a" : km.flow === "out" ? "#ef4444" : "#1A3FA0" }}>
                        {km.flow === "in" ? "+" : km.flow === "out" ? "−" : ""}{formatGHS(t.amount)}
                      </td>
                      <td className="py-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.fg }}>
                          {sm.emoji} {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {(t.status === "pending" || t.status === "pre_approved") && (
                          <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 mr-1" onClick={() => approve(t.id)}>Approve</button>
                        )}
                        {t.status === "approved" && (
                          <button type="button" className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 mr-1" onClick={() => pay(t.id)}>Mark Paid</button>
                        )}
                        {t.status !== "paid" && t.status !== "rejected" && (
                          <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                            if (confirm(`Reject "${t.description}"?`)) reject(t.id);
                          }}>Reject</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,10,30,0.7)" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 pt-5 pb-3 border-b">
                <h2 className="font-black text-lg text-gray-900">New finance transaction</h2>
                <div className="flex gap-1.5 mt-3">
                  {(["payment", "receipt", "bank_transfer"] as TransactionKind[]).map((k) => (
                    <button key={k} type="button" onClick={() => setKind(k)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        background: kind === k ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                        color: kind === k ? "white" : "#374151",
                      }}>
                      {KIND_META[k].emoji} {KIND_META[k].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {kind === "payment" && (
                  <>
                    <Field label="Paying to">
                      <input className="input" placeholder="Vendor / employee / supplier" value={payingTo} onChange={(e) => setPayingTo(e.target.value)} />
                    </Field>
                    <Field label="Spending from (revenue account, optional)">
                      <select className="input" value={spendingFromId} onChange={(e) => setSpendingFromId(e.target.value)}>
                        <option value="">— optional, e.g. School Fees if expense draws from fees —</option>
                        {accounts.filter((a) => a.flow === "income" && a.active).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Spending to (expense account) *">
                      <select className="input" value={spendingToId} onChange={(e) => setSpendingToId(e.target.value)}>
                        <option value="">— pick expense account —</option>
                        {accounts.filter((a) => a.flow === "expense" && a.active).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </Field>
                  </>
                )}

                {kind === "receipt" && (
                  <>
                    <Field label="Received from">
                      <input className="input" placeholder="Parent / source name" value={payingTo} onChange={(e) => setPayingTo(e.target.value)} />
                    </Field>
                    <Field label="Spending from (revenue account) *">
                      <select className="input" value={spendingFromId} onChange={(e) => setSpendingFromId(e.target.value)}>
                        <option value="">— pick income account —</option>
                        {accounts.filter((a) => a.flow === "income" && a.active).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </Field>
                  </>
                )}

                {kind === "bank_transfer" && (
                  <Field label="Bank account *">
                    <select className="input" value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                      <option value="">— pick bank —</option>
                      {banks.map((b) => <option key={b.id} value={b.id}>{b.bank_name}{b.is_school_bank ? " ⭐" : ""}</option>)}
                    </select>
                  </Field>
                )}

                <Field label="Description *">
                  <textarea className="input" rows={2} placeholder="What is this transaction for?" value={description} onChange={(e) => setDescription(e.target.value)} />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Field label="Date">
                    <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Amount (GHS) *">
                    <input className="input" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </Field>
                  <Field label="Payment mode">
                    <select className="input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as FinancePaymentMode)}>
                      {Object.entries(MODE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Receipt reference (optional)">
                  <input className="input" placeholder="MoMo TXN ref, cheque number, etc." value={receiptRef} onChange={(e) => setReceiptRef(e.target.value)} />
                </Field>

                <Field label="Notes (optional)">
                  <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4" checked={preApproved} onChange={(e) => setPreApproved(e.target.checked)} />
                  <span>🟣 Transaction pre-approved (skip pending state)</span>
                </label>
              </div>

              <div className="px-6 py-4 border-t flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded-full font-bold text-sm border border-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn-gold" onClick={onSave}>Save transaction</button>
              </div>
            </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
