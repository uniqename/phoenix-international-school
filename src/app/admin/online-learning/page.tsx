"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type {
  ExamFormat, ExamDeliveryStatus, OnlineAssignment, AssignmentQuestionKind,
  ClassroomSessionKind, AssignmentStatus,
} from "@/lib/types";
import toast from "react-hot-toast";

type Tab = "exams" | "assignments" | "classroom" | "reports";

const FORMAT_LABEL: Record<ExamFormat, string> = {
  objective_only: "Objective only",
  essay_only: "Essay only",
  objective_and_essay: "Objective & essay",
};

const STATUS_PILL = (status: string) => {
  const map: Record<string, { bg: string; fg: string; emoji: string }> = {
    draft:     { bg: "rgba(100,116,139,0.1)", fg: "#475569", emoji: "📝" },
    published: { bg: "rgba(34,197,94,0.1)",   fg: "#16a34a", emoji: "✅" },
    closed:    { bg: "rgba(239,68,68,0.1)",   fg: "#b91c1c", emoji: "🔒" },
  };
  const v = map[status] ?? map.draft;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: v.bg, color: v.fg }}>{v.emoji} {status}</span>;
};

export default function OnlineLearningPage() {
  const exams = useAppStore((s) => s.onlineExams);
  const assignments = useAppStore((s) => s.onlineAssignments);
  const sessions = useAppStore((s) => s.classroomSessions);
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const addExam = useAppStore((s) => s.addOnlineExam);
  const updateExam = useAppStore((s) => s.updateOnlineExam);
  const deleteExam = useAppStore((s) => s.deleteOnlineExam);
  const addAssignment = useAppStore((s) => s.addOnlineAssignment);
  const updateAssignment = useAppStore((s) => s.updateOnlineAssignment);
  const deleteAssignment = useAppStore((s) => s.deleteOnlineAssignment);
  const addQuestion = useAppStore((s) => s.addQuestionToAssignment);
  const removeQuestion = useAppStore((s) => s.removeQuestionFromAssignment);
  const addSession = useAppStore((s) => s.addClassroomSession);
  const updateSession = useAppStore((s) => s.updateClassroomSession);
  const deleteSession = useAppStore((s) => s.deleteClassroomSession);

  const [tab, setTab] = useState<Tab>("exams");

  // ── Exams ──
  const [eName, setEName] = useState("");
  const [eCode, setECode] = useState("");
  const [eSubject, setESubject] = useState("");
  const [eStart, setEStart] = useState("");
  const [eEnd, setEEnd] = useState("");
  const [eDuration, setEDuration] = useState("60");
  const [eFormat, setEFormat] = useState<ExamFormat>("objective_and_essay");
  const [eMarks, setEMarks] = useState("");
  const [eClassIds, setEClassIds] = useState<string[]>([]);

  const onAddExam = () => {
    if (!eName.trim() || !eCode.trim()) { toast.error("Name + code required"); return; }
    if (!eStart || !eEnd) { toast.error("Start + end dates required"); return; }
    const dur = parseInt(eDuration, 10);
    if (Number.isNaN(dur) || dur <= 0) { toast.error("Duration must be > 0"); return; }
    addExam({
      name: eName.trim().toUpperCase(),
      code: eCode.trim().toUpperCase(),
      subject_id: eSubject || undefined,
      class_ids: eClassIds,
      starts_on: eStart,
      ends_on: eEnd,
      duration_minutes: dur,
      exam_format: eFormat,
      status: "draft",
      total_marks: eMarks ? parseInt(eMarks, 10) : undefined,
    });
    setEName(""); setECode(""); setESubject(""); setEStart(""); setEEnd(""); setEDuration("60"); setEMarks(""); setEClassIds([]);
    toast.success("Exam created (draft)");
  };

  // ── Assignments ──
  const [aTitle, setATitle] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aDue, setADue] = useState("");
  const [aClassIds, setAClassIds] = useState<string[]>([]);
  const [aInstructions, setAInstructions] = useState("");

  const onAddAssignment = () => {
    if (!aTitle.trim()) { toast.error("Title required"); return; }
    addAssignment({
      title: aTitle.trim(),
      subject_id: aSubject || undefined,
      class_ids: aClassIds,
      due_date: aDue || undefined,
      instructions: aInstructions.trim() || undefined,
      questions: [],
      status: "draft",
    });
    setATitle(""); setASubject(""); setADue(""); setAClassIds([]); setAInstructions("");
    toast.success("Assignment created (draft)");
  };

  const [editingAssignment, setEditingAssignment] = useState<OnlineAssignment | null>(null);
  const [qPrompt, setQPrompt] = useState("");
  const [qKind, setQKind] = useState<AssignmentQuestionKind>("short_answer");
  const [qMarks, setQMarks] = useState("5");
  const [qChoices, setQChoices] = useState<string[]>(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState<number>(0);

  const onAddQuestion = () => {
    if (!editingAssignment) return;
    if (!qPrompt.trim()) { toast.error("Question prompt required"); return; }
    const marks = parseInt(qMarks, 10);
    if (Number.isNaN(marks) || marks < 0) { toast.error("Marks must be ≥ 0"); return; }
    const cleanChoices = qChoices.map((c) => c.trim()).filter(Boolean);
    if (qKind === "multiple_choice" && cleanChoices.length < 2) {
      toast.error("Multiple choice needs at least 2 options");
      return;
    }
    addQuestion(editingAssignment.id, {
      order: (editingAssignment.questions.length ?? 0) + 1,
      kind: qKind,
      prompt: qPrompt.trim(),
      marks,
      choices: qKind === "multiple_choice" ? cleanChoices : undefined,
      correct_choice_index: qKind === "multiple_choice" ? qCorrect : undefined,
    });
    setQPrompt(""); setQMarks("5"); setQChoices(["", "", "", ""]); setQCorrect(0);
    toast.success("Question added");
  };

  // ── Classroom ──
  const [sTitle, setSTitle] = useState("");
  const [sKind, setSKind] = useState<ClassroomSessionKind>("live");
  const [sScheduled, setSScheduled] = useState("");
  const [sUrl, setSUrl] = useState("");
  const [sDescription, setSDescription] = useState("");
  const [sClassIds, setSClassIds] = useState<string[]>([]);

  const onAddSession = () => {
    if (!sTitle.trim()) { toast.error("Title required"); return; }
    addSession({
      title: sTitle.trim(),
      description: sDescription.trim() || undefined,
      kind: sKind,
      class_ids: sClassIds,
      scheduled_at: sScheduled || undefined,
      meeting_url: sUrl.trim() || undefined,
      is_active: true,
    });
    setSTitle(""); setSDescription(""); setSScheduled(""); setSUrl(""); setSClassIds([]);
    toast.success("Session added");
  };

  const subjectName = (id?: string) => subjects.find((s) => s.id === id)?.name ?? "—";
  const classNames = (ids: string[]) => ids.length > 0
    ? ids.map((id) => classes.find((c) => c.id === id)?.name ?? "?").join(", ")
    : "All classes";

  const tabs: Array<{ key: Tab; label: string; emoji: string; count: number }> = [
    { key: "exams",       label: "Tests & Exams",   emoji: "📝", count: exams.length },
    { key: "assignments", label: "Assignments",     emoji: "📚", count: assignments.length },
    { key: "classroom",   label: "Online Classroom", emoji: "💻", count: sessions.length },
    { key: "reports",     label: "Manage Reports",  emoji: "📊", count: 0 },
  ];

  // Reports tab — submissions placeholder (no submissions stored yet; show what would be tracked)
  const reportsSummary = useMemo(() => ({
    exams_total: exams.length,
    exams_published: exams.filter((e) => e.status === "published").length,
    assignments_total: assignments.length,
    assignments_published: assignments.filter((a) => a.status === "published").length,
    sessions_total: sessions.length,
    sessions_live: sessions.filter((s) => s.kind === "live").length,
  }), [exams, assignments, sessions]);

  const classChipPicker = (selected: string[], setSelected: (v: string[]) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {classes.sort((a, b) => a.order - b.order).map((c) => {
        const active = selected.includes(c.id);
        return (
          <button key={c.id} type="button" onClick={() => setSelected(active ? selected.filter((x) => x !== c.id) : [...selected, c.id])}
            className="text-xs px-3 py-1 rounded-full font-bold"
            style={{
              background: active ? "rgba(26,63,160,0.15)" : "rgba(0,0,0,0.04)",
              color: active ? "#1A3FA0" : "#6b7280",
              border: active ? "1px solid rgba(26,63,160,0.4)" : "1px solid transparent",
            }}>
            {c.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">💻 Online Learning</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Tests &amp; exams, rich-question assignments, online classroom sessions, and submission reports — all in one place.
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

        {tab === "exams" && (
          <>
            <section className="glass rounded-2xl p-5">
              {exams.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400">
                  <span className="block text-4xl mb-1">📝</span>
                  No exams yet — create one below.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                    <tr>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Code</th>
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Format</th>
                      <th className="text-right py-2">Duration</th>
                      <th className="text-left py-2">Window</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50">
                        <td className="py-2 font-bold text-gray-800">{e.name}</td>
                        <td className="py-2 font-mono text-xs text-gray-600">{e.code}</td>
                        <td className="py-2 text-xs text-gray-600">{subjectName(e.subject_id)}</td>
                        <td className="py-2 text-xs text-gray-600">{FORMAT_LABEL[e.exam_format]}</td>
                        <td className="py-2 text-right text-xs text-gray-600">{e.duration_minutes}m</td>
                        <td className="py-2 text-xs text-gray-500 font-mono">{e.starts_on.slice(0, 10)} → {e.ends_on.slice(0, 10)}</td>
                        <td className="py-2">{STATUS_PILL(e.status)}</td>
                        <td className="py-2 text-right">
                          {e.status !== "published" && <button type="button" className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 mr-1" onClick={() => updateExam(e.id, { status: "published" })}>Publish</button>}
                          {e.status === "published" && <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 mr-1" onClick={() => updateExam(e.id, { status: "closed" as ExamDeliveryStatus })}>Close</button>}
                          <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                            if (confirm(`Delete ${e.name}?`)) deleteExam(e.id);
                          }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">➕ New exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input className="input md:col-span-2" placeholder="Name (e.g. MID-TERM TEST)" value={eName} onChange={(e) => setEName(e.target.value)} />
                <input className="input" placeholder="Code" value={eCode} onChange={(e) => setECode(e.target.value)} />
                <select className="input" value={eSubject} onChange={(e) => setESubject(e.target.value)}>
                  <option value="">Subject —</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className="input" type="datetime-local" value={eStart} onChange={(e) => setEStart(e.target.value)} placeholder="Start" />
                <input className="input" type="datetime-local" value={eEnd} onChange={(e) => setEEnd(e.target.value)} placeholder="End" />
                <input className="input" type="number" placeholder="Duration (min)" value={eDuration} onChange={(e) => setEDuration(e.target.value)} />
                <select className="input" value={eFormat} onChange={(e) => setEFormat(e.target.value as ExamFormat)}>
                  <option value="objective_only">Objective only</option>
                  <option value="essay_only">Essay only</option>
                  <option value="objective_and_essay">Objective &amp; essay</option>
                </select>
                <input className="input" type="number" placeholder="Total marks" value={eMarks} onChange={(e) => setEMarks(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Classes</p>
              {classChipPicker(eClassIds, setEClassIds)}
              <button type="button" className="btn-gold" onClick={onAddExam}>+ Create exam</button>
            </section>
          </>
        )}

        {tab === "assignments" && (
          <>
            <section className="glass rounded-2xl p-5 space-y-3">
              {assignments.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400">
                  <span className="block text-4xl mb-1">📚</span>
                  No assignments yet — create one below, then add questions.
                </p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a) => (
                    <li key={a.id} className="p-3 rounded-xl bg-gray-50">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-800">{a.title}</h4>
                            {STATUS_PILL(a.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {subjectName(a.subject_id)} · {classNames(a.class_ids)} · {a.questions.length} question{a.questions.length === 1 ? "" : "s"}
                            {a.due_date && ` · due ${a.due_date}`}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => setEditingAssignment(editingAssignment?.id === a.id ? null : a)}>{editingAssignment?.id === a.id ? "Hide" : "Edit questions"}</button>
                          {a.status !== "published" && <button type="button" className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => updateAssignment(a.id, { status: "published" })}>Publish</button>}
                          {a.status === "published" && <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => updateAssignment(a.id, { status: "closed" as AssignmentStatus })}>Close</button>}
                          <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                            if (confirm(`Delete ${a.title}?`)) deleteAssignment(a.id);
                          }}>Delete</button>
                        </div>
                      </div>

                      {editingAssignment?.id === a.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Questions ({a.questions.length})</p>
                          <ul className="space-y-1.5 mb-3">
                            {a.questions.length === 0 && <li className="text-xs text-gray-400">No questions yet — add one below.</li>}
                            {a.questions.sort((q1, q2) => q1.order - q2.order).map((q) => (
                              <li key={q.id} className="p-2.5 rounded-lg bg-white border border-gray-200">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-gray-400 font-mono w-6 pt-0.5">Q{q.order}</span>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.prompt}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{q.kind.replace("_", " ")} · {q.marks} mark{q.marks === 1 ? "" : "s"}</p>
                                    {q.kind === "multiple_choice" && q.choices && (
                                      <ul className="mt-1 text-xs text-gray-600">
                                        {q.choices.map((c, i) => (
                                          <li key={i} className={i === q.correct_choice_index ? "font-bold text-emerald-700" : ""}>
                                            {String.fromCharCode(65 + i)}. {c} {i === q.correct_choice_index && "✓"}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700" onClick={() => removeQuestion(a.id, q.id)}>×</button>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 space-y-2">
                            <p className="text-sm font-bold text-indigo-900">➕ Add question</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <select className="input" value={qKind} onChange={(e) => setQKind(e.target.value as AssignmentQuestionKind)}>
                                <option value="short_answer">Short answer</option>
                                <option value="essay">Essay</option>
                                <option value="multiple_choice">Multiple choice</option>
                                <option value="file_upload">File upload</option>
                              </select>
                              <input className="input" type="number" placeholder="Marks" value={qMarks} onChange={(e) => setQMarks(e.target.value)} />
                              <button type="button" className="btn-gold" onClick={onAddQuestion}>+ Add question</button>
                            </div>
                            <textarea className="input" rows={3} placeholder="Question prompt (markdown — math via $...$, lists, etc. supported in viewer)" value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} />
                            {qKind === "multiple_choice" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {qChoices.map((c, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <button type="button" onClick={() => setQCorrect(i)}
                                      className="text-xs font-bold px-2 py-1 rounded-full"
                                      style={{ background: qCorrect === i ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.05)", color: qCorrect === i ? "#16a34a" : "#6b7280" }}>
                                      {qCorrect === i ? "✓" : "○"} {String.fromCharCode(65 + i)}
                                    </button>
                                    <input className="input" placeholder={`Choice ${String.fromCharCode(65 + i)}`} value={c} onChange={(e) => {
                                      const next = [...qChoices]; next[i] = e.target.value; setQChoices(next);
                                    }} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">➕ New assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input className="input md:col-span-2" placeholder="Title (e.g. Algebra practice set)" value={aTitle} onChange={(e) => setATitle(e.target.value)} />
                <input className="input" type="date" value={aDue} onChange={(e) => setADue(e.target.value)} placeholder="Due" />
                <select className="input" value={aSubject} onChange={(e) => setASubject(e.target.value)}>
                  <option value="">Subject —</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input className="input md:col-span-2" placeholder="Short instructions (optional)" value={aInstructions} onChange={(e) => setAInstructions(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Classes</p>
              {classChipPicker(aClassIds, setAClassIds)}
              <button type="button" className="btn-gold" onClick={onAddAssignment}>+ Create assignment</button>
            </section>
          </>
        )}

        {tab === "classroom" && (
          <>
            <section className="glass rounded-2xl p-5">
              {sessions.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400">
                  <span className="block text-4xl mb-1">💻</span>
                  No classroom sessions yet — host a live class, share a recording, or open a discussion.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li key={s.id} className="p-3 rounded-xl bg-gray-50 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800">{s.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.kind === "live" ? "🔴 Live" : s.kind === "recorded" ? "📼 Recording" : "💬 Discussion"} ·
                          {s.scheduled_at ? ` ${new Date(s.scheduled_at).toLocaleString()}` : " On-demand"} ·
                          {" "}{classNames(s.class_ids)}
                        </p>
                        {s.description && <p className="text-xs text-gray-600 mt-1">{s.description}</p>}
                        {s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">🔗 Open meeting</a>}
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateSession(s.id, { is_active: !s.is_active })}>{s.is_active ? "Pause" : "Activate"}</button>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (confirm(`Delete ${s.title}?`)) deleteSession(s.id);
                        }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">➕ New session</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input className="input md:col-span-2" placeholder="Title" value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
                <select className="input" value={sKind} onChange={(e) => setSKind(e.target.value as ClassroomSessionKind)}>
                  <option value="live">🔴 Live (video call)</option>
                  <option value="recorded">📼 Recorded</option>
                  <option value="discussion">💬 Discussion</option>
                </select>
                <input className="input" type="datetime-local" value={sScheduled} onChange={(e) => setSScheduled(e.target.value)} placeholder="Scheduled at" />
                <input className="input md:col-span-2" placeholder="Meeting URL (Jitsi / Zoom / Meet)" value={sUrl} onChange={(e) => setSUrl(e.target.value)} />
                <textarea className="input md:col-span-3" rows={2} placeholder="Description (optional)" value={sDescription} onChange={(e) => setSDescription(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Classes</p>
              {classChipPicker(sClassIds, setSClassIds)}
              <button type="button" className="btn-gold" onClick={onAddSession}>+ Create session</button>
            </section>
          </>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-indigo-700">{reportsSummary.exams_total}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Exams total</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-700">{reportsSummary.exams_published}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Exams published</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-indigo-700">{reportsSummary.assignments_total}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Assignments total</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-emerald-700">{reportsSummary.assignments_published}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Assignments published</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-indigo-700">{reportsSummary.sessions_total}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sessions total</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-2xl font-black text-rose-600">{reportsSummary.sessions_live}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Live sessions</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 text-sm text-gray-600">
              <p>📊 <strong className="text-gray-900">Submission tracking</strong> is wired into the data model but the per-student submission UI is queued for a follow-up phase. Once a student app posts answers, this tab will show per-question accuracy, average score per class, and missing-submission lists.</p>
            </div>
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
