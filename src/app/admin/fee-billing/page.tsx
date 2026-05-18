"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { FeeBilling, FeeBillingItem, StudentCategory } from "@/lib/types";
import toast from "react-hot-toast";

export default function FeeBillingPage() {
  const billings = useAppStore((s) => s.feeBillings);
  const upsert = useAppStore((s) => s.upsertFeeBilling);
  const del = useAppStore((s) => s.deleteFeeBilling);
  const addItem = useAppStore((s) => s.addBillingItem);
  const updateItem = useAppStore((s) => s.updateBillingItem);
  const removeItem = useAppStore((s) => s.removeBillingItem);
  const publish = useAppStore((s) => s.publishBilling);

  const particulars = useAppStore((s) => s.feeParticulars);
  const classes = useAppStore((s) => s.classes);
  const settings = useAppStore((s) => s.schoolSettings);

  const [selectedId, setSelectedId] = useState(billings[0]?.id ?? "");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(settings.current_academic_year);
  const [newTerm, setNewTerm] = useState<1 | 2 | 3>(settings.current_term);

  // Add item form
  const [iParticular, setIParticular] = useState("");
  const [iAmount, setIAmount] = useState("");
  const [iClasses, setIClasses] = useState<string[]>([]);
  const [iCategories, setICategories] = useState<StudentCategory[]>([]);
  const [iDueDate, setIDueDate] = useState("");

  const selected = useMemo(() => billings.find((b) => b.id === selectedId), [billings, selectedId]);

  const onCreateBilling = () => {
    if (!newName.trim()) { toast.error("Name required"); return; }
    const created = upsert({
      name: newName.trim().toUpperCase(),
      academic_year: newYear,
      term: newTerm,
      items: [],
      is_published: false,
    });
    setSelectedId(created.id);
    setNewName("");
    setShowNew(false);
    toast.success("Billing created");
  };

  const onAddItem = () => {
    if (!selected) return;
    if (selected.is_published) { toast.error("This billing is already published; create a new one to add items"); return; }
    if (!iParticular) { toast.error("Pick a fee particular"); return; }
    const amount = parseFloat(iAmount);
    if (Number.isNaN(amount) || amount <= 0) { toast.error("Amount must be > 0"); return; }
    if (iClasses.length === 0) { toast.error("Pick at least one class (or All Classes)"); return; }
    const allSelected = iClasses.includes("__all__");
    addItem(selected.id, {
      particular_id: iParticular,
      amount,
      class_ids: allSelected ? [] : iClasses,
      categories: iCategories.length > 0 ? iCategories : undefined,
      due_date: iDueDate || undefined,
    });
    setIParticular("");
    setIAmount("");
    setIClasses([]);
    setICategories([]);
    setIDueDate("");
    toast.success("Fee row added");
  };

  const onPublish = () => {
    if (!selected) return;
    if (selected.is_published) { toast.error("Already published"); return; }
    if (selected.items.length === 0) { toast.error("Add at least one fee row first"); return; }
    if (!confirm(`Publish "${selected.name}"? This creates a fee bill for every matching student. Cannot be undone (but you can edit individual student bills afterwards in Fee Management).`)) return;
    const result = publish(selected.id);
    if (result.ok) {
      toast.success(`✅ Published — ${result.created} fee bill${result.created === 1 ? "" : "s"} created. Sibling discounts auto-applied where active.`, { duration: 6000 });
    } else {
      toast.error(result.reason);
    }
  };

  const classNameById = (id: string) => classes.find((c) => c.id === id)?.name ?? "?";

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">📊 Fee Billing Setup</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              Define what every class pays each term. When you publish, the system creates a fee bill for every matching student — sibling discounts auto-applied.
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={() => setShowNew(!showNew)}>+ New billing</button>
        </header>

        {showNew && (
          <div className="glass rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-bold">Billing name</label>
              <input className="input" placeholder="e.g. 2026-2027 FIRST TERM FEES" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold">Academic year</label>
              <input className="input" placeholder="2026/2027" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold">Term</label>
              <select className="input" value={newTerm} onChange={(e) => setNewTerm(Number(e.target.value) as 1 | 2 | 3)}>
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>
            <button type="button" className="btn-gold" onClick={onCreateBilling}>Create</button>
          </div>
        )}

        {/* Billing picker pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {billings.length === 0 && <p className="text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>No billings yet.</p>}
          {billings.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedId(b.id)}
              className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: selectedId === b.id ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: selectedId === b.id ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {b.is_published ? "✅ " : "📝 "}{b.name} <span className="opacity-70">· T{b.term}</span>
            </button>
          ))}
        </div>

        {selected && (
          <section className="glass rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-black text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-500">
                  Academic year {selected.academic_year} · Term {selected.term} · {selected.items.length} fee row{selected.items.length === 1 ? "" : "s"}
                  {selected.is_published && selected.published_at && ` · published ${new Date(selected.published_at).toLocaleString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                {!selected.is_published && (
                  <button type="button" className="btn-gold" onClick={onPublish}>🚀 Publish to students</button>
                )}
                {!selected.is_published && (
                  <button type="button" className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold" onClick={() => {
                    if (confirm(`Delete "${selected.name}"? Only unpublished billings can be deleted.`)) {
                      del(selected.id);
                      setSelectedId(billings.filter((b) => b.id !== selected.id)[0]?.id ?? "");
                      toast.success("Billing deleted");
                    }
                  }}>Delete billing</button>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-400 border-b">
                <tr>
                  <th className="text-left py-2 px-2">Fee Particular</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Classes</th>
                  <th className="text-left py-2 px-2">Categories</th>
                  <th className="text-left py-2 px-2">Due</th>
                  <th className="text-right py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-400">No fee rows yet — add some below.</td></tr>
                )}
                {selected.items.map((it: FeeBillingItem) => {
                  const part = particulars.find((p) => p.id === it.particular_id);
                  return (
                    <tr key={it.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 font-bold text-gray-800">{part?.name ?? "?"}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-700 font-bold">GHS {it.amount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">
                        {it.class_ids.length === 0 ? "All classes" : it.class_ids.map(classNameById).join(", ")}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600">
                        {it.categories && it.categories.length > 0 ? it.categories.join(", ") : "All"}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600">{it.due_date ?? "—"}</td>
                      <td className="py-2 px-2 text-right">
                        {!selected.is_published && (
                          <>
                            <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 mr-1" onClick={() => {
                              const next = prompt("New amount:", String(it.amount));
                              if (next !== null) {
                                const v = parseFloat(next);
                                if (!Number.isNaN(v) && v >= 0) updateItem(selected.id, it.id, { amount: v });
                              }
                            }}>Edit</button>
                            <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => removeItem(selected.id, it.id)}>Remove</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!selected.is_published && (
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4">
                <p className="text-sm font-bold text-indigo-900 mb-2">➕ Add fee row</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Fee particular</label>
                    <select className="input" value={iParticular} onChange={(e) => setIParticular(e.target.value)}>
                      <option value="">— pick —</option>
                      {particulars.filter((p) => p.active).sort((a, b) => a.priority - b.priority).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Amount (GHS)</label>
                    <input className="input" type="number" min={0} placeholder="0.00" value={iAmount} onChange={(e) => setIAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold">Due date (optional)</label>
                    <input className="input" type="date" value={iDueDate} onChange={(e) => setIDueDate(e.target.value)} />
                  </div>
                  <button type="button" className="btn-gold" onClick={onAddItem}>+ Add row</button>
                </div>

                <p className="text-xs text-gray-500 font-bold mt-3">Classes (pick which classes this row applies to)</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setIClasses(iClasses.includes("__all__") ? [] : ["__all__"])}
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{
                      background: iClasses.includes("__all__") ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                      color: iClasses.includes("__all__") ? "white" : "#374151",
                    }}
                  >
                    All classes
                  </button>
                  {classes.sort((a, b) => a.order - b.order).map((c) => {
                    const active = !iClasses.includes("__all__") && iClasses.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setIClasses((prev) => {
                          const noAll = prev.filter((x) => x !== "__all__");
                          return noAll.includes(c.id) ? noAll.filter((x) => x !== c.id) : [...noAll, c.id];
                        })}
                        className="text-xs px-3 py-1 rounded-full font-bold"
                        style={{
                          background: active ? "rgba(26,63,160,0.15)" : "rgba(0,0,0,0.04)",
                          color: active ? "#1A3FA0" : "#6b7280",
                          border: active ? "1px solid rgba(26,63,160,0.4)" : "1px solid transparent",
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 font-bold mt-3">Student category (optional)</p>
                <div className="flex gap-3 mt-1 text-xs">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5" checked={iCategories.includes("new")} onChange={(e) => setICategories((p) => e.target.checked ? [...p, "new"] : p.filter((x) => x !== "new"))} />
                    New students only
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5" checked={iCategories.includes("continuing")} onChange={(e) => setICategories((p) => e.target.checked ? [...p, "continuing"] : p.filter((x) => x !== "continuing"))} />
                    Continuing only
                  </label>
                  <span className="text-gray-400 italic">Leave both unchecked to apply to both</span>
                </div>
              </div>
            )}

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
