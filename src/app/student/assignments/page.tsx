"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type { OnlineAssignment, AssignmentAnswer } from "@/lib/types";
import toast from "react-hot-toast";

const NAV = [
  { icon: "🏠", label: "Dashboard",    href: "/student" },
  { icon: "📊", label: "My Grades",    href: "/student#grades" },
  { icon: "📚", label: "Homework",     href: "/student#homework" },
  { icon: "📝", label: "Assignments",  href: "/student/assignments" },
  { icon: "💻", label: "Lessons",      href: "/student#lessons" },
  { icon: "🎓", label: "Practice",     href: "/bece" },
  { icon: "💬", label: "Messages",     href: "/student/chat" },
  { icon: "📸", label: "School Feed",  href: "/student#feed" },
];

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const students = useAppStore((s) => s.students);
  const classes = useAppStore((s) => s.classes);
  const assignments = useAppStore((s) => s.onlineAssignments);
  const submissions = useAppStore((s) => s.assignmentSubmissions);
  const submitAssignment = useAppStore((s) => s.submitAssignment);

  const student = students.find((s) => s.full_name === user?.full_name) ?? students[0];
  const myClass = classes.find((c) => c.name === student?.class_name);

  // Published assignments for this student's class.
  const myAssignments = useMemo(() => {
    if (!myClass) return [];
    return assignments.filter((a) => a.status === "published" && a.class_ids.includes(myClass.id));
  }, [assignments, myClass]);

  const mySubmissionFor = (assignmentId: string) =>
    student ? submissions.find((s) => s.assignment_id === assignmentId && s.student_id === student.id) : undefined;

  const [active, setActive] = useState<OnlineAssignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, AssignmentAnswer>>({});

  const openAssignment = (a: OnlineAssignment) => {
    setActive(a);
    setAnswers({});
  };

  const setAnswer = (qid: string, patch: Partial<AssignmentAnswer>) => {
    setAnswers((p) => ({ ...p, [qid]: { ...(p[qid] ?? { question_id: qid }), ...patch, question_id: qid } }));
  };

  const handleSubmit = () => {
    if (!active || !student) return;
    const missing = active.questions.filter((q) => {
      const a = answers[q.id];
      if (!a) return true;
      if (q.kind === "multiple_choice") return a.choice_index == null;
      if (q.kind === "short_answer" || q.kind === "essay") return !a.text?.trim();
      if (q.kind === "file_upload") return !a.file_data_url;
      return false;
    });
    if (missing.length > 0) {
      if (!window.confirm(`You haven't answered ${missing.length} question${missing.length === 1 ? "" : "s"}. Submit anyway?`)) return;
    }
    submitAssignment({
      assignment_id: active.id,
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
      answers: Object.values(answers),
    });
    toast.success("✅ Submitted! Your teacher will grade the essay / short-answer parts.");
    setActive(null);
    setAnswers({});
  };

  return (
    <DashboardShell role="student" navItems={NAV}>
      {!active ? (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-black text-white">📝 My assignments</h2>
            <p className="text-xs text-gray-500 mt-0.5">{myAssignments.length} active assignment{myAssignments.length === 1 ? "" : "s"} for {student?.class_name}.</p>
          </div>

          {myAssignments.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-sm text-gray-500">
              No assignments for your class yet — they&apos;ll appear here when your teacher publishes one.
            </div>
          ) : (
            <div className="grid gap-3">
              {myAssignments.map((a) => {
                const my = mySubmissionFor(a.id);
                const overdue = a.due_date && new Date(a.due_date) < new Date();
                return (
                  <button type="button" key={a.id} onClick={() => openAssignment(a)}
                    className="glass rounded-2xl p-4 text-left transition-all hover:scale-[1.01]">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-black text-white text-base truncate">{a.title}</h3>
                        <p className="text-[11px] text-gray-400">
                          {a.questions.length} question{a.questions.length === 1 ? "" : "s"} ·
                          {a.due_date ? ` Due ${a.due_date}` : " Open"}
                          {a.total_marks ? ` · ${a.total_marks} marks total` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={my
                          ? { background: "rgba(16,185,129,0.18)", color: "#34d399" }
                          : overdue
                          ? { background: "rgba(239,68,68,0.18)", color: "#fca5a5" }
                          : { background: "rgba(255,215,0,0.18)", color: "#FFD700" }}>
                        {my ? "✅ Submitted" : overdue ? "⏰ Overdue" : "📝 Open"}
                      </span>
                    </div>
                    {a.instructions && <p className="text-xs text-gray-400 line-clamp-2">{a.instructions}</p>}
                    {my && (
                      <p className="text-[11px] text-emerald-300 mt-1">
                        Auto-score: {my.auto_score ?? 0}{my.total_possible ? ` / ${my.total_possible}` : ""}
                        {my.manual_score != null && ` · Teacher graded: ${my.manual_score}`}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="min-w-0">
              <button type="button" onClick={() => { setActive(null); setAnswers({}); }}
                className="text-xs font-bold text-blue-300 underline mb-1">← Back to assignments</button>
              <h2 className="text-xl font-black text-white">{active.title}</h2>
              <p className="text-xs text-gray-500">{active.questions.length} questions{active.total_marks ? ` · ${active.total_marks} marks` : ""}</p>
              {active.instructions && <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{active.instructions}</p>}
            </div>
          </div>

          <div className="space-y-3">
            {active.questions.sort((a, b) => a.order - b.order).map((q) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="glass rounded-2xl p-4">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <p className="font-bold text-white text-sm">Q{q.order}. <span className="font-normal whitespace-pre-wrap">{q.prompt}</span></p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{q.marks} mark{q.marks === 1 ? "" : "s"}</span>
                  </div>
                  {q.kind === "multiple_choice" && q.choices && (
                    <div className="space-y-1.5">
                      {q.choices.map((c, i) => (
                        <label key={i} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                          style={{ background: ans?.choice_index === i ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)" }}>
                          <input type="radio" name={q.id}
                            checked={ans?.choice_index === i}
                            onChange={() => setAnswer(q.id, { choice_index: i })} />
                          <span className="text-sm text-white">{String.fromCharCode(65 + i)}. {c}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {(q.kind === "short_answer" || q.kind === "essay") && (
                    <textarea
                      value={ans?.text ?? ""}
                      onChange={(e) => setAnswer(q.id, { text: e.target.value })}
                      rows={q.kind === "essay" ? 6 : 2}
                      aria-label={`Answer to question ${q.order}`}
                      placeholder={q.kind === "essay" ? "Write your essay…" : "Your answer…"}
                      className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 resize-none" />
                  )}
                  {q.kind === "file_upload" && (
                    <div>
                      <input type="file" aria-label="File answer"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 10 * 1024 * 1024) { toast.error("Max 10 MB"); return; }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setAnswer(q.id, { file_name: f.name, file_data_url: reader.result });
                            }
                          };
                          reader.readAsDataURL(f);
                        }}
                        className="text-xs text-white" />
                      {ans?.file_name && <p className="text-[11px] text-emerald-300 mt-1">📎 {ans.file_name}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-4 mt-4 pt-2">
            <button type="button" onClick={handleSubmit} className="btn-gold w-full py-3 text-sm font-black">
              ✅ Submit my answers
            </button>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
