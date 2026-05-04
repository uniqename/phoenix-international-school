"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { SUBJECTS_BY_LEVEL, CLASSES } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV = [
  { icon: "📊", label: "Overview",      href: "/teacher" },
  { icon: "📡", label: "Attendance",     href: "/teacher/attendance" },
  { icon: "📋", label: "Gradebook",      href: "/teacher/gradebook" },
  { icon: "📝", label: "Lesson Planner", href: "/teacher/lessons" },
  { icon: "📚", label: "Homework",       href: "/teacher/homework" },
  { icon: "📸", label: "School Feed",    href: "/teacher/feed" },
  { icon: "❓", label: "Question Bank", href: "/teacher/questions" },
  { icon: "🔐", label: "Pickup Verify",  href: "/teacher/pickup" },
];

function levelFromClass(className: string): string {
  if (className.startsWith("Crèche")) return "creche";
  if (className.startsWith("Nursery")) return "nursery";
  if (className.startsWith("KG")) return "kg";
  if (className.startsWith("Primary")) return "primary";
  return "jhs";
}

export default function HomeworkPage() {
  const { user }    = useAuth();
  const homework            = useAppStore((s) => s.homework);
  const addHomework         = useAppStore((s) => s.addHomework);
  const addAnnouncement     = useAppStore((s) => s.addAnnouncement);
  const homeworkSubmissions = useAppStore((s) => s.homeworkSubmissions);
  const teachers            = useAppStore((s) => s.teachers);
  const students    = useAppStore((s) => s.students);

  const teacher = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const [activeClass, setActiveClass] = useState(teacher?.class_name ?? "JHS 3A");

  const level      = levelFromClass(activeClass);
  const subjects   = SUBJECTS_BY_LEVEL[level] ?? SUBJECTS_BY_LEVEL.jhs;
  const myStudents = students.filter((s) => s.class_name === activeClass);
  const myHW       = homework.filter((h) => h.class_name === activeClass);

  const [showForm, setShowForm]   = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: subjects[0], title: "", description: "", due_date: "", video_url: "" });

  const notifyClass = (hw: typeof homework[number]) => {
    addAnnouncement({
      title: `📚 Homework: ${hw.subject} — ${hw.title}`,
      content: `${activeClass} — ${hw.subject} homework assigned.\n${hw.description ? hw.description + "\n" : ""}Due: ${hw.due_date}${hw.video_url ? `\n📹 Explanation: ${hw.video_url}` : ""}`,
      type: "both",
      audience: "specific_class",
      class_name: activeClass,
      created_by: user?.full_name,
    });
    toast.success(`📢 Homework notification sent to ${activeClass} parents & students`);
  };

  function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  const handleClassChange = (c: string) => {
    setActiveClass(c);
    const newSubjects = SUBJECTS_BY_LEVEL[levelFromClass(c)] ?? SUBJECTS_BY_LEVEL.jhs;
    setForm((p) => ({ ...p, subject: newSubjects[0] }));
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.due_date) { toast.error("Title and due date are required"); return; }
    addHomework({
      class_name: activeClass,
      subject: form.subject,
      title: form.title,
      description: form.description || undefined,
      due_date: form.due_date,
      teacher_name: user?.full_name,
      video_url: form.video_url || undefined,
      total_students: myStudents.length,
    });
    toast.success(`Homework assigned to ${activeClass}`);
    setForm({ subject: subjects[0], title: "", description: "", due_date: "", video_url: "" });
    setShowForm(false);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-black text-gray-900">Homework</h2>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-gold text-xs py-2 px-5">
          {showForm ? "Cancel" : "+ Assign Homework"}
        </button>
      </div>

      {/* Class switcher */}
      <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-black text-gray-600">Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {CLASSES.map((c) => (
            <button type="button" key={c} onClick={() => handleClassChange(c)}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={activeClass === c
                ? { background: "#003087", color: "white" }
                : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-black text-gray-900 mb-4">New Assignment — {activeClass}</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Subject *</label>
              <select aria-label="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Due Date *</label>
              <input type="date" aria-label="Due date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Exercises 14.1–14.4"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Instructions (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Detailed instructions for students and parents…"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">📹 Explanation Video URL (optional)</label>
              <input value={form.video_url} onChange={(e) => setForm((p) => ({ ...p, video_url: e.target.value }))}
                placeholder="YouTube / Drive link for parents to help at home"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
          </div>
          <button type="button" onClick={handleAdd} className="btn-gold text-sm py-2.5 px-6">
            Assign to {activeClass}
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {myHW.length === 0 ? (
          <div className="col-span-2 glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-500 text-sm">No homework assigned to {activeClass} yet.</p>
          </div>
        ) : myHW.map((hw) => {
          const submissionPct  = hw.total_students ? ((hw.submission_count ?? 0) / hw.total_students) * 100 : 0;
          const isOverdue      = new Date(hw.due_date) < new Date();
          const hwSubs         = homeworkSubmissions.filter((s) => s.homework_id === hw.id);
          const isExpanded     = expandedId === hw.id;
          return (
            <div key={hw.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>{hw.subject}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOverdue ? "text-red-500" : "text-orange-500"}`}
                  style={{ background: isOverdue ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)" }}>
                  {isOverdue ? "⏰ Overdue" : `Due: ${hw.due_date}`}
                </span>
              </div>
              <h3 className="font-black text-gray-900 mt-2 mb-1">{hw.title}</h3>
              {hw.description && <p className="text-xs text-gray-500 mb-2">{hw.description}</p>}
              {hw.video_url && (
                <a href={hw.video_url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 font-bold flex items-center gap-1 mb-2 hover:underline">
                  📹 View explanation video
                </a>
              )}

              {/* Submission progress */}
              {hw.total_students && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Submissions</span>
                    <span className="font-bold">{hw.submission_count ?? 0} / {hw.total_students}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${submissionPct}%` }} />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap mt-3">
                <button type="button" onClick={() => notifyClass(hw)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,215,0,0.15)", color: "#E5B800" }}>
                  📢 Notify Parents &amp; Students
                </button>
                {hwSubs.length > 0 && (
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : hw.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                    {isExpanded ? "Hide" : `View ${hwSubs.length} Submission${hwSubs.length > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>

              {/* Submission list */}
              {isExpanded && hwSubs.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                  {hwSubs.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-gray-50">
                      <span className="text-green-500 font-bold">✅</span>
                      <span className="font-semibold text-gray-800 flex-1 truncate">{sub.student_name}</span>
                      <span className="text-gray-500 truncate max-w-[120px]">{sub.file_name}</span>
                      <span className="text-gray-400 flex-shrink-0">{fmtSize(sub.file_size)}</span>
                      <span className="text-gray-400 flex-shrink-0">
                        {new Date(sub.submitted_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
