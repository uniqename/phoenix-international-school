"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { getGESLabel, getGESColor } from "@/lib/utils";

// Phase 15e — multi-year transcript compile for JHS leavers (and anyone else
// who needs a cumulative academic record). Uses window.print() → Save as PDF,
// matching the existing report-card flow. No PDF library dependency.

interface YearGroup {
  year: string;
  terms: TermGroup[];
  yearAvg: number | null;
}

interface TermGroup {
  term: number;
  subjects: SubjectRow[];
  termAvg: number | null;
}

interface SubjectRow {
  subject: string;
  raw_score: number;
  ges_grade: number;
  position?: number;
  class_name?: string;
}

export default function TranscriptsPage() {
  const students = useAppStore((s) => s.students);
  const grades = useAppStore((s) => s.grades);
  const settings = useAppStore((s) => s.schoolSettings);

  const [studentId, setStudentId] = useState("");
  const student = students.find((s) => s.id === studentId);

  // Prioritise JHS 3 students at the top of the picker (they're the typical
  // leavers needing a transcript), then everyone else alphabetically.
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const aJhs3 = /JHS\s*3/i.test(a.class_name) ? 0 : 1;
      const bJhs3 = /JHS\s*3/i.test(b.class_name) ? 0 : 1;
      if (aJhs3 !== bJhs3) return aJhs3 - bJhs3;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [students]);

  const yearGroups = useMemo<YearGroup[]>(() => {
    if (!student) return [];
    const studentGrades = grades.filter((g) => g.student_id === student.id);
    const byYear = new Map<string, Map<number, SubjectRow[]>>();
    for (const g of studentGrades) {
      if (!byYear.has(g.academic_year)) byYear.set(g.academic_year, new Map());
      const yearMap = byYear.get(g.academic_year)!;
      if (!yearMap.has(g.term)) yearMap.set(g.term, []);
      yearMap.get(g.term)!.push({
        subject: g.subject,
        raw_score: g.raw_score,
        ges_grade: g.ges_grade,
        position: g.position,
        class_name: g.class_name,
      });
    }
    const years = [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return years.map(([year, termMap]) => {
      const terms = [...termMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([term, subjects]) => {
          subjects.sort((a, b) => a.subject.localeCompare(b.subject));
          const sum = subjects.reduce((acc, s) => acc + s.raw_score, 0);
          return {
            term,
            subjects,
            termAvg: subjects.length ? sum / subjects.length : null,
          };
        });
      const validAvgs = terms.map((t) => t.termAvg).filter((v): v is number => v !== null);
      const yearAvg = validAvgs.length ? validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length : null;
      return { year, terms, yearAvg };
    });
  }, [student, grades]);

  const overallAvg = useMemo(() => {
    const validYears = yearGroups.map((y) => y.yearAvg).filter((v): v is number => v !== null);
    return validYears.length ? validYears.reduce((a, b) => a + b, 0) / validYears.length : null;
  }, [yearGroups]);

  const isLeaver = student && /JHS\s*3/i.test(student.class_name);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="p-6 max-w-5xl mx-auto space-y-4 print:p-0">
        <header className="print:hidden">
          <h1 className="text-2xl font-black text-white">🎓 Transcripts</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Compile a multi-year academic transcript for a graduating student. JHS 3 leavers are listed first. Use the browser&apos;s &ldquo;Save as PDF&rdquo; in the print dialog.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-3 glass rounded-2xl p-4 print:hidden">
          <label className="block">
            <span className="block text-xs font-bold text-white/80 mb-1">Student</span>
            <select
              className="input"
              aria-label="Student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">— select a student —</option>
              {sortedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {/JHS\s*3/i.test(s.class_name) ? "🎓 " : ""}{s.full_name} ({s.class_name})
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end justify-end gap-2">
            {student && yearGroups.length > 0 && (
              <button type="button" className="btn-gold" onClick={() => window.print()}>
                🖨️ Print / Save PDF
              </button>
            )}
          </div>
        </section>

        {!student && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400 print:hidden">
            Pick a student to view their transcript.
          </div>
        )}

        {student && yearGroups.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400 print:hidden">
            No grade history yet for {student.full_name}. Teachers record grades in <span className="font-mono">/teacher/gradebook</span>.
          </div>
        )}

        {student && yearGroups.length > 0 && (
          <article className="rounded-xl bg-white p-8 text-gray-900 print:rounded-none print:shadow-none print:p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div className="text-center mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold" style={{ color: "#1A0E4D" }}>{settings.name}</h2>
              {settings.motto && <p className="text-sm italic text-gray-500">&ldquo;{settings.motto}&rdquo;</p>}
              <p className="text-xs text-gray-500 mt-1">
                {settings.location} · {settings.phones.join(" / ")} · {settings.email}
              </p>
              <h3 className="text-lg font-semibold mt-3">
                {isLeaver ? "Academic Transcript — JHS Leaver" : "Academic Transcript"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-6">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{student.full_name}</span></div>
              <div><span className="text-gray-500">Student ID:</span> <span className="font-medium">{student.student_id}</span></div>
              <div><span className="text-gray-500">Current class:</span> <span className="font-medium">{student.class_name}</span></div>
              <div><span className="text-gray-500">Date of birth:</span> <span className="font-medium">{student.dob ?? "—"}</span></div>
              <div><span className="text-gray-500">Nationality:</span> <span className="font-medium">{student.nationality ?? "—"}</span></div>
              <div><span className="text-gray-500">Issued:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
            </div>

            {yearGroups.map((yg) => (
              <div key={yg.year} className="mb-6 break-inside-avoid">
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="font-bold text-sm" style={{ color: "#1A0E4D" }}>Academic Year {yg.year}</h4>
                  {yg.yearAvg !== null && (
                    <span className="text-xs text-gray-600">
                      Year average: <span className="font-bold">{yg.yearAvg.toFixed(1)}%</span>
                    </span>
                  )}
                </div>
                {yg.terms.map((tg) => (
                  <div key={tg.term} className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Term {tg.term}{tg.termAvg !== null && ` — average ${tg.termAvg.toFixed(1)}%`}</p>
                    <table className="w-full text-sm border border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border px-3 py-1.5 text-left">Subject</th>
                          <th className="border px-3 py-1.5 text-center w-20">Score</th>
                          <th className="border px-3 py-1.5 text-center w-16">GES</th>
                          <th className="border px-3 py-1.5 text-left">Remark</th>
                          <th className="border px-3 py-1.5 text-center w-16">Pos.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tg.subjects.map((s, i) => (
                          <tr key={`${s.subject}-${i}`}>
                            <td className="border px-3 py-1.5">{s.subject}</td>
                            <td className="border px-3 py-1.5 text-center font-medium">{s.raw_score}</td>
                            <td className="border px-3 py-1.5 text-center font-bold" style={{ color: getGESColor(s.ges_grade) }}>{s.ges_grade}</td>
                            <td className="border px-3 py-1.5">{getGESLabel(s.ges_grade)}</td>
                            <td className="border px-3 py-1.5 text-center text-gray-500">{s.position ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}

            {overallAvg !== null && (
              <div className="rounded-lg p-3 mb-6"
                style={{ background: "rgba(26,14,77,0.06)", border: "1px solid rgba(26,14,77,0.15)" }}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm" style={{ color: "#1A0E4D" }}>Cumulative average across all years</p>
                  <p className="text-xl font-black" style={{ color: "#1A0E4D" }}>{overallAvg.toFixed(1)}%</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="border-b border-gray-300 pb-6">&nbsp;</p>
                <p className="text-center text-gray-500 mt-1">Headmaster / Principal</p>
              </div>
              <div>
                <p className="border-b border-gray-300 pb-6">&nbsp;</p>
                <p className="text-center text-gray-500 mt-1">Date & school seal</p>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-4 italic">
              This transcript reflects the student&apos;s grade history recorded in {settings.name}&apos;s academic system as of {new Date().toLocaleDateString()}. GES grade scale: 1 (Highest) — 9 (Lowest).
            </p>
          </article>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; background: white; color: #111827; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-gold { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-gold:hover { background: #2c1a73; }
        `}</style>
        <style jsx global>{`
          @media print {
            body { background: white !important; }
            nav, aside, header.print\\:hidden, .print\\:hidden { display: none !important; }
          }
        `}</style>
      </div>
    </DashboardShell>
  );
}
