"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

// Free Paystack settlement reconciliation.
//
// Workflow:
//   1. Admin logs into dashboard.paystack.com → Settlements → Download CSV
//      (weekly is fine — Paystack settles in batches).
//   2. Upload that CSV here. We match each row's `reference` to a stored
//      FeePaymentRequest and mark it `settled = true` so the school knows
//      the money actually landed in their bank.
//
// We're loose about column names because Paystack tweaks them over time.
// Accepted: reference / paystack reference / ref, amount / paid amount,
// settled on / settlement date / paid at.

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    // Naive CSV split — Paystack rarely uses commas inside fields, but we
    // strip surrounding quotes just in case.
    const cells = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

const REF_KEYS = ["reference", "paystack reference", "ref", "transaction_reference"];
const AMOUNT_KEYS = ["amount", "paid amount", "amount paid", "paid_amount"];
const SETTLED_KEYS = ["settled on", "settlement date", "settled_on", "paid at", "paid_at"];

function pick(row: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) if (row[k]) return row[k];
  return undefined;
}

export default function SettlementsPage() {
  const reqs = useAppStore((s) => s.feePaymentRequests);
  const reconcile = useAppStore((s) => s.reconcilePaystackSettlements);

  const [preview, setPreview] = useState<Array<{ reference: string; amount: number; settled_on?: string }>>([]);
  const [csvFile, setCsvFile] = useState<string>("");

  const stats = useMemo(() => ({
    total: reqs.length,
    paid: reqs.filter((r) => r.status === "paid").length,
    settled: reqs.filter((r) => r.settled).length,
    pendingSettlement: reqs.filter((r) => r.status === "paid" && !r.settled).length,
  }), [reqs]);

  const handleFile = (file: File) => {
    setCsvFile(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ""));
      const parsed = rows.flatMap((r) => {
        const ref = pick(r, REF_KEYS)?.trim();
        const amtStr = pick(r, AMOUNT_KEYS);
        if (!ref || !amtStr) return [];
        // Paystack amounts can be GHS or pesewas depending on report — normalise.
        let amt = Number(String(amtStr).replace(/[^0-9.]/g, ""));
        if (Number.isFinite(amt) && amt > 1_000_000) amt = amt / 100; // pesewas → GHS
        return [{ reference: ref, amount: amt, settled_on: pick(r, SETTLED_KEYS) }];
      });
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleReconcile = () => {
    if (preview.length === 0) { toast.error("Upload a CSV first"); return; }
    const res = reconcile(preview);
    toast.success(`✅ Reconciled ${res.matched} payment${res.matched === 1 ? "" : "s"}. ${res.alreadySettled} were already settled. ${res.unmatched} CSV rows didn't match any in-app payment.`, { duration: 8000 });
    setPreview([]);
    setCsvFile("");
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">🔁 Paystack Settlement Reconciliation</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Match Paystack&apos;s settlement reports against payments collected in-app. Free — no webhook, no server. Download the CSV weekly from dashboard.paystack.com → Settlements.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="glass rounded-2xl p-3">
          <div className="text-xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total requests</div>
        </div>
        <div className="glass rounded-2xl p-3">
          <div className="text-xl font-black text-emerald-300">{stats.paid}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Paid (collected)</div>
        </div>
        <div className="glass rounded-2xl p-3">
          <div className="text-xl font-black text-blue-300">{stats.settled}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Settled to bank</div>
        </div>
        <div className="glass rounded-2xl p-3" style={{ background: stats.pendingSettlement > 0 ? "rgba(245,158,11,0.15)" : undefined }}>
          <div className="text-xl font-black text-amber-300">{stats.pendingSettlement}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Awaiting settlement</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 mb-4 space-y-3">
        <h3 className="font-black text-white">📥 Upload Paystack settlement CSV</h3>
        <ol className="text-xs text-gray-400 list-decimal pl-5 space-y-1">
          <li>Sign in to <span className="font-mono">dashboard.paystack.com</span>.</li>
          <li>Open <span className="font-mono">Settlements → Filter by date → Download CSV</span>.</li>
          <li>Drop the file below — we&apos;ll match each transaction by reference.</li>
        </ol>
        <input type="file" accept=".csv,text/csv" aria-label="Paystack settlement CSV"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          className="block text-xs text-gray-300" />

        {csvFile && (
          <p className="text-[11px] text-emerald-300">📎 {csvFile} · {preview.length} row{preview.length === 1 ? "" : "s"} parsed</p>
        )}

        {preview.length > 0 && (
          <>
            <div className="max-h-48 overflow-y-auto rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              <table className="w-full text-[11px]">
                <thead className="text-white/60 uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-right p-2">Amount (GHS)</th>
                    <th className="text-left p-2">Settled on</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-t border-white/5 text-white/85">
                      <td className="p-2 font-mono truncate max-w-[180px]">{r.reference}</td>
                      <td className="p-2 text-right">{formatGHS(r.amount)}</td>
                      <td className="p-2 text-gray-400">{r.settled_on ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 50 && <p className="text-[10px] text-gray-500 p-2">… and {preview.length - 50} more rows.</p>}
            </div>
            <button type="button" onClick={handleReconcile} className="btn-gold text-sm py-2 px-5">
              ✅ Reconcile {preview.length} payment{preview.length === 1 ? "" : "s"}
            </button>
          </>
        )}
      </div>

      <div className="glass rounded-2xl p-3">
        <h3 className="font-bold text-white text-sm mb-2">⏳ Pending settlement ({stats.pendingSettlement})</h3>
        {stats.pendingSettlement === 0 ? (
          <p className="text-xs text-gray-500">No payments waiting to be reconciled.</p>
        ) : (
          <ul className="space-y-1 max-h-72 overflow-y-auto">
            {reqs.filter((r) => r.status === "paid" && !r.settled).slice(0, 30).map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-emerald-400">💰</span>
                <span className="font-mono text-white/70 truncate flex-1">{r.paystack_reference ?? r.id}</span>
                <span className="text-white font-bold">{formatGHS(r.amount)}</span>
                <span className="text-gray-400 text-[10px]">{r.paid_at ? new Date(r.paid_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
