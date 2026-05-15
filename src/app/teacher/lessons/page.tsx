"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { NACCA_STRANDS, SUBJECTS_BY_LEVEL, CLASSES } from "@/lib/utils";
import toast from "react-hot-toast";


function levelFromClass(className: string): string {
  if (className.startsWith("Crèche")) return "creche";
  if (className.startsWith("Nursery")) return "nursery";
  if (className.startsWith("KG")) return "kg";
  if (className.startsWith("Primary")) return "primary";
  return "jhs";
}

export default function LessonsPage() {
  const { user }      = useAuth();
  const lessonPlans   = useAppStore((s) => s.lessonPlans);
  const addLessonPlan = useAppStore((s) => s.addLessonPlan);
  const teachers      = useAppStore((s) => s.teachers);

  const teacher = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const [activeClass, setActiveClass] = useState(teacher?.class_name ?? "JHS 3A");

  const level    = levelFromClass(activeClass);
  const subjects = SUBJECTS_BY_LEVEL[level] ?? SUBJECTS_BY_LEVEL.jhs;

  const [subject,    setSubject]    = useState(subjects[0]);
  const [strand,     setStrand]     = useState("");
  const [subStrand,  setSubStrand]  = useState("");
  const [week,       setWeek]       = useState(14);
  const [content,    setContent]    = useState("");
  const [showForm,   setShowForm]   = useState(false);

  const strands   = NACCA_STRANDS[subject] ?? [];
  const strandObj = strands.find((s) => s.strand === strand);

  const myPlans = lessonPlans.filter(
    (lp) => lp.class_name === activeClass || lp.teacher_name === user?.full_name
  );

  const handleClassChange = (c: string) => {
    setActiveClass(c);
    const newSubjects = SUBJECTS_BY_LEVEL[levelFromClass(c)] ?? SUBJECTS_BY_LEVEL.jhs;
    setSubject(newSubjects[0]);
    setStrand("");
    setSubStrand("");
    setShowForm(false);
  };

  const handleSave = () => {
    if (!strand || !subStrand) { toast.error("Select a strand and sub-strand"); return; }
    addLessonPlan({
      class_name: activeClass,
      subject,
      strand,
      sub_strand: subStrand,
      week_number: week,
      content,
      teacher_name: user?.full_name,
    });
    toast.success("Lesson plan saved");
    setContent("");
    setStrand("");
    setSubStrand("");
    setShowForm(false);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">NaCCA / GES Lesson Planner</h2>
          <p className="text-xs text-gray-500">GES-aligned curriculum</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-gold text-xs py-2 px-5">
          {showForm ? "Cancel" : "+ New Lesson Plan"}
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
          <h3 className="font-black text-gray-900 mb-4">Create Lesson Plan — {activeClass}</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Subject *</label>
              <select aria-label="Subject" value={subject}
                onChange={(e) => { setSubject(e.target.value); setStrand(""); setSubStrand(""); }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Week Number</label>
              <input type="number" aria-label="Week number" value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                min={1} max={40}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Strand *</label>
              <select aria-label="Strand" value={strand}
                onChange={(e) => { setStrand(e.target.value); setSubStrand(""); }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                <option value="">— Select strand —</option>
                {strands.map((s) => <option key={s.strand} value={s.strand}>{s.strand}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Sub-Strand *</label>
              <select aria-label="Sub-strand" value={subStrand}
                onChange={(e) => setSubStrand(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                disabled={!strandObj}>
                <option value="">— Select sub-strand —</option>
                {strandObj?.subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 mb-1">Lesson Notes / Plan</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={5} placeholder="Starter activity, main lesson, group work, plenary…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
          </div>
          <button type="button" onClick={handleSave} className="btn-gold text-sm py-2.5 px-6">
            Save Lesson Plan
          </button>
        </div>
      )}

      <div className="space-y-3">
        {myPlans.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 text-sm">No lesson plans yet. Create your first one above.</p>
          </div>
        ) : myPlans.map((lp) => (
          <div key={lp.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-black text-gray-900">{lp.subject}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>{lp.strand}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>{lp.sub_strand}</span>
                  {lp.week_number && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Week {lp.week_number}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{lp.class_name}</span>
            </div>
            {lp.content && <p className="text-sm text-gray-600 mt-2">{lp.content}</p>}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
