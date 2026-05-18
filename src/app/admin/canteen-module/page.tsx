"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { MealType } from "@/lib/types";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "settings" | "menu" | "collections" | "billing" | "reset" | "reports";

const MEAL_TYPE_META: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🍳" },
  snacks:    { label: "Snacks",    emoji: "🍪" },
  brunch:    { label: "Brunch",    emoji: "🥞" },
  lunch:     { label: "Lunch",     emoji: "🍱" },
  supper:    { label: "Supper",    emoji: "🍲" },
};

export default function CanteenModulePage() {
  const meals = useAppStore((s) => s.canteenMeals);
  const feeParticulars = useAppStore((s) => s.canteenFeeParticulars);
  const menuDays = useAppStore((s) => s.canteenMenuDays);
  const wallets = useAppStore((s) => s.canteenWallets);
  const transactions = useAppStore((s) => s.canteenTransactions);
  const students = useAppStore((s) => s.students);
  const addMeal = useAppStore((s) => s.addCanteenMeal);
  const updateMeal = useAppStore((s) => s.updateCanteenMeal);
  const deleteMeal = useAppStore((s) => s.deleteCanteenMeal);
  const addFeePart = useAppStore((s) => s.addCanteenFeeParticular);
  const updateFeePart = useAppStore((s) => s.updateCanteenFeeParticular);
  const deleteFeePart = useAppStore((s) => s.deleteCanteenFeeParticular);
  const upsertDay = useAppStore((s) => s.upsertMenuDay);
  const deleteDay = useAppStore((s) => s.deleteMenuDay);
  const addItem = useAppStore((s) => s.addMenuDayItem);
  const removeItem = useAppStore((s) => s.removeMenuDayItem);
  const topUp = useAppStore((s) => s.topupCanteen);
  const debit = useAppStore((s) => s.debitCanteen);
  const resetBalances = useAppStore((s) => s.resetAllCanteenBalances);

  const [tab, setTab] = useState<Tab>("settings");

  // Settings tab — new meal
  const [mName, setMName] = useState("");
  const [mType, setMType] = useState<MealType>("lunch");
  const [mPrice, setMPrice] = useState("");
  const onAddMeal = () => {
    if (!mName.trim()) { toast.error("Meal name required"); return; }
    const price = parseFloat(mPrice);
    addMeal({ name: mName.trim(), type: mType, price: Number.isNaN(price) ? undefined : price, active: true });
    setMName(""); setMPrice("");
    toast.success("Meal added");
  };

  // New fee particular
  const [fpName, setFpName] = useState("");
  const [fpAmount, setFpAmount] = useState("");
  const onAddFp = () => {
    if (!fpName.trim()) { toast.error("Name required"); return; }
    const amt = parseFloat(fpAmount);
    if (Number.isNaN(amt) || amt < 0) { toast.error("Amount must be ≥ 0"); return; }
    addFeePart({ name: fpName.trim().toUpperCase(), default_amount: amt, active: true });
    setFpName(""); setFpAmount("");
    toast.success("Fee particular added");
  };

  // Menu tab — selected day
  const today = new Date().toISOString().split("T")[0];
  const [menuDate, setMenuDate] = useState(today);
  const [menuMealId, setMenuMealId] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const menuDay = menuDays.find((d) => d.date === menuDate);

  const ensureMenuDay = () => menuDay ?? upsertDay({ date: menuDate, items: [] });
  const onAddMenuItem = () => {
    if (!menuMealId) { toast.error("Pick a meal"); return; }
    const day = ensureMenuDay();
    const price = parseFloat(menuPrice);
    addItem(day.id, { meal_id: menuMealId, override_price: Number.isNaN(price) ? undefined : price });
    setMenuMealId(""); setMenuPrice("");
    toast.success("Menu item added");
  };

  // Collections tab
  const [collSearch, setCollSearch] = useState("");
  const [collAmount, setCollAmount] = useState("");
  const [collStudentId, setCollStudentId] = useState("");
  const collFiltered = useMemo(() => {
    const q = collSearch.trim().toLowerCase();
    return students.filter((s) =>
      !q || s.full_name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [students, collSearch]);
  const onCollect = () => {
    if (!collStudentId) { toast.error("Pick a student"); return; }
    const amt = parseFloat(collAmount);
    if (Number.isNaN(amt) || amt <= 0) { toast.error("Amount must be > 0"); return; }
    topUp(collStudentId, amt);
    toast.success(`Top-up of ${formatGHS(amt)} recorded`);
    setCollAmount("");
  };
  const onDebit = (studentId: string) => {
    const amtStr = prompt("Amount to deduct (GHS):");
    if (!amtStr) return;
    const amt = parseFloat(amtStr);
    if (Number.isNaN(amt) || amt <= 0) { toast.error("Amount must be > 0"); return; }
    const desc = prompt("Description:") ?? "Canteen purchase";
    debit(studentId, amt, desc);
    toast.success(`${formatGHS(amt)} deducted`);
  };

  // Reset tab
  const [resetConfirm, setResetConfirm] = useState("");
  const doReset = () => {
    if (resetConfirm !== "RESET") { toast.error('Type "RESET" to confirm'); return; }
    const n = resetBalances();
    setResetConfirm("");
    toast.success(`✅ ${n} canteen wallet${n === 1 ? "" : "s"} reset to zero`);
  };

  // Reports derived
  const totals = useMemo(() => {
    const balance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const credits = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const debits = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    return { balance, credits, debits, students: wallets.length };
  }, [wallets, transactions]);

  const tabs: Array<{ key: Tab; label: string; emoji: string }> = [
    { key: "settings",    label: "Settings",        emoji: "⚙️" },
    { key: "menu",        label: "Menu",            emoji: "🍽️" },
    { key: "collections", label: "Collections",     emoji: "💰" },
    { key: "billing",     label: "Billing",         emoji: "🧾" },
    { key: "reset",       label: "Reset Balances",  emoji: "♻️" },
    { key: "reports",     label: "Reports",         emoji: "📊" },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">🍱 Canteen</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Manage meals, daily menus, fee particulars (with family-size pricing), collections, billing, term-end resets, and reports.
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: tab === t.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {tab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">🍽️ Meals</h3>
              <ul className="divide-y">
                {meals.length === 0 && <li className="text-center py-4 text-sm text-gray-400">No meals yet.</li>}
                {meals.map((m) => (
                  <li key={m.id} className="py-2 flex items-center gap-2">
                    <span className="text-lg">{MEAL_TYPE_META[m.type].emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{MEAL_TYPE_META[m.type].label}{m.price !== undefined && ` · ${formatGHS(m.price)}`}{!m.active && " · inactive"}</p>
                    </div>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateMeal(m.id, { active: !m.active })}>{m.active ? "Hide" : "Show"}</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                      if (confirm(`Delete ${m.name}?`)) deleteMeal(m.id);
                    }}>×</button>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 space-y-2">
                <p className="text-sm font-bold text-indigo-900">➕ Add meal</p>
                <input className="input" placeholder="Meal name" value={mName} onChange={(e) => setMName(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="input" value={mType} onChange={(e) => setMType(e.target.value as MealType)}>
                    {Object.entries(MEAL_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                  <input className="input" type="number" placeholder="Price (GHS)" value={mPrice} onChange={(e) => setMPrice(e.target.value)} />
                </div>
                <button type="button" className="btn-gold w-full" onClick={onAddMeal}>+ Add meal</button>
              </div>
            </section>

            <section className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">🧾 Canteen Fee Particulars</h3>
              <p className="text-xs text-gray-500">Per family-size pricing — Family of Three / Four / Discount mirrors Adesua doc.</p>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">Fee</th>
                    <th className="text-right py-2">Default amount</th>
                    <th className="text-right py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {feeParticulars.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-sm text-gray-400">No fee particulars.</td></tr>}
                  {feeParticulars.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{p.name}</td>
                      <td className="py-2 text-right font-mono">{formatGHS(p.default_amount)}</td>
                      <td className="py-2 text-right">
                        <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 mr-1" onClick={() => {
                          const next = prompt("New amount:", String(p.default_amount));
                          if (next !== null) {
                            const v = parseFloat(next);
                            if (!Number.isNaN(v) && v >= 0) updateFeePart(p.id, { default_amount: v });
                          }
                        }}>Edit</button>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) deleteFeePart(p.id);
                        }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-3 space-y-2">
                <p className="text-sm font-bold text-emerald-900">➕ New particular</p>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="FEEDING FEE - VIP" value={fpName} onChange={(e) => setFpName(e.target.value)} />
                  <input className="input" type="number" placeholder="Amount" value={fpAmount} onChange={(e) => setFpAmount(e.target.value)} />
                </div>
                <button type="button" className="btn-gold w-full" onClick={onAddFp}>+ Add</button>
              </div>
            </section>
          </div>
        )}

        {tab === "menu" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</label>
                <input className="input" type="date" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} />
              </div>
              {menuDay && (
                <button type="button" className="text-xs px-3 py-1.5 rounded-full font-bold bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                  if (confirm(`Delete menu for ${menuDate}?`)) {
                    deleteDay(menuDay.id);
                    toast.success("Menu cleared");
                  }
                }}>Clear day</button>
              )}
            </div>

            {!menuDay ? (
              <p className="text-center py-8 text-sm text-gray-400">
                <span className="block text-4xl mb-1">🍽️</span>
                No menu set for {menuDate} yet — add items below.
              </p>
            ) : (
              <ul className="divide-y">
                {menuDay.items.length === 0 && <li className="text-sm text-gray-400 py-3 text-center">No items yet.</li>}
                {menuDay.items.map((it) => {
                  const meal = meals.find((m) => m.id === it.meal_id);
                  const price = it.override_price ?? meal?.price ?? 0;
                  return (
                    <li key={it.id} className="py-2 flex items-center gap-2">
                      <span className="text-lg">{meal ? MEAL_TYPE_META[meal.type].emoji : "🍴"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{meal?.name ?? "deleted meal"}</p>
                        <p className="text-xs text-gray-500">{meal && MEAL_TYPE_META[meal.type].label} · {formatGHS(price)}</p>
                      </div>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => removeItem(menuDay.id, it.id)}>Remove</button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 space-y-2">
              <p className="text-sm font-bold text-indigo-900">➕ Add item to {menuDate}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <select className="input md:col-span-2" value={menuMealId} onChange={(e) => setMenuMealId(e.target.value)}>
                  <option value="">— pick meal —</option>
                  {meals.filter((m) => m.active).map((m) => <option key={m.id} value={m.id}>{MEAL_TYPE_META[m.type].emoji} {m.name} ({MEAL_TYPE_META[m.type].label}{m.price !== undefined ? ` · ${formatGHS(m.price)}` : ""})</option>)}
                </select>
                <input className="input" type="number" placeholder="Override price (optional)" value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} />
                <button type="button" className="btn-gold md:col-span-3" onClick={onAddMenuItem}>+ Add to menu</button>
              </div>
            </div>
          </section>
        )}

        {tab === "collections" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-black text-gray-900">💰 Top up / Debit student wallets</h3>
            <input className="input max-w-sm" placeholder="Search by name or ID" value={collSearch} onChange={(e) => setCollSearch(e.target.value)} />
            <ul className="divide-y max-h-96 overflow-y-auto">
              {collFiltered.map((s) => {
                const w = wallets.find((x) => x.student_id === s.id);
                return (
                  <li key={s.id} className="py-2 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800">{s.full_name}</p>
                      <p className="text-xs text-gray-500">{s.class_name}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: (w?.balance ?? 0) > 0 ? "#16a34a" : "#6b7280" }}>{formatGHS(w?.balance ?? 0)}</span>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => setCollStudentId(s.id)}>{collStudentId === s.id ? "✓ selected" : "Select"}</button>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => onDebit(s.id)}>Debit</button>
                  </li>
                );
              })}
            </ul>
            {collStudentId && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[160px]">
                  <p className="text-xs text-emerald-900 font-bold">Top up: {students.find((s) => s.id === collStudentId)?.full_name}</p>
                  <input className="input mt-1" type="number" placeholder="Amount (GHS)" value={collAmount} onChange={(e) => setCollAmount(e.target.value)} />
                </div>
                <button type="button" className="btn-gold" onClick={onCollect}>💰 Record top-up</button>
                <button type="button" className="text-xs px-3 py-2 rounded-full font-bold bg-gray-100 text-gray-700" onClick={() => { setCollStudentId(""); setCollAmount(""); }}>Cancel</button>
              </div>
            )}
          </section>
        )}

        {tab === "billing" && (
          <section className="glass rounded-2xl p-5">
            <h3 className="font-black text-gray-900 mb-2">🧾 Bulk billing</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use the <span className="font-bold text-indigo-700">Fee Billing Setup</span> page to create a termly bulk-bill for FEEDING FEE and roll it out across classes with family-size pricing applied per family. This tab focuses on per-day canteen collections and balances above.
            </p>
            <a href="/admin/fee-billing" className="btn-gold inline-block">Go to Fee Billing Setup →</a>
          </section>
        )}

        {tab === "reset" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <p className="font-black text-amber-900">♻️ Reset all canteen wallets</p>
              <p className="text-sm text-amber-900 mt-1">
                This zeroes every student&apos;s canteen wallet balance and logs a &ldquo;Term reset&rdquo; debit on each. Use at term-end. Cannot be undone — past credits/debits stay in the transaction log.
              </p>
              <div className="mt-3 flex gap-2 items-center flex-wrap">
                <input className="input max-w-[160px]" placeholder='Type "RESET"' value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} />
                <button type="button" className="btn-gold" onClick={doReset}>Reset {wallets.length} wallet{wallets.length === 1 ? "" : "s"}</button>
              </div>
            </div>
          </section>
        )}

        {tab === "reports" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-2xl font-black text-emerald-700">{formatGHS(totals.balance)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total wallet balance</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-2xl font-black text-indigo-700">{formatGHS(totals.credits)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Credits (top-ups)</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-2xl font-black text-amber-700">{formatGHS(totals.debits)}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Debits (purchases)</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-2xl font-black text-purple-700">{totals.students}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Students with wallets</p>
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
