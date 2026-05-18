"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { PHOENIX_SMART_REPORT_TARGETS } from "@/lib/mockData";
import toast from "react-hot-toast";

export default function DataUploadsPage() {
  const uploads = useAppStore((s) => s.dataUploads);
  const record = useAppStore((s) => s.recordDataUpload);

  const [targetTable, setTargetTable] = useState("students");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  const target = PHOENIX_SMART_REPORT_TARGETS.find((t) => t.table === targetTable);

  const onPickFile = (f: File | null) => {
    setFile(f);
    setPreview(null);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) return;
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
      const rows = lines.slice(1, 11).map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
      setPreview({ headers, rows });
    };
    reader.readAsText(f);
  };

  const onProcess = () => {
    if (!file || !preview) { toast.error("Pick a CSV file first"); return; }
    const total = preview.rows.length;  // we only previewed first 10; in real impl we'd count full file
    const headersMatched = target?.fields.filter((f) => preview.headers.includes(f)).length ?? 0;
    const errors: string[] = [];
    if (headersMatched === 0) errors.push("No CSV column matches the target table's expected fields — check your CSV headers");
    record({
      filename: file.name,
      target_table: targetTable,
      row_count: total,
      ok_count: errors.length === 0 ? total : 0,
      error_count: errors.length > 0 ? total : 0,
      errors: errors.length > 0 ? errors : undefined,
      status: errors.length > 0 ? "failed" : "processed",
    });
    toast.success(`📤 Recorded upload of ${file.name} (${total} preview rows). Persisting to target table requires the server proxy — wired in a future phase.`, { duration: 6000 });
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📤 Data Uploads</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Bulk-load students, employees, fees, etc. from CSV. Validation happens in the browser before persisting to the target table.
          </p>
        </header>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target table</p>
            <div className="flex flex-wrap gap-1.5">
              {PHOENIX_SMART_REPORT_TARGETS.map((t) => (
                <button key={t.table} type="button" onClick={() => setTargetTable(t.table)}
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
            <div className="rounded-xl border bg-indigo-50/30 p-3">
              <p className="text-xs font-bold text-indigo-900 mb-1">Expected CSV columns for {target.label}:</p>
              <div className="flex flex-wrap gap-1">
                {target.fields.map((f) => <span key={f} className="text-xs font-mono px-2 py-0.5 rounded bg-white text-indigo-700">{f}</span>)}
              </div>
            </div>
          )}

          <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-6 text-center">
            <p className="text-3xl mb-2">📄</p>
            <input type="file" accept=".csv" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              className="block mx-auto text-sm" />
            {file && <p className="text-xs text-gray-600 mt-2">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
          </div>

          {preview && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preview (first 10 rows)</p>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((h, i) => {
                        const expected = target?.fields.includes(h);
                        return (
                          <th key={i} className="text-left py-2 px-3 font-mono whitespace-nowrap"
                            style={{ color: expected ? "#16a34a" : "#a16207" }}>
                            {expected ? "✓ " : "⚠️ "}{h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {row.map((cell, j) => <td key={j} className="py-1.5 px-3 text-gray-700 whitespace-nowrap">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="btn-gold mt-3" onClick={onProcess}>📤 Process upload</button>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Note: persisting to the target table requires the server-side proxy that&apos;ll be wired in a follow-up phase (same one that handles Hubtel + Paystack key safety). For now this records the upload metadata in the audit log.
              </p>
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-3">📜 Upload history</h3>
          {uploads.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">
              <span className="block text-3xl mb-1">📭</span>
              No uploads yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">When</th>
                  <th className="text-left py-2">File</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-right py-2">Rows</th>
                  <th className="text-right py-2">OK</th>
                  <th className="text-right py-2">Errors</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50">
                    <td className="py-2 text-xs text-gray-500 font-mono">{new Date(u.created_at).toLocaleString()}</td>
                    <td className="py-2 font-bold text-gray-800">{u.filename}</td>
                    <td className="py-2 text-xs text-gray-600">{u.target_table}</td>
                    <td className="py-2 text-right text-gray-600">{u.row_count}</td>
                    <td className="py-2 text-right text-emerald-700">{u.ok_count}</td>
                    <td className="py-2 text-right text-red-600">{u.error_count}</td>
                    <td className="py-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                        background: u.status === "processed" ? "rgba(34,197,94,0.1)" : u.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                        color: u.status === "processed" ? "#16a34a" : u.status === "failed" ? "#b91c1c" : "#a16207",
                      }}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
