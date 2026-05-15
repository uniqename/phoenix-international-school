"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type { AssessmentGrade, AssessmentResult, AssessmentTemplate, Student } from "@/lib/types";
import toast from "react-hot-toast";

const GRADE_COLORS: Record<AssessmentGrade, string> = {
  A: "#15803d", B: "#1d4ed8", C: "#a16207", D: "#b91c1c",
};

export default function AdminReportsPage() {
  const { user } = useAuth();
  const classes = useAppStore((s) => s.classes);
  const students = useAppStore((s) => s.students);
  const templates = useAppStore((s) => s.assessmentTemplates);
  const results = useAppStore((s) => s.assessmentResults);
  const setHeadmasterRemark = useAppStore((s) => s.setHeadmasterRemark);
  const finalize = useAppStore((s) => s.finalizeResult);
  const settings = useAppStore((s) => s.schoolSettings);

  const [term, setTerm] = useState<1 | 2 | 3>(settings.current_term);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [studentId, setStudentId] = useState("");

  const selectedClass = classes.find((c) => c.id === classId);
  const classStudents = useMemo(
    () => students.filter((s) => s.class_name === selectedClass?.name),
    [students, selectedClass],
  );
  const student = students.find((s) => s.id === studentId);

  const studentResults = useMemo(
    () => results.filter(
      (r) => r.student_id === studentId
        && r.term === term
        && r.academic_year === settings.current_academic_year,
    ),
    [results, studentId, term, settings.current_academic_year],
  );

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="p-6 max-w-5xl mx-auto space-y-4 print:p-0">
        <header className="print:hidden">
          <h1 className="text-2xl font-bold">Reports &amp; Remarks</h1>
          <p className="text-sm text-gray-500">
            Review teacher-finalized assessments, add the headmaster&apos;s remark, then print the report card.
          </p>
        </header>

        {/* Pickers — hidden on print */}
        <section className="grid md:grid-cols-3 gap-3 rounded-xl border bg-white p-4 print:hidden">
          <Field label="Class">
            <select className="input" value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Student">
            <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">— select —</option>
              {classStudents.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </Field>
          <Field label="Term">
            <select className="input" value={term} onChange={(e) => setTerm(Number(e.target.value) as 1 | 2 | 3)}>
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </Field>
        </section>

        {!student && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400 print:hidden">
            Pick a student to view their report.
          </div>
        )}

        {student && studentResults.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400 print:hidden">
            No assessment results yet for {student.full_name} in Term {term}. Teachers grade in /teacher/assessments.
          </div>
        )}

        {student && studentResults.length > 0 && (
          <>
            <div className="flex justify-end gap-2 print:hidden">
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.print()}
              >
                🖨️ Print report
              </button>
            </div>

            {/* Printable report card */}
            <article className="rounded-xl bg-white p-8 print:rounded-none print:shadow-none print:p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold" style={{ color: "#1A0E4D" }}>{settings.name}</h2>
                {settings.motto && <p className="text-sm italic text-gray-500">&ldquo;{settings.motto}&rdquo;</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {settings.location} · {settings.phones.join(" / ")} · {settings.email}
                </p>
                <h3 className="text-lg font-semibold mt-3">Student Report — Term {term}, {settings.current_academic_year}</h3>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium">{student.full_name}</span></div>
                <div><span className="text-gray-500">Student ID:</span> <span className="font-medium">{student.student_id}</span></div>
                <div><span className="text-gray-500">Class:</span> <span className="font-medium">{student.class_name}</span></div>
                <div><span className="text-gray-500">Category:</span> <span className="font-medium capitalize">{student.category ?? "—"}</span></div>
              </div>

              {/* Results per template */}
              {studentResults.map((r) => {
                const tmpl = templates.find((t) => t.id === r.template_id);
                if (!tmpl) return null;
                return (
                  <ResultSection
                    key={r.id}
                    template={tmpl}
                    result={r}
                    onHeadmasterRemark={(text) => {
                      setHeadmasterRemark(r.id, text, user?.full_name);
                      toast.success("Headmaster's remark saved");
                    }}
                    onLockUnlock={() => finalize(r.id, !r.finalized)}
                  />
                );
              })}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t grid grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="border-b border-gray-300 pb-6">&nbsp;</p>
                  <p className="text-center text-gray-500 mt-1">Headmaster / Principal</p>
                </div>
                <div>
                  <p className="border-b border-gray-300 pb-6">&nbsp;</p>
                  <p className="text-center text-gray-500 mt-1">Date</p>
                </div>
              </div>
            </article>
          </>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-primary { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-primary:hover { background: #2c1a73; }
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

function ResultSection({
  template, result, onHeadmasterRemark, onLockUnlock,
}: {
  template: AssessmentTemplate;
  result: AssessmentResult;
  onHeadmasterRemark: (text: string) => void;
  onLockUnlock: () => void;
}) {
  const markers = [...template.markers].sort((a, b) => a.order - b.order);
  const [remarkDraft, setRemarkDraft] = useState(result.headmaster_remark ?? "");

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{template.name}</h4>
        <button
          type="button"
          onClick={onLockUnlock}
          className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-700 print:hidden"
        >
          {result.finalized ? "🔒 Finalized — Reopen" : "🔓 Open — Lock"}
        </button>
      </div>
      <table className="w-full text-sm border border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="border px-3 py-2 text-left">Marker</th>
            <th className="border px-3 py-2 text-center w-20">Grade</th>
          </tr>
        </thead>
        <tbody>
          {markers.map((m) => {
            const entry = result.entries.find((e) => e.marker_id === m.id);
            const grade = entry?.grade;
            return (
              <tr key={m.id}>
                <td className="border px-3 py-2">
                  <p className="font-medium">{m.name}</p>
                  {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                </td>
                <td className="border px-3 py-2 text-center font-bold text-lg" style={{ color: grade ? GRADE_COLORS[grade] : "#9ca3af" }}>
                  {grade ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Teacher&apos;s Remark</p>
          <p className="text-sm whitespace-pre-wrap">{result.teacher_remark || <em className="text-gray-400">— not yet recorded —</em>}</p>
          {result.teacher_remark_by && (
            <p className="text-[10px] text-gray-400 mt-1">— {result.teacher_remark_by}</p>
          )}
        </div>
        <div className="rounded-lg border bg-indigo-50 p-3">
          <p className="text-xs font-medium text-indigo-800 mb-1">Headmaster&apos;s Remark</p>
          <p className="text-sm whitespace-pre-wrap print:block hidden">{result.headmaster_remark || <em className="text-gray-400">—</em>}</p>
          <textarea
            className="w-full mt-1 px-2 py-1.5 rounded border border-indigo-200 text-sm bg-white print:hidden"
            rows={3}
            placeholder="Add the headmaster's comments here"
            value={remarkDraft}
            onChange={(e) => setRemarkDraft(e.target.value)}
            onBlur={() => { if (remarkDraft !== (result.headmaster_remark ?? "")) onHeadmasterRemark(remarkDraft); }}
          />
          {result.headmaster_remark_by && (
            <p className="text-[10px] text-indigo-700 mt-1">— {result.headmaster_remark_by}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
