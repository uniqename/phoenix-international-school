"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { PHOENIX_SMART_REPORT_TARGETS } from "@/lib/mockData";
import toast from "react-hot-toast";

export default function SmartReportsPage() {
  // Pull every table we expose for smart reports
  const students = useAppStore((s) => s.students);
  const employees = useAppStore((s) => s.employees);
  const families = useAppStore((s) => s.families);
  const fees = useAppStore((s) => s.fees);
  const payments = useAppStore((s) => s.payments);
  const attendance = useAppStore((s) => s.attendance);
  const guardians = useAppStore((s) => s.guardians);
  const financeTransactions = useAppStore((s) => s.financeTransactions);
  const messageLogs = useAppStore((s) => s.messageLogs);
  const enquiries = useAppStore((s) => s.enquiries);
  const savedReports = useAppStore((s) => s.smartReports);
  const saveReport = useAppStore((s) => s.saveSmartReport);
  const deleteReport = useAppStore((s) => s.deleteSmartReport);

  const [targetTable, setTargetTable] = useState("students");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filter, setFilter] = useState("");

  const target = PHOENIX_SMART_REPORT_TARGETS.find((t) => t.table === targetTable);

  // Data source by table
  const dataSource: Record<string, Record<string, unknown>[]> = useMemo(() => ({
    students: students as unknown as Record<string, unknown>[],
    employees: employees as unknown as Record<string, unknown>[],
    families: families as unknown as Record<string, unknown>[],
    fees: fees as unknown as Record<string, unknown>[],
    payments: payments as unknown as Record<string, unknown>[],
    attendance: attendance as unknown as Record<string, unknown>[],
    guardians: guardians as unknown as Record<string, unknown>[],
    finance_transactions: financeTransactions as unknown as Record<string, unknown>[],
    message_logs: messageLogs as unknown as Record<string, unknown>[],
    enquiries: enquiries as unknown as Record<string, unknown>[],
  }), [students, employees, families, fees, payments, attendance, guardians, financeTransactions, messageLogs, enquiries]);

  const rows = dataSource[targetTable] ?? [];
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [rows, filter]);

  const fieldsToShow = selectedFields.length > 0 ? selectedFields : target?.fields ?? [];

  const toggleField = (f: string) => {
    setSelectedFields((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f]);
  };

  const onSave = () => {
    const name = prompt("Name this report:");
    if (!name?.trim()) return;
    saveReport({
      name: name.trim(),
      target_table: targetTable,
      fields: fieldsToShow,
    });
    toast.success("Report saved");
  };

  const onExportCsv = () => {
    if (filtered.length === 0) { toast.error("No data to export"); return; }
    const header = fieldsToShow.join(",");
    const lines = filtered.map((r) => fieldsToShow.map((f) => {
      const v = r[f];
      const str = v === undefined || v === null ? "" : Array.isArray(v) ? v.join("|") : typeof v === "object" ? JSON.stringify(v) : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetTable}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} row${filtered.length === 1 ? "" : "s"}`);
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📊 Smart Reports</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Custom reports across every table in the system. Pick a target table, choose fields, filter, export to CSV. Save common reports for re-use.
          </p>
        </header>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target table</p>
            <div className="flex flex-wrap gap-1.5">
              {PHOENIX_SMART_REPORT_TARGETS.map((t) => (
                <button key={t.table} type="button" onClick={() => { setTargetTable(t.table); setSelectedFields([]); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: targetTable === t.table ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                    color: targetTable === t.table ? "white" : "#374151",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {target && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fields to include ({fieldsToShow.length} of {target.fields.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {target.fields.map((f) => {
                  const active = selectedFields.includes(f);
                  return (
                    <button key={f} type="button" onClick={() => toggleField(f)}
                      className="text-xs font-bold px-2.5 py-1 rounded-full font-mono"
                      style={{
                        background: active ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.05)",
                        color: active ? "#15803d" : "#6b7280",
                      }}>
                      {active ? "✓ " : "○ "}{f}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap items-end">
            <input className="input max-w-sm" placeholder="Filter rows (matches any field)" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <p className="text-sm font-bold text-emerald-700 ml-auto self-center">{filtered.length} row{filtered.length === 1 ? "" : "s"}</p>
            <button type="button" className="text-xs px-3 py-2 rounded-full font-bold bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={onSave}>💾 Save report</button>
            <button type="button" className="btn-gold" onClick={onExportCsv}>⬇️ Export CSV</button>
          </div>
        </section>

        <section className="glass rounded-2xl p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
              <tr>
                {fieldsToShow.map((f) => <th key={f} className="text-left py-2 px-3 font-mono">{f}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={fieldsToShow.length} className="text-center py-8 text-gray-400">No data.</td></tr>}
              {filtered.slice(0, 200).map((r, idx) => (
                <tr key={String(r.id ?? idx)} className="border-b border-gray-50">
                  {fieldsToShow.map((f) => {
                    const v = r[f];
                    const display = v === undefined || v === null ? "—"
                      : Array.isArray(v) ? v.join(", ")
                      : typeof v === "object" ? JSON.stringify(v).slice(0, 60)
                      : String(v);
                    return <td key={f} className="py-2 px-3 text-xs text-gray-700 max-w-xs truncate">{display}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <p className="text-xs text-gray-400 text-center py-2">Showing first 200 rows · export CSV for full set</p>
          )}
        </section>

        {savedReports.length > 0 && (
          <section className="glass rounded-2xl p-5">
            <h3 className="font-black text-gray-900 mb-3">💾 Saved reports</h3>
            <ul className="divide-y">
              {savedReports.map((r) => (
                <li key={r.id} className="py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.target_table} · {r.fields.length} field{r.fields.length === 1 ? "" : "s"}</p>
                  </div>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => {
                    setTargetTable(r.target_table);
                    setSelectedFields(r.fields);
                  }}>Load</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if (confirm(`Delete ${r.name}?`)) deleteReport(r.id);
                  }}>×</button>
                </li>
              ))}
            </ul>
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
