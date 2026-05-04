"use client";
import { useState, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import type { QuizQuestion } from "@/lib/types";

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
  { icon: "❓", label: "Question Bank", href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

const SUBJECTS = ["Mathematics", "English Language", "Integrated Science", "Social Studies", "French", "RME", "ICT", "Ghanaian Language", "Other"];

const BLANK_FORM = {
  subject: "Mathematics",
  year: "",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "0" as "0" | "1" | "2" | "3",
  explanation: "",
  source: "BECE Sample",
};

type CsvRow = { subject: string; year: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string; answer: string; explanation: string; source: string };

export default function QuestionsPage() {
  const { user } = useAuth();
  const quizQuestions = useAppStore((s) => s.quizQuestions);
  const addQuestion   = useAppStore((s) => s.addQuestion);
  const addQuestions  = useAppStore((s) => s.addQuestions);
  const deleteQuestion = useAppStore((s) => s.deleteQuestion);

  const [tab, setTab]               = useState<"browse" | "add" | "upload">("browse");
  const [filterSubj, setFilterSubj] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [search, setSearch]         = useState("");
  const [form, setForm]             = useState({ ...BLANK_FORM });
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [csvFile, setCsvFile]       = useState<string>("");
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter questions
  const filtered = quizQuestions.filter((q) => {
    if (filterSubj !== "All" && q.subject !== filterSubj) return false;
    if (filterYear !== "All" && String(q.year ?? "") !== filterYear) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const years = [...new Set(quizQuestions.map((q) => q.year).filter(Boolean))].sort((a, b) => (b ?? 0) - (a ?? 0));

  // Manual add
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.optionA.trim() || !form.optionB.trim() || !form.optionC.trim() || !form.optionD.trim()) {
      toast.error("Fill in the question and all four options");
      return;
    }
    addQuestion({
      subject: form.subject,
      year: form.year ? parseInt(form.year) : undefined,
      question: form.question.trim(),
      options: [form.optionA.trim(), form.optionB.trim(), form.optionC.trim(), form.optionD.trim()],
      answer: parseInt(form.answer) as 0 | 1 | 2 | 3,
      explanation: form.explanation.trim() || undefined,
      source: form.source.trim() || undefined,
      created_by: user?.full_name,
    });
    toast.success("Question added");
    setForm({ ...BLANK_FORM });
  }

  // CSV upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      setCsvPreview(rows);
    };
    reader.readAsText(file);
  }

  function parseCsv(text: string): CsvRow[] {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    // Auto-detect header row
    const header = lines[0].toLowerCase();
    const isHeaderRow = header.includes("subject") || header.includes("question") || header.includes("option");
    const dataLines = isHeaderRow ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      // Handle quoted CSV fields
      const cols = splitCsvLine(line);
      return {
        subject:    cols[0]?.trim() ?? "Mathematics",
        year:       cols[1]?.trim() ?? "",
        question:   cols[2]?.trim() ?? "",
        optionA:    cols[3]?.trim() ?? "",
        optionB:    cols[4]?.trim() ?? "",
        optionC:    cols[5]?.trim() ?? "",
        optionD:    cols[6]?.trim() ?? "",
        answer:     cols[7]?.trim() ?? "A",
        explanation: cols[8]?.trim() ?? "",
        source:     cols[9]?.trim() ?? "BECE Sample",
      };
    }).filter((r) => r.question);
  }

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  function letterToIndex(letter: string): 0 | 1 | 2 | 3 {
    const map: Record<string, 0 | 1 | 2 | 3> = { A: 0, B: 1, C: 2, D: 3, "0": 0, "1": 1, "2": 2, "3": 3 };
    return map[letter.trim().toUpperCase()] ?? 0;
  }

  function handleImport() {
    if (csvPreview.length === 0) { toast.error("No valid rows to import"); return; }
    const toAdd = csvPreview.map((r) => ({
      subject: r.subject || "Mathematics",
      year: r.year ? parseInt(r.year) : undefined,
      question: r.question,
      options: [r.optionA, r.optionB, r.optionC, r.optionD] as [string, string, string, string],
      answer: letterToIndex(r.answer),
      explanation: r.explanation || undefined,
      source: r.source || undefined,
      created_by: user?.full_name,
    }));
    addQuestions(toAdd);
    toast.success(`Imported ${toAdd.length} question${toAdd.length !== 1 ? "s" : ""}`);
    setCsvPreview([]);
    setCsvFile("");
    if (fileRef.current) fileRef.current.value = "";
    setTab("browse");
  }

  function downloadTemplate() {
    const header = "Subject,Year,Question,Option A,Option B,Option C,Option D,Answer (A/B/C/D),Explanation,Source";
    const example = 'Mathematics,2023,"Simplify: 3/4 + 2/3","5/7","17/12","1 5/12","11/12",C,"LCM of 4 and 3 is 12. 9/12 + 8/12 = 17/12 = 1 5/12",BECE Sample';
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "phoenix_questions_template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Question Bank</h1>
            <p className="text-sm text-gray-500">{quizQuestions.length} total questions · PASTCO / BECE practice</p>
          </div>
          <div className="flex gap-2">
            {(["browse", "add", "upload"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${tab === t ? "btn-gold" : "btn-outline"}`}>
                {t === "browse" ? "📋 Browse" : t === "add" ? "✏️ Add Question" : "📤 CSV Upload"}
              </button>
            ))}
          </div>
        </div>

        {/* ── BROWSE TAB ── */}
        {tab === "browse" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="glass rounded-2xl p-4 flex flex-wrap gap-3">
              <input
                type="text" placeholder="Search questions…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}
              />
              <select value={filterSubj} onChange={(e) => setFilterSubj(e.target.value)}
                aria-label="Filter by subject"
                className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}>
                <option value="All">All Subjects</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
                aria-label="Filter by year"
                className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}>
                <option value="All">All Years</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
              <span className="self-center text-sm text-gray-500 font-semibold">{filtered.length} shown</span>
            </div>

            {/* Subject summary chips */}
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => {
                const count = quizQuestions.filter((q) => q.subject === s).length;
                if (count === 0) return null;
                return (
                  <button key={s} onClick={() => setFilterSubj(s === filterSubj ? "All" : s)}
                    className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                    style={{
                      background: filterSubj === s ? "rgba(0,48,135,0.12)" : "rgba(0,48,135,0.05)",
                      color: "#003087",
                      border: filterSubj === s ? "1.5px solid #003087" : "1.5px solid rgba(0,48,135,0.15)",
                    }}>
                    {s} · {count}
                  </button>
                );
              })}
            </div>

            {/* Questions list */}
            {filtered.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold">No questions match your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((q, i) => (
                  <div key={q.id} className="glass rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(0,48,135,0.1)", color: "#003087" }}>{q.subject}</span>
                          {q.year && <span className="text-xs text-gray-400">{q.year}</span>}
                          {q.source && <span className="text-xs text-gray-400">· {q.source}</span>}
                          <span className="text-xs text-gray-300">#{i + 1}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-2">{q.question}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-2 py-1 rounded-lg ${oi === q.answer ? "bg-green-50 text-green-700 font-bold border border-green-200" : "bg-gray-50 text-gray-600"}`}>
                              <span className="font-black">{["A", "B", "C", "D"][oi]}.</span> {opt}
                              {oi === q.answer && <span className="ml-1">✓</span>}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-gray-500 mt-2 italic">💡 {q.explanation}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setDelConfirm(q.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all shrink-0">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD QUESTION TAB ── */}
        {tab === "add" && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-black text-gray-900 mb-4">Add a Question Manually</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">BECE Year (optional)</label>
                  <input type="number" placeholder="e.g. 2023" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Source</label>
                  <input type="text" placeholder="e.g. BECE 2023 Paper 1" value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Question *</label>
                <textarea rows={3} placeholder="Type the question here…" value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600">Options — select the correct answer</label>
                {(["A", "B", "C", "D"] as const).map((letter, idx) => {
                  const key = `option${letter}` as "optionA" | "optionB" | "optionC" | "optionD";
                  const isCorrect = String(idx) === form.answer;
                  return (
                    <div key={letter} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isCorrect ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}>
                      <button type="button"
                        onClick={() => setForm({ ...form, answer: String(idx) as "0" | "1" | "2" | "3" })}
                        className={`w-8 h-8 rounded-full text-xs font-black shrink-0 transition-all ${isCorrect ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {letter}
                      </button>
                      <input type="text" placeholder={`Option ${letter}…`} value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                      {isCorrect && <span className="text-xs text-green-600 font-bold shrink-0">✓ Correct</span>}
                    </div>
                  );
                })}
                <p className="text-xs text-gray-400">Click a letter button to mark it as the correct answer</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Explanation (optional — shown after student answers)</label>
                <textarea rows={2} placeholder="Explain why the answer is correct…" value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: "rgba(0,48,135,0.15)" } as React.CSSProperties}
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-gold">Add Question</button>
                <button type="button" onClick={() => setForm({ ...BLANK_FORM })} className="btn-outline">Clear</button>
              </div>
            </form>
          </div>
        )}

        {/* ── CSV UPLOAD TAB ── */}
        {tab === "upload" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-black text-gray-900">Upload CSV File</h2>
                  <p className="text-sm text-gray-500 mt-1">Import multiple questions at once from a spreadsheet</p>
                </div>
                <button onClick={downloadTemplate} className="btn-outline text-xs">⬇️ Download Template</button>
              </div>

              {/* CSV format guide */}
              <div className="rounded-xl p-4 mb-5 text-xs font-mono text-gray-700 overflow-x-auto"
                style={{ background: "rgba(0,48,135,0.04)", border: "1px solid rgba(0,48,135,0.1)" }}>
                <div className="font-bold text-gray-500 mb-1 not-italic font-sans">Expected CSV columns (row 1 = header, skip it):</div>
                Subject, Year, Question, Option A, Option B, Option C, Option D, Answer (A/B/C/D), Explanation, Source
              </div>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed rounded-2xl p-8 text-center transition-all hover:border-blue-400"
                  style={{ borderColor: "rgba(0,48,135,0.2)" }}>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm font-bold text-gray-700">Click to choose a CSV file</p>
                  <p className="text-xs text-gray-400 mt-1">{csvFile || "No file selected"}</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Preview */}
            {csvPreview.length > 0 && (
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900">Preview — {csvPreview.length} question{csvPreview.length !== 1 ? "s" : ""} detected</h3>
                  <button onClick={handleImport} className="btn-gold">Import All →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "rgba(0,48,135,0.1)" }}>
                        {["#", "Subject", "Year", "Question", "A", "B", "C", "D", "Answer", "Explanation"].map((h) => (
                          <th key={h} className="text-left py-2 pr-3 font-bold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((r, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                          <td className="py-2 pr-3 font-semibold text-gray-800 whitespace-nowrap">{r.subject}</td>
                          <td className="py-2 pr-3 text-gray-500">{r.year}</td>
                          <td className="py-2 pr-3 text-gray-800 max-w-[200px] truncate">{r.question}</td>
                          <td className="py-2 pr-3 text-gray-600 max-w-[80px] truncate">{r.optionA}</td>
                          <td className="py-2 pr-3 text-gray-600 max-w-[80px] truncate">{r.optionB}</td>
                          <td className="py-2 pr-3 text-gray-600 max-w-[80px] truncate">{r.optionC}</td>
                          <td className="py-2 pr-3 text-gray-600 max-w-[80px] truncate">{r.optionD}</td>
                          <td className="py-2 pr-3">
                            <span className="font-black px-2 py-0.5 rounded-full text-white"
                              style={{ background: "#22c55e" }}>{r.answer.toUpperCase()}</span>
                          </td>
                          <td className="py-2 pr-3 text-gray-500 max-w-[150px] truncate">{r.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(0,48,135,0.1)" }}>
                  <button onClick={handleImport} className="btn-gold">✅ Import {csvPreview.length} Questions</button>
                  <button onClick={() => { setCsvPreview([]); setCsvFile(""); if (fileRef.current) fileRef.current.value = ""; }}
                    className="btn-outline">Clear</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-black text-gray-900 mb-2">Delete Question?</h3>
            <p className="text-sm text-gray-600 mb-5">This cannot be undone. Students will no longer see this question.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteQuestion(delConfirm); setDelConfirm(null); toast.success("Question deleted"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#ef4444" }}>
                Delete
              </button>
              <button onClick={() => setDelConfirm(null)} className="flex-1 btn-outline text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
