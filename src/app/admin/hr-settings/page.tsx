"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

type Tab = "categories" | "departments" | "positions";

export default function HrSettingsPage() {
  const categories = useAppStore((s) => s.employeeCategories);
  const departments = useAppStore((s) => s.employeeDepartments);
  const positions = useAppStore((s) => s.employeePositions);
  const employees = useAppStore((s) => s.employees);
  const addCategory = useAppStore((s) => s.addEmployeeCategory);
  const updateCategory = useAppStore((s) => s.updateEmployeeCategory);
  const deleteCategory = useAppStore((s) => s.deleteEmployeeCategory);
  const addDepartment = useAppStore((s) => s.addEmployeeDepartment);
  const updateDepartment = useAppStore((s) => s.updateEmployeeDepartment);
  const deleteDepartment = useAppStore((s) => s.deleteEmployeeDepartment);
  const addPosition = useAppStore((s) => s.addEmployeePosition);
  const updatePosition = useAppStore((s) => s.updateEmployeePosition);
  const deletePosition = useAppStore((s) => s.deleteEmployeePosition);

  const [tab, setTab] = useState<Tab>("categories");

  const countByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) if (e.category_id) m.set(e.category_id, (m.get(e.category_id) ?? 0) + 1);
    return m;
  }, [employees]);
  const countByDepartment = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) if (e.department_id) m.set(e.department_id, (m.get(e.department_id) ?? 0) + 1);
    return m;
  }, [employees]);
  const countByPosition = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) if (e.position_id) m.set(e.position_id, (m.get(e.position_id) ?? 0) + 1);
    return m;
  }, [employees]);

  // Add forms
  const [cName, setCName] = useState("");
  const [cCode, setCCode] = useState("");
  const [dName, setDName] = useState("");
  const [dCode, setDCode] = useState("");
  const [pName, setPName] = useState("");

  const onAddCategory = () => {
    if (!cName.trim() || !cCode.trim()) { toast.error("Name + code required"); return; }
    addCategory({ name: cName.trim(), code: cCode.trim() });
    setCName(""); setCCode("");
    toast.success("Category added");
  };
  const onAddDepartment = () => {
    if (!dName.trim() || !dCode.trim()) { toast.error("Name + code required"); return; }
    addDepartment({ name: dName.trim(), code: dCode.trim() });
    setDName(""); setDCode("");
    toast.success("Department added");
  };
  const onAddPosition = () => {
    if (!pName.trim()) { toast.error("Name required"); return; }
    addPosition({ name: pName.trim() });
    setPName("");
    toast.success("Position added");
  };

  const tabs: Array<{ key: Tab; label: string; emoji: string; count: number }> = [
    { key: "categories",  label: "Employee Categories",   emoji: "🏷️", count: categories.length },
    { key: "departments", label: "Employee Departments",  emoji: "🏛️", count: departments.length },
    { key: "positions",   label: "Employee Positions",    emoji: "💼", count: positions.length },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">🧰 HR Settings</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Define the categories, departments, and positions that staff are organised under. Used in the Employee Admission form and Payroll grouping.
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
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

        {tab === "categories" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <ul className="divide-y">
              {categories.length === 0 && <li className="text-center py-6 text-sm text-gray-400"><p className="text-3xl mb-1">🏷️</p>No categories yet.</li>}
              {categories.map((c) => (
                <li key={c.id} className="py-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 w-12 text-center">{c.code}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{countByCategory.get(c.id) ?? 0} employee{(countByCategory.get(c.id) ?? 0) === 1 ? "" : "s"}</p>
                  </div>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                    const next = prompt("Rename:", c.name);
                    if (next?.trim()) updateCategory(c.id, { name: next.trim() });
                  }}>Rename</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if ((countByCategory.get(c.id) ?? 0) > 0) { toast.error("Cannot delete — employees are using this category"); return; }
                    if (confirm(`Delete category ${c.name}?`)) deleteCategory(c.id);
                  }}>Delete</button>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 font-bold">Category name</label>
                <input className="input" placeholder="e.g. Volunteer" value={cName} onChange={(e) => setCName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Code</label>
                <input className="input" placeholder="VL" value={cCode} onChange={(e) => setCCode(e.target.value)} />
              </div>
              <button type="button" className="btn-gold" onClick={onAddCategory}>+ Add category</button>
            </div>
            <style jsx>{`
              .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
              .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            `}</style>
          </section>
        )}

        {tab === "departments" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <ul className="divide-y">
              {departments.length === 0 && <li className="text-center py-6 text-sm text-gray-400"><p className="text-3xl mb-1">🏛️</p>No departments yet.</li>}
              {departments.map((d) => (
                <li key={d.id} className="py-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 w-12 text-center">{d.code}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-500">{countByDepartment.get(d.id) ?? 0} employee{(countByDepartment.get(d.id) ?? 0) === 1 ? "" : "s"}</p>
                  </div>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                    const next = prompt("Rename:", d.name);
                    if (next?.trim()) updateDepartment(d.id, { name: next.trim() });
                  }}>Rename</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if ((countByDepartment.get(d.id) ?? 0) > 0) { toast.error("Cannot delete — employees are in this department"); return; }
                    if (confirm(`Delete department ${d.name}?`)) deleteDepartment(d.id);
                  }}>Delete</button>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 font-bold">Department name</label>
                <input className="input" placeholder="e.g. Library" value={dName} onChange={(e) => setDName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold">Code</label>
                <input className="input" placeholder="LIB" value={dCode} onChange={(e) => setDCode(e.target.value)} />
              </div>
              <button type="button" className="btn-gold" onClick={onAddDepartment}>+ Add department</button>
            </div>
            <style jsx>{`
              .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
              .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            `}</style>
          </section>
        )}

        {tab === "positions" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <ul className="divide-y">
              {positions.length === 0 && <li className="text-center py-6 text-sm text-gray-400"><p className="text-3xl mb-1">💼</p>No positions yet.</li>}
              {positions.map((p) => (
                <li key={p.id} className="py-3 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{countByPosition.get(p.id) ?? 0} employee{(countByPosition.get(p.id) ?? 0) === 1 ? "" : "s"}</p>
                  </div>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                    const next = prompt("Rename:", p.name);
                    if (next?.trim()) updatePosition(p.id, { name: next.trim() });
                  }}>Rename</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if ((countByPosition.get(p.id) ?? 0) > 0) { toast.error("Cannot delete — employees hold this position"); return; }
                    if (confirm(`Delete position ${p.name}?`)) deletePosition(p.id);
                  }}>Delete</button>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-3">
                <label className="text-xs text-gray-500 font-bold">Position name</label>
                <input className="input" placeholder="e.g. Music Teacher" value={pName} onChange={(e) => setPName(e.target.value)} />
              </div>
              <button type="button" className="btn-gold" onClick={onAddPosition}>+ Add position</button>
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
