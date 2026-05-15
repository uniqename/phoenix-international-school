"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";


export default function CanteenPage() {
  const wallets      = useAppStore((s) => s.canteenWallets);
  const transactions = useAppStore((s) => s.canteenTransactions);
  const topup        = useAppStore((s) => s.topupCanteen);
  const debit        = useAppStore((s) => s.debitCanteen);
  const students     = useAppStore((s) => s.students);

  const [showTopup, setShowTopup] = useState(false);
  const [showDebit, setShowDebit] = useState(false);
  const [topupForm, setTopupForm] = useState({ student_id: "", amount: "" });
  const [debitForm, setDebitForm] = useState({ student_id: "", amount: "", description: "Canteen lunch" });
  const [search, setSearch]       = useState("");

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const lowBalance   = wallets.filter((w) => w.balance < 10);

  const filtered = wallets.filter((w) =>
    (w.student_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (w.class_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleTopup = () => {
    if (!topupForm.student_id) { toast.error("Select a student"); return; }
    const amt = parseFloat(topupForm.amount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    topup(topupForm.student_id, amt);
    toast.success(`GH₵${amt} added to canteen wallet`);
    setTopupForm({ student_id: "", amount: "" });
    setShowTopup(false);
  };

  const handleDebit = () => {
    if (!debitForm.student_id) { toast.error("Select a student"); return; }
    const amt = parseFloat(debitForm.amount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    debit(debitForm.student_id, amt, debitForm.description);
    toast.success(`GH₵${amt} debited`);
    setDebitForm({ student_id: "", amount: "", description: "Canteen lunch" });
    setShowDebit(false);
  };

  const recentTx = [...transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">Canteen Wallet</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowTopup(true)} className="btn-gold text-xs py-2 px-4">+ Top-up</button>
          <button type="button" onClick={() => setShowDebit(true)}
            className="text-xs py-2 px-4 rounded-full font-bold"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            − Debit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Wallet Balance", value: formatGHS(totalBalance), color: "#22c55e", icon: "🏦" },
          { label: "Active Wallets",       value: wallets.length,           color: "#003087", icon: "💳" },
          { label: "Low Balance (< GH₵10)",value: lowBalance.length,        color: "#ef4444", icon: "⚠️" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallets */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-900">Wallet Balances</h3>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student…"
            className="w-full px-3 py-2 rounded-xl border border-blue-100 text-sm mb-3 focus:outline-none" />
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {filtered.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: w.balance < 10 ? "rgba(239,68,68,0.05)" : "rgba(34,197,94,0.04)" }}>
                <div>
                  <div className="text-sm font-bold text-gray-900">{w.student_name}</div>
                  <div className="text-xs text-gray-400">{w.class_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm" style={{ color: w.balance < 10 ? "#ef4444" : "#22c55e" }}>
                    {formatGHS(w.balance)}
                  </div>
                  {w.balance < 10 && <div className="text-[10px] text-red-400">Low balance</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Recent Transactions</h3>
          {recentTx.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="text-xs font-bold text-gray-800">{t.student_name}</div>
                    <div className="text-[11px] text-gray-400">{t.description}</div>
                    <div className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</div>
                  </div>
                  <div className={`font-black text-sm ${t.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "credit" ? "+" : "−"}{formatGHS(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black text-gray-900 text-lg mb-4">Top-up Canteen Wallet</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Student</label>
                <select value={topupForm.student_id} onChange={(e) => setTopupForm((p) => ({ ...p, student_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="">— Select student —</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.class_name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amount (GH₵)</label>
                <input type="number" value={topupForm.amount} onChange={(e) => setTopupForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowTopup(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handleTopup} className="btn-gold flex-1 py-2.5">Top-up</button>
            </div>
          </div>
        </div>
      )}

      {/* Debit Modal */}
      {showDebit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black text-gray-900 text-lg mb-4">Debit Canteen Wallet</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Student</label>
                <select value={debitForm.student_id} onChange={(e) => setDebitForm((p) => ({ ...p, student_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="">— Select student —</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amount (GH₵)</label>
                <input type="number" value={debitForm.amount} onChange={(e) => setDebitForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <input value={debitForm.description} onChange={(e) => setDebitForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Canteen lunch" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowDebit(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handleDebit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#ef4444" }}>Debit</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
