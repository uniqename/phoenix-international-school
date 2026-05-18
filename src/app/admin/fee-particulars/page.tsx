"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { FeeParticular, InstantFeeBucket, StandaloneFeeDiscount, FeeFrequency, StandaloneDiscountType, StudentCategory } from "@/lib/types";
import toast from "react-hot-toast";

type Tab = "particulars" | "instant" | "discounts";

const FREQ_LABEL: Record<FeeFrequency, string> = {
  one_time: "One-time",
  per_term: "Per term",
  per_session: "Per session",
  monthly: "Monthly",
};

export default function FeeParticularsPage() {
  const particulars = useAppStore((s) => s.feeParticulars);
  const instantBuckets = useAppStore((s) => s.instantBuckets);
  const standaloneDiscounts = useAppStore((s) => s.standaloneDiscounts);
  const addParticular = useAppStore((s) => s.addFeeParticular);
  const updateParticular = useAppStore((s) => s.updateFeeParticular);
  const deleteParticular = useAppStore((s) => s.deleteFeeParticular);
  const reorderParticulars = useAppStore((s) => s.reorderFeeParticulars);
  const addBucket = useAppStore((s) => s.addInstantBucket);
  const updateBucket = useAppStore((s) => s.updateInstantBucket);
  const deleteBucket = useAppStore((s) => s.deleteInstantBucket);
  const addDiscount = useAppStore((s) => s.addStandaloneDiscount);
  const updateDiscount = useAppStore((s) => s.updateStandaloneDiscount);
  const deleteDiscount = useAppStore((s) => s.deleteStandaloneDiscount);

  const [tab, setTab] = useState<Tab>("particulars");

  // New particular form
  const [pName, setPName] = useState("");
  const [pFreq, setPFreq] = useState<FeeFrequency>("per_term");
  const [pAccount, setPAccount] = useState("Fee");
  const [pCategories, setPCategories] = useState<StudentCategory[]>([]);

  // New bucket form
  const [bParticular, setBParticular] = useState("");
  const [bName, setBName] = useState("");
  const [bAmount, setBAmount] = useState("");
  const [bAutoDeduct, setBAutoDeduct] = useState(true);

  // New discount form
  const [dName, setDName] = useState("");
  const [dType, setDType] = useState<StandaloneDiscountType>("percent");
  const [dValue, setDValue] = useState("");
  const [dOnMain, setDOnMain] = useState(true);

  const onAddParticular = () => {
    if (!pName.trim()) { toast.error("Name required"); return; }
    const maxPri = Math.max(0, ...particulars.map((p) => p.priority));
    addParticular({
      name: pName.trim().toUpperCase(),
      priority: maxPri + 1,
      frequency: pFreq,
      finance_account: pAccount.trim() || "Fee",
      applies_to_categories: pCategories.length > 0 ? pCategories : undefined,
      active: true,
    });
    setPName("");
    toast.success("Fee particular added");
  };

  const moveParticular = (id: string, dir: -1 | 1) => {
    const ordered = [...particulars].sort((a, b) => a.priority - b.priority);
    const idx = ordered.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ordered.length) return;
    [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];
    reorderParticulars(ordered.map((p) => p.id));
  };

  const onAddBucket = () => {
    if (!bParticular) { toast.error("Pick a parent fee particular"); return; }
    if (!bName.trim()) { toast.error("Bucket name required"); return; }
    const amount = parseFloat(bAmount);
    if (Number.isNaN(amount) || amount < 0) { toast.error("Amount must be ≥ 0"); return; }
    addBucket({
      particular_id: bParticular,
      bucket_name: bName.trim().toUpperCase(),
      amount,
      auto_deduct: bAutoDeduct,
    });
    setBName("");
    setBAmount("");
    toast.success("Instant fee bucket added");
  };

  const onAddDiscount = () => {
    if (!dName.trim()) { toast.error("Name required"); return; }
    const value = parseFloat(dValue);
    if (Number.isNaN(value) || value < 0) { toast.error("Value must be ≥ 0"); return; }
    if (dType === "percent" && value > 100) { toast.error("Percent must be 0–100"); return; }
    addDiscount({
      name: dName.trim().toUpperCase(),
      type: dType,
      value,
      on_main_fees: dOnMain,
      active: true,
    });
    setDName("");
    setDValue("");
    toast.success("Discount added");
  };

  const tabs: Array<{ key: Tab; label: string; emoji: string; count: number }> = [
    { key: "particulars", label: "Fees Particulars", emoji: "📑", count: particulars.length },
    { key: "instant",     label: "Instant Fees",     emoji: "⚡", count: instantBuckets.length },
    { key: "discounts",   label: "Fee Discounts",    emoji: "🏷️", count: standaloneDiscounts.length },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📑 Fee Particulars</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Define what fee types the school charges, how they apply, and which standalone discounts can reduce them. Priority order controls which fee gets paid first when a parent partial-pays.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: tab === t.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {t.emoji} {t.label} <span className="opacity-70">· {t.count}</span>
            </button>
          ))}
        </div>

        {/* PARTICULARS TAB */}
        {tab === "particulars" && (
          <section className="glass rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500">Drag-equivalent: use ↑ ↓ to reorder. Lower priority = applied first when a partial payment lands.</p>
            <ul className="divide-y">
              {particulars.length === 0 && (
                <li className="text-center py-6 text-sm text-gray-400">
                  <p className="text-3xl mb-1">📑</p>
                  No fee particulars yet — add one below.
                </li>
              )}
              {[...particulars].sort((a, b) => a.priority - b.priority).map((p) => (
                <li key={p.id} className="py-3 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 w-10 text-center">{p.priority}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {FREQ_LABEL[p.frequency]}
                      {p.applies_to_categories && p.applies_to_categories.length > 0 && ` · ${p.applies_to_categories.join(", ")} only`}
                      {p.finance_account && ` · ${p.finance_account} account`}
                      {!p.active && " · inactive"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => moveParticular(p.id, -1)}>↑</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => moveParticular(p.id, 1)}>↓</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                      const next = prompt("Rename:", p.name);
                      if (next && next.trim()) updateParticular(p.id, { name: next.trim().toUpperCase() });
                    }}>Rename</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateParticular(p.id, { active: !p.active })}>{p.active ? "Deactivate" : "Activate"}</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                      if (confirm(`Delete ${p.name}? Any unsaved billings using it will lose this row.`)) deleteParticular(p.id);
                    }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4 mt-4">
              <p className="text-sm font-bold text-indigo-900 mb-2">➕ Add a new fee particular</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-bold">Name</label>
                  <input className="input" placeholder="e.g. SPORTS DAY FEE" value={pName} onChange={(e) => setPName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Frequency</label>
                  <select className="input" value={pFreq} onChange={(e) => setPFreq(e.target.value as FeeFrequency)}>
                    <option value="one_time">One-time</option>
                    <option value="per_term">Per term</option>
                    <option value="per_session">Per session</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Account</label>
                  <input className="input" placeholder="Fee" value={pAccount} onChange={(e) => setPAccount(e.target.value)} />
                </div>
                <button type="button" className="btn-gold" onClick={onAddParticular}>+ Add</button>
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5" checked={pCategories.includes("new")} onChange={(e) => setPCategories((p) => e.target.checked ? [...p, "new"] : p.filter((x) => x !== "new"))} />
                  New students only
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5" checked={pCategories.includes("continuing")} onChange={(e) => setPCategories((p) => e.target.checked ? [...p, "continuing"] : p.filter((x) => x !== "continuing"))} />
                  Continuing only
                </label>
              </div>
            </div>

            <style jsx>{`
              .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
              .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            `}</style>
          </section>
        )}

        {/* INSTANT BUCKETS TAB */}
        {tab === "instant" && (
          <section className="glass rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500">
              Instant Fees split one fee particular into multiple amount buckets. Example: FEEDING FEE → FULL FEEDING / THIRD CHILD / FOURTH CHILD / DISCOUNT. Toggle Auto-Deduct to pull from family wallet without admin action.
            </p>
            <ul className="divide-y">
              {instantBuckets.length === 0 && (
                <li className="text-center py-6 text-sm text-gray-400">
                  <p className="text-3xl mb-1">⚡</p>
                  No instant fee buckets yet — most schools start with FEEDING FEE.
                </li>
              )}
              {instantBuckets.map((b) => {
                const parent = particulars.find((p) => p.id === b.particular_id);
                return (
                  <li key={b.id} className="py-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">GHS {b.amount.toFixed(2)}</span>
                    <div className="flex-1 min-w-[180px]">
                      <p className="font-bold text-gray-800">{b.bucket_name}</p>
                      <p className="text-xs text-gray-500">
                        Under {parent?.name ?? "deleted particular"}
                        {b.auto_deduct && " · 💰 auto-deduct from wallet"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateBucket(b.id, { auto_deduct: !b.auto_deduct })}>{b.auto_deduct ? "Disable auto" : "Enable auto"}</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                        const next = prompt("New amount (GHS):", String(b.amount));
                        if (next !== null) {
                          const v = parseFloat(next);
                          if (!Number.isNaN(v) && v >= 0) updateBucket(b.id, { amount: v });
                        }
                      }}>Edit amount</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                        if (confirm(`Delete bucket ${b.bucket_name}?`)) deleteBucket(b.id);
                      }}>Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-4 mt-4">
              <p className="text-sm font-bold text-emerald-900 mb-2">➕ Add an instant fee bucket</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-bold">Parent fee</label>
                  <select className="input" value={bParticular} onChange={(e) => setBParticular(e.target.value)}>
                    <option value="">— pick —</option>
                    {particulars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-bold">Bucket name</label>
                  <input className="input" placeholder="e.g. THIRD CHILD" value={bName} onChange={(e) => setBName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Amount (GHS)</label>
                  <input className="input" type="number" min={0} placeholder="0.00" value={bAmount} onChange={(e) => setBAmount(e.target.value)} />
                </div>
                <button type="button" className="btn-gold" onClick={onAddBucket}>+ Add</button>
              </div>
              <label className="inline-flex items-center gap-1.5 cursor-pointer mt-2 text-xs">
                <input type="checkbox" className="w-3.5 h-3.5" checked={bAutoDeduct} onChange={(e) => setBAutoDeduct(e.target.checked)} />
                <span className="font-medium">💰 Auto-deduct from family wallet</span>
              </label>
            </div>

            <style jsx>{`
              .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
              .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            `}</style>
          </section>
        )}

        {/* DISCOUNTS TAB */}
        {tab === "discounts" && (
          <section className="glass rounded-2xl p-5 space-y-4">
            <p className="text-xs text-gray-500">
              These discounts are <span className="font-bold">in addition to</span> the sibling discount tiers (set in <span className="text-indigo-700">Sibling Discount</span>). Use them for school-wide rebates, COVID relief, scholarship-style cuts, etc.
            </p>
            <ul className="divide-y">
              {standaloneDiscounts.length === 0 && (
                <li className="text-center py-6 text-sm text-gray-400">
                  <p className="text-3xl mb-1">🏷️</p>
                  No standalone discounts yet.
                </li>
              )}
              {standaloneDiscounts.map((d) => (
                <li key={d.id} className="py-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                    {d.type === "percent" ? `${d.value}%` : `GHS ${d.value.toFixed(2)}`}
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      {d.on_main_fees ? "On main fees" : "On other fees only"}
                      {!d.active && " · inactive"}
                      {d.notes && ` · ${d.notes}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateDiscount(d.id, { active: !d.active })}>{d.active ? "Deactivate" : "Activate"}</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                      const next = prompt("New value:", String(d.value));
                      if (next !== null) {
                        const v = parseFloat(next);
                        if (!Number.isNaN(v) && v >= 0) updateDiscount(d.id, { value: v });
                      }
                    }}>Edit value</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                      if (confirm(`Delete ${d.name}?`)) deleteDiscount(d.id);
                    }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-4 mt-4">
              <p className="text-sm font-bold text-rose-900 mb-2">➕ Add a standalone discount</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-bold">Name</label>
                  <input className="input" placeholder="e.g. STAFF FAMILY REBATE" value={dName} onChange={(e) => setDName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Type</label>
                  <select className="input" value={dType} onChange={(e) => setDType(e.target.value as StandaloneDiscountType)}>
                    <option value="percent">Percent</option>
                    <option value="amount">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Value</label>
                  <input className="input" type="number" min={0} placeholder={dType === "percent" ? "0–100" : "GHS"} value={dValue} onChange={(e) => setDValue(e.target.value)} />
                </div>
                <button type="button" className="btn-gold" onClick={onAddDiscount}>+ Add</button>
              </div>
              <label className="inline-flex items-center gap-1.5 cursor-pointer mt-2 text-xs">
                <input type="checkbox" className="w-3.5 h-3.5" checked={dOnMain} onChange={(e) => setDOnMain(e.target.checked)} />
                <span className="font-medium">Applies on main fees (uncheck for Other Fees only)</span>
              </label>
            </div>

            <style jsx>{`
              .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
              .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            `}</style>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
