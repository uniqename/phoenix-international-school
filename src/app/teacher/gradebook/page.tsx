"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESGrade, getGESLabel, getGESColor, SUBJECTS_BY_LEVEL, CLASSES } from "@/lib/utils";
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

export default function GradebookPage() {
  const { user }   = useAuth();
  const students   = useAppStore((s) => s.students);
  const grades     = useAppStore((s) => s.grades);
  const saveGrades = useAppStore((s) => s.saveGrades);
  const teachers   = useAppStore((s) => s.teachers);

  const teacher = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const [activeClass, setActiveClass] = useState(teacher?.class_name ?? "JHS 3A");

  const level      = levelFromClass(activeClass);
  const subjects   = SUBJECTS_BY_LEVEL[level] ?? SUBJECTS_BY_LEVEL.jhs;
  const myStudents = students.filter((s) => s.class_name === activeClass);

  const [subject, setSubject] = useState(subjects[0]);
  const [term, setTerm]       = useState(2);
  const [year]                = useState("2025/2026");
  const [scores, setScores]   = useState<Record<string, string>>({});
  const [saved, setSaved]     = useState(false);

  const existingGrades = grades.filter(
    (g) => g.class_name === activeClass && g.subject === subject && g.term === term && g.academic_year === year
  );

  const getScore = (studentId: string) => {
    if (scores[studentId] !== undefined) return scores[studentId];
    const ex = existingGrades.find((g) => g.student_id === studentId);
    return ex ? String(ex.raw_score) : "";
  };

  const handleSave = () => {
    const toSave = myStudents
      .filter((s) => getScore(s.id) !== "")
      .map((s) => ({
        student_id: s.id,
        student_name: s.full_name,
        subject,
        class_name: activeClass,
        term,
        academic_year: year,
        raw_score: parseFloat(getScore(s.id)) || 0,
      }));
    if (toSave.length === 0) { toast.error("Enter at least one score"); return; }
    saveGrades(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success(`${toSave.length} grades saved for ${subject} — ${activeClass}`);
    setScores({});
  };

  const handleClassChange = (c: string) => {
    setActiveClass(c);
    setScores({});
    const newLevel = levelFromClass(c);
    const newSubjects = SUBJECTS_BY_LEVEL[newLevel] ?? SUBJECTS_BY_LEVEL.jhs;
    setSubject(newSubjects[0]);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-black text-gray-900">Gradebook</h2>
        <div className="flex gap-2 flex-wrap">
          <select aria-label="Subject" value={subject} onChange={(e) => { setSubject(e.target.value); setScores({}); }}
            className="px-3 py-2 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Term" value={term} onChange={(e) => setTerm(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
        </div>
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

      {/* GES scale reference */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[{g:1,l:"Excellent",r:"80–100"},{g:2,l:"Very Good",r:"70–79"},{g:3,l:"Good",r:"60–69"},{g:4,l:"Credit",r:"50–59"},{g:5,l:"Average",r:"40–49"},{g:6,l:"Below Avg",r:"30–39"}].map((x) => (
          <span key={x.g} className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: getGESColor(x.g) + "18", color: getGESColor(x.g) }}>
            {x.g} – {x.l} ({x.r}%)
          </span>
        ))}
      </div>

      {myStudents.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏫</div>
          <p className="text-gray-500 text-sm">No students enrolled in {activeClass}.</p>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead style={{ background: "#0A1628" }}>
                <tr className="text-xs text-blue-300 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-center px-4 py-3 font-semibold">Score (0–100)</th>
                  <th className="text-center px-4 py-3 font-semibold">GES Grade</th>
                  <th className="text-center px-4 py-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.map((s) => {
                  const raw   = getScore(s.id);
                  const score = raw ? parseFloat(raw) : null;
                  const ges   = score !== null ? getGESGrade(score) : null;
                  const color = ges ? getGESColor(ges) : "#9ca3af";
                  return (
                    <tr key={s.id} className="table-row border-t border-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{s.full_name}</div>
                        <div className="text-xs text-gray-400">{s.student_id}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number" min={0} max={100} value={raw}
                          onChange={(e) => setScores((p) => ({ ...p, [s.id]: e.target.value }))}
                          aria-label={`Score for ${s.full_name}`}
                          placeholder="—"
                          className="w-20 text-center px-2 py-1.5 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
                          style={{ borderColor: ges ? color + "60" : "#e5e7eb" }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ges !== null
                          ? <span className="text-sm font-black" style={{ color }}>{ges}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ges !== null
                          ? <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: color + "18", color }}>{getGESLabel(ges)}</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={handleSave}
            className="btn-gold w-full py-3 text-sm"
            style={saved ? { background: "#22c55e" } : undefined}>
            {saved ? "✅ Grades Saved!" : `Save ${subject} Grades — ${activeClass} · Term ${term}`}
          </button>
        </>
      )}
    </DashboardShell>
  );
}
