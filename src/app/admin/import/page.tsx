"use client";
import { useState, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import type { StudentLevel, FeeStatus } from "@/lib/types";

const NAV = [
  { icon: "📊", label: "Overview",      href: "/admin" },
  { icon: "🎒", label: "Students",      href: "/admin/students" },
  { icon: "💳", label: "Fee Management",href: "/admin/fees" },
  { icon: "👩‍🏫", label: "Staff",        href: "/admin/staff" },
  { icon: "💼", label: "Payroll",        href: "/admin/payroll" },
  { icon: "📡", label: "Attendance",     href: "/admin/attendance" },
  { icon: "🏦", label: "Canteen Wallet", href: "/admin/canteen" },
  { icon: "📢", label: "Announcements",  href: "/admin/announcements" },
  { icon: "📸", label: "School Feed",    href: "/admin/feed" },
  { icon: "🔑", label: "Accounts",       href: "/admin/accounts" },
  { icon: "❓", label: "Question Bank",  href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

// ── Column alias maps ─────────────────────────────────────────────────────────
const S_ALIASES: Record<string, string[]> = {
  full_name:    ["student name", "full name", "name", "student_name", "fullname", "pupil name"],
  student_id:   ["student id", "admission number", "admission no", "id", "student_id", "reg no", "registration number", "index number"],
  class_name:   ["class", "class name", "class_name", "classroom", "form"],
  level:        ["level", "stage", "school level", "class level", "section"],
  dob:          ["date of birth", "dob", "birth date", "birthdate", "d.o.b"],
  gender:       ["gender", "sex"],
  parent_name:  ["parent name", "guardian name", "parent_name", "father name", "mother name", "parent/guardian", "guardian"],
  parent_phone: ["parent phone", "contact", "phone", "phone number", "parent contact", "parent_phone", "mobile"],
};
const F_ALIASES: Record<string, string[]> = {
  student_name: ["student name", "name", "full name", "student_name", "pupil"],
  student_id:   ["student id", "admission number", "id", "index number", "reg no"],
  fee_type:     ["fee type", "fee_type", "type", "description", "charge", "item"],
  amount:       ["amount", "total amount", "fee amount", "total", "charge amount"],
  paid_amount:  ["paid amount", "paid", "amount paid", "paid_amount"],
  term:         ["term", "semester", "period"],
  academic_year:["academic year", "year", "session", "academic_year"],
  due_date:     ["due date", "due", "deadline", "due_date"],
};
const G_ALIASES: Record<string, string[]> = {
  student_name: ["student name", "name", "full name", "pupil"],
  student_id:   ["student id", "admission number", "id", "index number", "reg no"],
  subject:      ["subject", "course", "subject name"],
  raw_score:    ["score", "raw score", "mark", "marks", "raw_score", "total score", "result"],
  term:         ["term", "semester", "period"],
  academic_year:["academic year", "year", "session", "academic_year"],
  class_name:   ["class", "class name", "classroom", "form"],
};

type ImportEntity = "students" | "fees" | "grades";

type RowObj = Record<string, string>;

function autoMap(headers: string[], aliases: Record<string, string[]>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [field, aliasList] of Object.entries(aliases)) {
    const match = headers.find((h) => aliasList.includes(h.toLowerCase().trim()));
    if (match) map[field] = match;
  }
  return map;
}

function parseCsv(text: string): { headers: string[]; rows: RowObj[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = splitLine(line);
    const obj: RowObj = {};
    headers.forEach((h, i) => { obj[h] = cols[i]?.trim() ?? ""; });
    return obj;
  }).filter((r) => Object.values(r).some((v) => v));
  return { headers, rows };
}

function splitLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function normaliseLevel(raw: string): StudentLevel {
  const r = raw.toLowerCase().replace(/\s+/g, "");
  if (r.includes("creche") || r.includes("crèche")) return "creche";
  if (r.includes("nursery") || r.includes("nurs")) return "nursery";
  if (r.includes("kg") || r.includes("kinder")) return "kg";
  if (r.includes("jhs") || r.includes("junior")) return "jhs";
  return "primary";
}

function normaliseTerm(raw: string): 1 | 2 | 3 {
  const n = parseInt(raw);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

// ── Adesua step guide data ────────────────────────────────────────────────────
const ADESUA_STEPS: Record<ImportEntity, { step: string; detail: string }[]> = {
  students: [
    { step: "Log in to Adesua", detail: "Go to your school's Adesua URL and log in as admin." },
    { step: "Open Students module", detail: 'Click "Students" or "Pupil/Student Records" in the left sidebar.' },
    { step: "Select all students", detail: 'Use the "All Students" or "Student List" view. Set class filter to "All Classes".' },
    { step: "Export to CSV/Excel", detail: 'Look for an "Export", "Download" or printer icon near the top of the table. Choose CSV or Excel (.xlsx).' },
    { step: "Open in Excel / Google Sheets", detail: "Open the downloaded file. Check that columns like Name, Class, DOB, Parent Contact are present." },
    { step: "Save as CSV", detail: 'In Excel: File → Save As → choose "CSV (Comma delimited)" (.csv). In Google Sheets: File → Download → CSV.' },
    { step: "Upload here", detail: "Come back to this page, switch to the Students tab, upload the CSV file, and review the preview before importing." },
  ],
  fees: [
    { step: "Log in to Adesua", detail: "Go to your school's Adesua URL and log in as admin." },
    { step: "Open Fees module", detail: 'Click "Fees", "Finance" or "School Fees" in the sidebar.' },
    { step: "Go to Fee Records / Ledger", detail: 'Select "Fee Ledger", "Student Fees" or "Outstanding Fees" — any view that shows one row per student per fee type.' },
    { step: "Filter by term & year", detail: 'Set the term and academic year filters so you export one batch at a time (e.g. Term 1 – 2024/2025).' },
    { step: "Export to CSV", detail: 'Click the Export / Download button and save as CSV.' },
    { step: "Repeat for each term", detail: 'Run steps 4–5 for each term you want to carry over. Keep files labelled e.g. "fees_term1_2024.csv".' },
    { step: "Upload here", detail: 'Upload each CSV file in the Fees tab below. The app will skip duplicate entries automatically.' },
  ],
  grades: [
    { step: "Log in to Adesua", detail: "Go to your school's Adesua URL and log in as admin." },
    { step: "Open Academics / Results", detail: 'Click "Academics", "Results" or "Report Cards" in the sidebar.' },
    { step: "Select class and term", detail: 'Choose a class and the term/year you want to export.' },
    { step: "Export terminal results", detail: 'Look for an "Export Scores" or "Download Results" option. Export as CSV.' },
    { step: "Repeat per class per term", detail: "If Adesua doesn't let you export all at once, repeat for each class." },
    { step: "Upload here", detail: 'Upload each results CSV in the Grades tab below.' },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataImportPage() {
  const addStudent    = useAppStore((s) => s.addStudent);
  const addFee        = useAppStore((s) => s.addFee);
  const saveGrade     = useAppStore((s) => s.saveGrade);
  const students      = useAppStore((s) => s.students);
  const fees          = useAppStore((s) => s.fees);

  const [entity, setEntity]         = useState<ImportEntity>("students");
  const [guideOpen, setGuideOpen]   = useState(true);
  const [headers, setHeaders]       = useState<string[]>([]);
  const [rows, setRows]             = useState<RowObj[]>([]);
  const [mapping, setMapping]       = useState<Record<string, string>>({});
  const [fileName, setFileName]     = useState("");
  const [imported, setImported]     = useState<number | null>(null);
  const [skipped, setSkipped]       = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const aliases = entity === "students" ? S_ALIASES : entity === "fees" ? F_ALIASES : G_ALIASES;
  const requiredFields = entity === "students"
    ? ["full_name", "class_name"]
    : entity === "fees"
    ? ["student_name", "fee_type", "amount"]
    : ["student_name", "subject", "raw_score"];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImported(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers: h, rows: r } = parseCsv(ev.target?.result as string);
      setHeaders(h);
      setRows(r);
      setMapping(autoMap(h, aliases));
    };
    reader.readAsText(file);
  }

  function get(row: RowObj, field: string): string {
    const col = mapping[field];
    return col ? (row[col] ?? "").trim() : "";
  }

  function handleImport() {
    if (rows.length === 0) { toast.error("No rows to import"); return; }
    let done = 0; let skip = 0;

    if (entity === "students") {
      for (const row of rows) {
        const full_name = get(row, "full_name");
        const class_name = get(row, "class_name");
        if (!full_name || !class_name) { skip++; continue; }
        const existing = students.find((s) =>
          s.full_name.toLowerCase() === full_name.toLowerCase() && s.class_name === class_name
        );
        if (existing) { skip++; continue; }
        addStudent({
          full_name,
          student_id: get(row, "student_id") || `STU${Date.now()}-${done}`,
          class_name,
          level: normaliseLevel(get(row, "level") || class_name),
          dob: get(row, "dob") || undefined,
          gender: (get(row, "gender").toLowerCase().startsWith("f") ? "female" : get(row, "gender") ? "male" : undefined),
          parent_name: get(row, "parent_name") || undefined,
          parent_phone: get(row, "parent_phone") || undefined,
          fee_status: "outstanding",
        });
        done++;
      }
    }

    if (entity === "fees") {
      const year = new Date().getFullYear();
      const academicYear = `${year}/${year + 1}`;
      for (const row of rows) {
        const studentName = get(row, "student_name");
        const feeType = get(row, "fee_type");
        const amtRaw = get(row, "amount");
        if (!studentName || !feeType || !amtRaw) { skip++; continue; }
        const amount = parseFloat(amtRaw.replace(/[^0-9.]/g, "")) || 0;
        if (amount <= 0) { skip++; continue; }
        const term = normaliseTerm(get(row, "term") || "1");
        const ay = get(row, "academic_year") || academicYear;
        const student = students.find((s) => s.full_name.toLowerCase().includes(studentName.toLowerCase()));
        const studentId = student?.id ?? `unknown-${studentName.replace(/\s/g, "-")}`;
        // Skip exact duplicate
        const dup = fees.some((f) =>
          f.student_id === studentId && f.fee_type === feeType && f.term === term && f.academic_year === ay
        );
        if (dup) { skip++; continue; }
        const paidRaw = get(row, "paid_amount");
        const paidAmount = paidRaw ? parseFloat(paidRaw.replace(/[^0-9.]/g, "")) : 0;
        const status: FeeStatus = paidAmount >= amount ? "cleared" : paidAmount > 0 ? "partial" : "outstanding";
        addFee({
          student_id: studentId,
          student_name: student?.full_name ?? studentName,
          class_name: student?.class_name,
          fee_type: feeType,
          amount,
          term,
          academic_year: ay,
          due_date: get(row, "due_date") || undefined,
        });
        done++;
      }
    }

    if (entity === "grades") {
      const year = new Date().getFullYear();
      const academicYear = `${year}/${year + 1}`;
      for (const row of rows) {
        const studentName = get(row, "student_name");
        const subject = get(row, "subject");
        const scoreRaw = get(row, "raw_score");
        if (!studentName || !subject || !scoreRaw) { skip++; continue; }
        const raw_score = parseFloat(scoreRaw) || 0;
        const term = normaliseTerm(get(row, "term") || "1");
        const ay = get(row, "academic_year") || academicYear;
        const student = students.find((s) => s.full_name.toLowerCase().includes(studentName.toLowerCase()));
        if (!student) { skip++; continue; }
        saveGrade({
          student_id: student.id,
          student_name: student.full_name,
          subject,
          class_name: student.class_name,
          term,
          academic_year: ay,
          raw_score,
          position: undefined,
        });
        done++;
      }
    }

    setImported(done);
    setSkipped(skip);
    toast.success(`Imported ${done} record${done !== 1 ? "s" : ""}${skip > 0 ? ` · ${skip} skipped` : ""}`);
  }

  function reset() {
    setHeaders([]); setRows([]); setMapping({}); setFileName(""); setImported(null); setSkipped(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate(e: ImportEntity) {
    const templates: Record<ImportEntity, string> = {
      students: [
        "Student Name,Admission Number,Class,Level,Date of Birth,Gender,Parent Name,Parent Phone",
        "Akosua Mensah,STU001,JHS 1A,JHS,2010-04-15,Female,Kwame Mensah,0244123456",
        "Kofi Adu,STU002,Primary 5B,Primary,2012-08-22,Male,Ama Adu,0551987654",
      ].join("\n"),
      fees: [
        "Student Name,Student ID,Fee Type,Amount,Paid Amount,Term,Academic Year,Due Date",
        "Akosua Mensah,STU001,School Fees,450,450,1,2024/2025,2025-01-31",
        "Kofi Adu,STU002,Feeding Fees,300,150,1,2024/2025,2025-01-31",
      ].join("\n"),
      grades: [
        "Student Name,Student ID,Subject,Score,Term,Academic Year,Class",
        "Akosua Mensah,STU001,Mathematics,78,1,2024/2025,JHS 1A",
        "Kofi Adu,STU002,English Language,65,1,2024/2025,Primary 5B",
      ].join("\n"),
    };
    const blob = new Blob([templates[e]], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `phoenix_${e}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const missingRequired = requiredFields.filter((f) => !mapping[f]);
  const canImport = rows.length > 0 && missingRequired.length === 0;

  // Preview: map rows through current column mapping
  const preview = rows.slice(0, 8).map((row) => {
    const out: RowObj = {};
    for (const field of Object.keys(aliases)) out[field] = get(row, field);
    return out;
  });

  const entityLabels: Record<ImportEntity, { icon: string; label: string }> = {
    students: { icon: "🎒", label: "Students" },
    fees:     { icon: "💳", label: "Fees" },
    grades:   { icon: "📋", label: "Grades" },
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Data Import from Adesua</h1>
          <p className="text-sm text-gray-500 mt-1">
            Migrate your existing school data into Phoenix in three steps: export from Adesua → upload CSV → confirm import.
          </p>
        </div>

        {/* Entity tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["students", "fees", "grades"] as ImportEntity[]).map((e) => (
            <button key={e} onClick={() => { setEntity(e); reset(); setGuideOpen(true); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${entity === e ? "btn-gold" : "btn-outline"}`}>
              <span>{entityLabels[e].icon}</span> {entityLabels[e].label}
            </button>
          ))}
        </div>

        {/* ── Step guide ── */}
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setGuideOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-xl">📘</span>
              <div>
                <div className="font-black text-gray-900 text-sm">
                  How to export {entityLabels[entity].label.toLowerCase()} from Adesua
                </div>
                <div className="text-xs text-gray-400">Step-by-step guide</div>
              </div>
            </div>
            <span className="text-gray-400 font-bold text-lg">{guideOpen ? "▲" : "▼"}</span>
          </button>

          {guideOpen && (
            <div className="px-6 pb-6 border-t" style={{ borderColor: "rgba(0,48,135,0.08)" }}>
              <div className="mt-4 space-y-3">
                {ADESUA_STEPS[entity].map((s, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#003087,#1565C0)", color: "white" }}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{s.step}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips box */}
              <div className="mt-5 rounded-xl p-4 text-xs space-y-1.5"
                style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)" }}>
                <div className="font-black text-gray-700 mb-2">💡 Tips</div>
                {entity === "students" && <>
                  <p>• If Adesua uses a single "Name" column for parents, that&apos;s fine — map it to Parent Name.</p>
                  <p>• Level will be auto-detected from class name if not present (e.g. "JHS 1A" → JHS, "Primary 5B" → Primary).</p>
                  <p>• Students already in Phoenix (same name + class) will be skipped to avoid duplicates.</p>
                </>}
                {entity === "fees" && <>
                  <p>• Export one term at a time for cleaner data — use Adesua&apos;s term filter before exporting.</p>
                  <p>• If Adesua doesn&apos;t show a "Paid Amount" column, leave it blank — fees will import as Outstanding.</p>
                  <p>• Duplicate entries (same student + fee type + term + year) are skipped automatically.</p>
                </>}
                {entity === "grades" && <>
                  <p>• Scores should be out of 100. If Adesua uses a different scale, convert in Excel before uploading.</p>
                  <p>• Students not found by name will be skipped — import students first.</p>
                  <p>• Existing grades for the same student / subject / term will be overwritten with the new score.</p>
                </>}
              </div>
            </div>
          )}
        </div>

        {/* ── Upload section ── */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-gray-900">
              Upload {entityLabels[entity].label} CSV
            </h2>
            <button onClick={() => downloadTemplate(entity)} className="btn-outline text-xs">
              ⬇️ Download Template
            </button>
          </div>

          {/* File picker */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-all hover:border-blue-400"
              style={{ borderColor: rows.length ? "rgba(34,197,94,0.4)" : "rgba(0,48,135,0.2)" }}>
              {rows.length > 0 ? (
                <>
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-sm font-bold text-gray-700">{fileName}</p>
                  <p className="text-xs text-gray-400 mt-1">{rows.length} data rows · {headers.length} columns detected</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm font-bold text-gray-700">Click to choose a CSV file exported from Adesua</p>
                  <p className="text-xs text-gray-400 mt-1">No file selected — .csv files only</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>

          {/* Column mapper */}
          {headers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-800">Column Mapping</h3>
                {missingRequired.length > 0 && (
                  <span className="text-xs text-amber-600 font-bold">
                    ⚠️ Map required fields: {missingRequired.join(", ")}
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(aliases).map((field) => {
                  const isRequired = requiredFields.includes(field);
                  const isMapped   = !!mapping[field];
                  return (
                    <div key={field} className={`rounded-xl p-3 border ${isMapped ? "border-green-200 bg-green-50" : isRequired ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wide"
                          style={{ color: isMapped ? "#16a34a" : isRequired ? "#b45309" : "#6b7280" }}>
                          {field.replace(/_/g, " ")}
                        </span>
                        {isRequired && <span className="text-[10px] text-red-400 font-bold">*</span>}
                        {isMapped && <span className="text-[10px] text-green-500">✓</span>}
                      </div>
                      <select
                        value={mapping[field] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value || "" }))}
                        aria-label={`Map column for ${field}`}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border bg-white focus:outline-none"
                        style={{ borderColor: "rgba(0,48,135,0.15)" }}>
                        <option value="">{isRequired ? "— select column —" : "— not mapped —"}</option>
                        {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-2">
                Preview (first {preview.length} of {rows.length} rows)
              </h3>
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(0,48,135,0.1)" }}>
                <table className="w-full text-xs">
                  <thead style={{ background: "rgba(0,48,135,0.04)" }}>
                    <tr>
                      {Object.keys(aliases).map((f) => (
                        <th key={f} className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap border-b"
                          style={{ borderColor: "rgba(0,48,135,0.1)" }}>
                          {f.replace(/_/g, " ")}
                          {requiredFields.includes(f) && <span className="text-red-400 ml-0.5">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {Object.keys(aliases).map((f) => (
                          <td key={f} className={`px-3 py-2 max-w-[140px] truncate border-b ${!row[f] && requiredFields.includes(f) ? "bg-red-50 text-red-500 font-bold" : "text-gray-700"}`}
                            style={{ borderColor: "rgba(0,48,135,0.06)" }}>
                            {row[f] || (requiredFields.includes(f) ? "⚠ missing" : "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 8 && (
                <p className="text-xs text-gray-400 mt-1.5 text-right">+ {rows.length - 8} more rows not shown</p>
              )}
            </div>
          )}

          {/* Import result banner */}
          {imported !== null && (
            <div className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-black text-gray-800 text-sm">Import complete</div>
                <div className="text-xs text-gray-500">
                  {imported} record{imported !== 1 ? "s" : ""} imported
                  {skipped > 0 && ` · ${skipped} skipped (duplicates or missing required fields)`}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {rows.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: "rgba(0,48,135,0.08)" }}>
              <button
                onClick={handleImport}
                disabled={!canImport}
                className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed">
                {canImport
                  ? `✅ Import ${rows.length} ${entityLabels[entity].label}`
                  : `⚠️ Map required fields first`}
              </button>
              <button onClick={reset} className="btn-outline text-sm">Clear</button>
            </div>
          )}
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {([
            { label: "Students in Phoenix", value: useAppStore.getState().students.length, icon: "🎒", color: "#003087" },
            { label: "Fee Records",          value: useAppStore.getState().fees.length,    icon: "💳", color: "#22c55e" },
            { label: "Grade Records",        value: useAppStore.getState().grades.length,  icon: "📋", color: "#f59e0b" },
          ]).map((c) => (
            <div key={c.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-2xl font-black" style={{ color: c.color }}>{c.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
