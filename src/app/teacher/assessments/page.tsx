"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type {
  AssessmentGrade, AssessmentResult, AssessmentTemplate, Student,
} from "@/lib/types";
import toast from "react-hot-toast";

const GRADES: AssessmentGrade[] = ["A", "B", "C", "D"];
const GRADE_COLORS: Record<AssessmentGrade, { bg: string; fg: string }> = {
  A: { bg: "#dcfce7", fg: "#15803d" },
  B: { bg: "#dbeafe", fg: "#1d4ed8" },
  C: { bg: "#fef3c7", fg: "#a16207" },
  D: { bg: "#fee2e2", fg: "#b91c1c" },
};

export default function TeacherAssessmentsPage() {
  const { user } = useAuth();
  const classes = useAppStore((s) => s.classes);
  const students = useAppStore((s) => s.students);
  const templates = useAppStore((s) => s.assessmentTemplates);
  const results = useAppStore((s) => s.assessmentResults);
  const upsertResult = useAppStore((s) => s.upsertAssessmentResult);
  const setEntry = useAppStore((s) => s.setAssessmentEntry);
  const setTeacherRemark = useAppStore((s) => s.setTeacherRemark);
  const finalize = useAppStore((s) => s.finalizeResult);
  const schoolSettings = useAppStore((s) => s.schoolSettings);

  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [templateId, setTemplateId] = useState("");
  const [term, setTerm] = useState<1 | 2 | 3>(schoolSettings.current_term);

  const classTemplates = useMemo(
    () => templates.filter((t) => t.class_id === classId && t.active),
    [templates, classId],
  );
  const template = templates.find((t) => t.id === templateId);
  const selectedClass = classes.find((c) => c.id === classId);
  const classStudents = useMemo(
    () => students.filter((s) => s.class_name === selectedClass?.name),
    [students, selectedClass],
  );

  // For each student, look up an existing result for this template + term/year
  const resultFor = (studentId: string): AssessmentResult | undefined =>
    results.find(
      (r) => r.template_id === templateId
        && r.student_id === studentId
        && r.term === term
        && r.academic_year === schoolSettings.current_academic_year,
    );

  const ensureResult = (studentId: string): AssessmentResult => {
    const existing = resultFor(studentId);
    if (existing) return existing;
    return upsertResult({
      template_id: templateId,
      student_id: studentId,
      term,
      academic_year: schoolSettings.current_academic_year,
      entries: [],
      finalized: false,
    });
  };

  const setStudentGrade = (studentId: string, markerId: string, grade: AssessmentGrade) => {
    const r = ensureResult(studentId);
    setEntry(r.id, { marker_id: markerId, grade });
  };

  const saveRemark = (studentId: string, text: string) => {
    const r = ensureResult(studentId);
    setTeacherRemark(r.id, text, user?.full_name);
  };

  const toggleFinalize = (studentId: string) => {
    const r = ensureResult(studentId);
    finalize(r.id, !r.finalized);
    toast.success(r.finalized ? "Reopened — teacher can edit again" : "Finalized — sent to headmaster for review");
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-sm text-gray-500">
            Pick a class and template, then score each student per marker. Add a remark, then mark finalized once you&apos;re done.
          </p>
        </header>

        {/* Pickers */}
        <section className="grid md:grid-cols-3 gap-3 rounded-xl border bg-white p-4">
          <Field label="Class">
            <select className="input" value={classId} onChange={(e) => { setClassId(e.target.value); setTemplateId(""); }}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Assessment template">
            <select className="input" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">— select —</option>
              {classTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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

        {!template && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
            {classTemplates.length === 0
              ? `No active assessment templates for ${selectedClass?.name ?? "this class"} yet. Ask admin to create one in /admin/assessments.`
              : "Pick a template to start grading."}
          </div>
        )}

        {template && classStudents.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
            No students in {selectedClass?.name} yet.
          </div>
        )}

        {/* Grading grid */}
        {template && classStudents.length > 0 && (
          <section className="space-y-4">
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900">
              <p className="font-semibold">Template: {template.name}</p>
              <p>{template.markers.length} marker{template.markers.length === 1 ? "" : "s"} · scale: {template.scale === "abcd" ? "A–D" : template.scale} · {term && `Term ${term}`}</p>
            </div>

            {classStudents.map((student) => {
              const r = resultFor(student.id);
              const finalized = r?.finalized ?? false;
              return (
                <StudentRow
                  key={student.id}
                  student={student}
                  template={template}
                  result={r}
                  finalized={finalized}
                  onGrade={(markerId, grade) => setStudentGrade(student.id, markerId, grade)}
                  onRemark={(text) => saveRemark(student.id, text)}
                  onToggleFinalize={() => toggleFinalize(student.id)}
                />
              );
            })}
          </section>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}

function StudentRow({
  student, template, result, finalized,
  onGrade, onRemark, onToggleFinalize,
}: {
  student: Student;
  template: AssessmentTemplate;
  result?: AssessmentResult;
  finalized: boolean;
  onGrade: (markerId: string, grade: AssessmentGrade) => void;
  onRemark: (text: string) => void;
  onToggleFinalize: () => void;
}) {
  const [remarkDraft, setRemarkDraft] = useState(result?.teacher_remark ?? "");
  const markers = [...template.markers].sort((a, b) => a.order - b.order);
  const scoredCount = result?.entries.length ?? 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold">{student.full_name}</p>
          <p className="text-xs text-gray-500">{student.class_name} · {student.student_id} · {scoredCount}/{markers.length} markers scored</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleFinalize}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${finalized ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"}`}
          >
            {finalized ? "✓ Finalized — Reopen" : "Finalize"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {markers.map((m) => {
          const entry = result?.entries.find((e) => e.marker_id === m.id);
          return (
            <div key={m.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium">{m.name}</p>
                {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
              </div>
              <div className="flex gap-1">
                {GRADES.map((g) => {
                  const active = entry?.grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={finalized}
                      onClick={() => onGrade(m.id, g)}
                      className="w-9 h-9 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: active ? GRADE_COLORS[g].bg : "#f9fafb",
                        color: active ? GRADE_COLORS[g].fg : "#6b7280",
                        border: active ? `2px solid ${GRADE_COLORS[g].fg}` : "1px solid #e5e7eb",
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t">
        <label className="text-xs font-medium text-gray-700">Teacher&apos;s Remark</label>
        <textarea
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
          rows={2}
          disabled={finalized}
          placeholder='e.g. "Showing strong progress with letter recognition; needs more practice with numbers."'
          value={remarkDraft}
          onChange={(e) => setRemarkDraft(e.target.value)}
          onBlur={() => { if (remarkDraft !== (result?.teacher_remark ?? "")) onRemark(remarkDraft); }}
        />
        {result?.teacher_remark_by && (
          <p className="text-[10px] text-gray-400 mt-1">— {result.teacher_remark_by}</p>
        )}
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
