"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { DiscountTier } from "@/lib/types";
import toast from "react-hot-toast";

export default function DiscountPage() {
  const policy = useAppStore((s) => s.discountPolicy);
  const updatePolicy = useAppStore((s) => s.updateDiscountPolicy);
  const setTiers = useAppStore((s) => s.setDiscountTiers);
  const fees = useAppStore((s) => s.fees);

  const [draftTiers, setDraftTiers] = useState<DiscountTier[]>(policy.tiers);
  const [newCount, setNewCount] = useState("");
  const [newPercent, setNewPercent] = useState("");

  const feeTypes = Array.from(new Set(fees.map((f) => f.fee_type))).filter(Boolean);
  // Also include common types in case fees list is empty
  const knownFeeTypes = Array.from(new Set([
    ...feeTypes,
    "School Fees", "Feeding Fees", "Bus / Transport Fees", "Camp Fees",
    "Uniform Fees", "Examination Fees", "Book & Stationery Fees", "Miscellaneous",
  ]));

  const toggleFeeType = (ft: string) => {
    const next = policy.applies_to_fee_types.includes(ft)
      ? policy.applies_to_fee_types.filter((x) => x !== ft)
      : [...policy.applies_to_fee_types, ft];
    updatePolicy({ applies_to_fee_types: next });
  };

  const onSaveTiers = () => {
    if (draftTiers.some((t) => t.sibling_count < 1 || t.percent < 0 || t.percent > 100)) {
      toast.error("Sibling count must be ≥ 1 and percent 0–100");
      return;
    }
    setTiers(draftTiers);
    toast.success("Tier ladder saved");
  };

  const onAddTier = () => {
    const count = Number(newCount), pct = Number(newPercent);
    if (!count || count < 1) { toast.error("Sibling count must be ≥ 1"); return; }
    if (pct < 0 || pct > 100) { toast.error("Percent must be 0–100"); return; }
    if (draftTiers.some((t) => t.sibling_count === count)) {
      toast.error(`Tier for ${count} siblings already exists`);
      return;
    }
    setDraftTiers([...draftTiers, { sibling_count: count, percent: pct }].sort((a, b) => a.sibling_count - b.sibling_count));
    setNewCount("");
    setNewPercent("");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🏷️ Sibling Discount</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Families with multiple children get a discount automatically. Set the ladder here.
            Admin can also override the auto-calculated discount per family on the Families page.
          </p>
        </header>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={policy.active}
                onChange={(e) => updatePolicy({ active: e.target.checked })}
              />
              <span className="font-medium">Sibling discount active</span>
            </label>
            <span className="text-xs text-gray-500">When off, fees are full price for every child.</span>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Discount tiers</h2>
          <p className="text-xs text-gray-500">
            Discount applies to the per-child fee for families with that many enrolled siblings.
            Example: at <span className="font-medium">3 siblings = 8%</span>, every child in a 3-child family gets 8% off.
          </p>
          <ul className="divide-y border-t border-b">
            {draftTiers.map((t, idx) => (
              <li key={t.sibling_count} className="py-2 flex items-center justify-between gap-3">
                <span className="font-medium w-32">
                  {t.sibling_count} {t.sibling_count === 1 ? "child" : "siblings"}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input max-w-[100px]"
                    value={t.percent}
                    onChange={(e) => {
                      const next = [...draftTiers];
                      next[idx] = { ...t, percent: Number(e.target.value) };
                      setDraftTiers(next);
                    }}
                  />
                  <span>% off</span>
                </div>
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => setDraftTiers(draftTiers.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="pt-2 flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-gray-500">Siblings</label>
              <input type="number" min={1} className="input max-w-[100px]" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Percent off</label>
              <input type="number" min={0} max={100} className="input max-w-[100px]" value={newPercent} onChange={(e) => setNewPercent(e.target.value)} />
            </div>
            <button className="btn-secondary" onClick={onAddTier}>Add tier</button>
            <div className="flex-1" />
            <button className="btn-gold" onClick={onSaveTiers}>Save ladder</button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Applies to fee types</h2>
          <p className="text-xs text-gray-500">Tick which fee types get the sibling discount. Most schools apply it only to School Fees.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {knownFeeTypes.map((ft) => (
              <label key={ft} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={policy.applies_to_fee_types.includes(ft)}
                  onChange={() => toggleFeeType(ft)}
                />
                <span>{ft}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-800">
          <p className="font-semibold mb-1">How it works</p>
          <ol className="list-decimal list-inside space-y-1 text-indigo-900">
            <li>Group students into a family from the Families page.</li>
            <li>System counts siblings in the family and looks up the tier.</li>
            <li>Discount auto-applies on the eligible fee types at billing time.</li>
            <li>Admin can override per family if needed (e.g. principal grants 20% to a staff family).</li>
          </ol>
        </div>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-gold { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-gold:hover { background: #2c1a73; }
          .btn-secondary { background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
        `}</style>
      </div>
    </DashboardShell>
  );
}
