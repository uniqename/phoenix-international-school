"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { AccountFlow } from "@/lib/types";
import toast from "react-hot-toast";

type Tab = "groups" | "chart" | "banks";

export default function FinanceAccountsPage() {
  const groups = useAppStore((s) => s.accountGroups);
  const accounts = useAppStore((s) => s.chartAccounts);
  const banks = useAppStore((s) => s.bankAccounts);
  const addGroup = useAppStore((s) => s.addAccountGroup);
  const updateGroup = useAppStore((s) => s.updateAccountGroup);
  const deleteGroup = useAppStore((s) => s.deleteAccountGroup);
  const addAccount = useAppStore((s) => s.addChartAccount);
  const updateAccount = useAppStore((s) => s.updateChartAccount);
  const deleteAccount = useAppStore((s) => s.deleteChartAccount);
  const addBank = useAppStore((s) => s.addBank);
  const updateBank = useAppStore((s) => s.updateBank);
  const deleteBank = useAppStore((s) => s.deleteBank);
  const addBranch = useAppStore((s) => s.addBankBranch);
  const removeBranch = useAppStore((s) => s.removeBankBranch);

  const [tab, setTab] = useState<Tab>("groups");

  // Group form
  const [gName, setGName] = useState("");
  const [gCode, setGCode] = useState("");
  const [gFlow, setGFlow] = useState<AccountFlow>("expense");

  // Account form
  const [aName, setAName] = useState("");
  const [aCode, setACode] = useState("");
  const [aFlow, setAFlow] = useState<AccountFlow>("expense");
  const [aGroup, setAGroup] = useState("");

  // Bank form
  const [bName, setBName] = useState("");
  const [bSort, setBSort] = useState("");
  const [bIsSchool, setBIsSchool] = useState(false);

  const accountsByGroup = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of accounts) if (a.group_id) m.set(a.group_id, (m.get(a.group_id) ?? 0) + 1);
    return m;
  }, [accounts]);

  const onAddGroup = () => {
    if (!gName.trim() || !gCode.trim()) { toast.error("Name + code required"); return; }
    addGroup({ name: gName.trim(), code: gCode.trim(), flow: gFlow });
    setGName(""); setGCode("");
    toast.success("Account group added");
  };
  const onAddAccount = () => {
    if (!aName.trim()) { toast.error("Name required"); return; }
    addAccount({ name: aName.trim(), code: aCode.trim() || undefined, flow: aFlow, group_id: aGroup || undefined, active: true });
    setAName(""); setACode("");
    toast.success("Account added");
  };
  const onAddBank = () => {
    if (!bName.trim()) { toast.error("Bank name required"); return; }
    if (bIsSchool && banks.some((x) => x.is_school_bank)) {
      toast.error("Only one bank can be the primary School Bank. Uncheck the existing one first.");
      return;
    }
    addBank({ bank_name: bName.trim(), sort_code: bSort.trim() || undefined, is_school_bank: bIsSchool });
    setBName(""); setBSort(""); setBIsSchool(false);
    toast.success("Bank added");
  };

  const tabs: Array<{ key: Tab; label: string; emoji: string; count: number }> = [
    { key: "groups", label: "Account Groups",      emoji: "🗂️", count: groups.length },
    { key: "chart",  label: "Chart of Accounts",   emoji: "📑", count: accounts.length },
    { key: "banks",  label: "Bank Accounts",       emoji: "🏦", count: banks.length },
  ];

  const flowPill = (flow: AccountFlow) => (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
      background: flow === "income" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
      color: flow === "income" ? "#16a34a" : "#a16207",
    }}>
      {flow === "income" ? "💰 Income" : "💸 Expense"}
    </span>
  );

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">🏦 Finance Accounts</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Budget categories, the chart of accounts, and bank accounts that the school&apos;s books are organised around. Every transaction in Finance Payments references these.
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
              {t.emoji} {t.label} <span className="opacity-70">· {t.count}</span>
            </button>
          ))}
        </div>

        {tab === "groups" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <ul className="divide-y">
              {groups.length === 0 && <li className="text-center py-6 text-sm text-gray-400">No account groups yet.</li>}
              {groups.map((g) => (
                <li key={g.id} className="py-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 w-16 text-center">{g.code}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-500">{accountsByGroup.get(g.id) ?? 0} account{(accountsByGroup.get(g.id) ?? 0) === 1 ? "" : "s"} in this group</p>
                  </div>
                  {flowPill(g.flow)}
                  <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                    const next = prompt("Rename:", g.name);
                    if (next?.trim()) updateGroup(g.id, { name: next.trim() });
                  }}>Rename</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if ((accountsByGroup.get(g.id) ?? 0) > 0) { toast.error("Cannot delete — accounts use this group"); return; }
                    if (confirm(`Delete ${g.name}?`)) deleteGroup(g.id);
                  }}>Delete</button>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 font-bold">Group name</label>
                <input className="input" placeholder="e.g. Cleaning Supplies" value={gName} onChange={(e) => setGName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Code</label>
                <input className="input" placeholder="CL" value={gCode} onChange={(e) => setGCode(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Flow</label>
                <select className="input" value={gFlow} onChange={(e) => setGFlow(e.target.value as AccountFlow)}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <button type="button" className="btn-gold" onClick={onAddGroup}>+ Add</button>
            </div>
          </section>
        )}

        {tab === "chart" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Account</th>
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Flow</th>
                  <th className="text-left py-2">Group</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-sm text-gray-400">No accounts yet.</td></tr>}
                {accounts.map((a) => {
                  const g = groups.find((x) => x.id === a.group_id);
                  return (
                    <tr key={a.id} className="border-b border-gray-50">
                      <td className="py-2 font-bold text-gray-800">{a.name}</td>
                      <td className="py-2 font-mono text-xs text-gray-600">{a.code ?? "—"}</td>
                      <td className="py-2">{flowPill(a.flow)}</td>
                      <td className="py-2 text-xs text-gray-600">{g?.name ?? "—"}</td>
                      <td className="py-2 text-right">
                        <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 mr-1" onClick={() => updateAccount(a.id, { active: !a.active })}>{a.active ? "Deactivate" : "Activate"}</button>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (confirm(`Delete ${a.name}?`)) deleteAccount(a.id);
                        }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 font-bold">Account name</label>
                <input className="input" placeholder="e.g. Cleaning Supplies" value={aName} onChange={(e) => setAName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Code</label>
                <input className="input" placeholder="CL" value={aCode} onChange={(e) => setACode(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Flow</label>
                <select className="input" value={aFlow} onChange={(e) => setAFlow(e.target.value as AccountFlow)}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <button type="button" className="btn-gold" onClick={onAddAccount}>+ Add</button>
              <div className="md:col-span-5">
                <label className="text-xs text-gray-500 font-bold">Group (optional)</label>
                <select className="input" value={aGroup} onChange={(e) => setAGroup(e.target.value)}>
                  <option value="">— pick —</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}

        {tab === "banks" && (
          <section className="space-y-3">
            {banks.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-gray-400">
                <p className="text-3xl mb-2">🏦</p>
                No bank accounts configured.
              </div>
            )}
            {banks.map((b) => (
              <div key={b.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900">{b.bank_name}</h3>
                      {b.is_school_bank && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.15)", color: "#a16207" }}>⭐ School Bank</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      Sort code {b.sort_code ?? "—"}
                      {b.account_number && ` · A/C ${b.account_number}`}
                      {b.account_name && ` · ${b.account_name}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(26,63,160,0.1)", color: "#1A3FA0" }} onClick={() => {
                      const acctName = prompt("Account name:", b.account_name ?? "");
                      if (acctName === null) return;
                      const acctNo = prompt("Account number:", b.account_number ?? "");
                      if (acctNo === null) return;
                      updateBank(b.id, { account_name: acctName, account_number: acctNo });
                    }}>Edit account</button>
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", color: "#a16207" }} onClick={() => updateBank(b.id, { is_school_bank: !b.is_school_bank })}>{b.is_school_bank ? "Unset school" : "Set as school"}</button>
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }} onClick={() => {
                      if (confirm(`Delete ${b.bank_name}?`)) deleteBank(b.id);
                    }}>Delete</button>
                  </div>
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branches</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {b.branches.length === 0 && <span className="text-xs text-gray-400">No branches added yet.</span>}
                  {b.branches.map((br) => (
                    <span key={br.id} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(107,33,168,0.08)", color: "#6B21A8" }}>
                      🏛️ {br.name} {br.branch_code && <span className="opacity-60 font-mono">{br.branch_code}</span>}
                      <button type="button" className="text-red-500 ml-1" onClick={() => removeBranch(b.id, br.id)} title="Remove">×</button>
                    </span>
                  ))}
                </div>
                <button type="button" className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => {
                  const name = prompt("Branch name:");
                  if (!name?.trim()) return;
                  const code = prompt("Branch code (optional):") ?? "";
                  addBranch(b.id, { name: name.trim(), branch_code: code.trim() || undefined });
                }}>+ Add branch</button>
              </div>
            ))}

            <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 font-bold">Bank name</label>
                <input className="input" placeholder="e.g. Ecobank Ghana" value={bName} onChange={(e) => setBName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Sort code</label>
                <input className="input" placeholder="003" value={bSort} onChange={(e) => setBSort(e.target.value)} />
              </div>
              <button type="button" className="btn-gold" onClick={onAddBank}>+ Add bank</button>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                <input type="checkbox" className="w-4 h-4" checked={bIsSchool} onChange={(e) => setBIsSchool(e.target.checked)} />
                <span className="font-bold">⭐ Primary school bank</span>
              </label>
            </div>
          </section>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}

