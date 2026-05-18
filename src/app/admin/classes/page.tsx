"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { SchoolSection, StudentLevel, SubjectCategory } from "@/lib/types";
import toast from "react-hot-toast";

const SECTION_LABEL: Record<SchoolSection, string> = {
  preschool: "Preschool",
  primary: "Primary",
  jhs: "Junior High School",
};

const LEVEL_OPTIONS: StudentLevel[] = ["creche", "nursery", "kg", "primary", "jhs"];
const LEVEL_LABEL: Record<StudentLevel, string> = {
  creche: "Crèche", nursery: "Nursery", kg: "KG", primary: "Primary", jhs: "JHS",
};

const CATEGORY_LABEL: Record<SubjectCategory, string> = {
  core: "Core",
  elective: "Elective",
  "co-scholastic": "Co-Scholastic",
};

export default function ClassesPage() {
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const addClass = useAppStore((s) => s.addClass);
  const updateClass = useAppStore((s) => s.updateClass);
  const deleteClass = useAppStore((s) => s.deleteClass);
  const addSubject = useAppStore((s) => s.addSubject);
  const deleteSubject = useAppStore((s) => s.deleteSubject);

  const [tab, setTab] = useState<SchoolSection>("preschool");
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState<StudentLevel>("creche");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState<SubjectCategory>("core");

  const sectionClasses = useMemo(
    () => classes.filter((c) => c.section === tab).sort((a, b) => a.order - b.order),
    [classes, tab],
  );
  const sectionSubjects = useMemo(
    () => subjects.filter((s) => s.section === tab),
    [subjects, tab],
  );

  const onAddClass = () => {
    if (!newClassName.trim()) { toast.error("Class name required"); return; }
    const maxOrder = Math.max(0, ...classes.map((c) => c.order));
    addClass({
      name: newClassName.trim(),
      section: tab,
      level: newClassLevel,
      order: maxOrder + 1,
    });
    setNewClassName("");
    toast.success("Class added");
  };

  const onAddSubject = () => {
    if (!newSubjectName.trim()) { toast.error("Subject name required"); return; }
    addSubject({
      name: newSubjectName.trim(),
      section: tab,
      category: newSubjectCategory,
    });
    setNewSubjectName("");
    toast.success("Subject added");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🏫 Classes & Subjects</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Manage the school&apos;s class structure and what subjects each section teaches.
            Reports, gradebooks, and assessments all pull from this list — keep it current.
          </p>
        </header>

        <div className="flex gap-2 border-b">
          {(Object.keys(SECTION_LABEL) as SchoolSection[]).map((sec) => (
            <button
              key={sec}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === sec
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setTab(sec)}
            >
              {SECTION_LABEL[sec]} <span className="text-xs opacity-60">({classes.filter((c) => c.section === sec).length})</span>
            </button>
          ))}
        </div>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Classes in {SECTION_LABEL[tab]}</h2>
          <ul className="divide-y">
            {sectionClasses.length === 0 && (
              <li className="text-sm text-gray-400 py-2">No classes yet — add one below.</li>
            )}
            {sectionClasses.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{LEVEL_LABEL[c.level]}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-gray-500 hover:text-indigo-600"
                    onClick={() => {
                      const next = prompt("Rename class:", c.name);
                      if (next && next.trim() !== c.name) updateClass(c.id, { name: next.trim() });
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (confirm(`Delete class "${c.name}"? Students in this class will not be deleted, but their class label will need updating.`)) {
                        deleteClass(c.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 items-end pt-4 border-t">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-gray-500">New class name</label>
              <input className="input" placeholder="e.g. Class 1, JHS 2" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
            </div>
            <div className="min-w-[120px]">
              <label className="text-xs text-gray-500">Level</label>
              <select className="input" value={newClassLevel} onChange={(e) => setNewClassLevel(e.target.value as StudentLevel)}>
                {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
              </select>
            </div>
            <button className="btn-gold" onClick={onAddClass}>Add class</button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-1">Subjects taught in {SECTION_LABEL[tab]}</h2>
          <p className="text-xs text-gray-500 mb-3">
            {tab === "preschool" && "Preschool uses co-scholastic markers (play, language, numeracy). These appear in the preschool report card."}
            {tab === "primary" && "Primary uses core subjects only."}
            {tab === "jhs" && "JHS has core subjects (compulsory) and electives (chosen by the student)."}
          </p>
          <ul className="divide-y">
            {sectionSubjects.length === 0 && (
              <li className="text-sm text-gray-400 py-2">No subjects yet — add one below.</li>
            )}
            {sectionSubjects.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                    s.category === "core" ? "bg-indigo-50 text-indigo-700" :
                    s.category === "elective" ? "bg-amber-50 text-amber-700" :
                    "bg-emerald-50 text-emerald-700"
                  }`}>
                    {CATEGORY_LABEL[s.category]}
                  </span>
                </div>
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => { if (confirm(`Delete subject "${s.name}"?`)) deleteSubject(s.id); }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 items-end pt-4 border-t">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-gray-500">New subject name</label>
              <input className="input" placeholder="e.g. Mathematics" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
            </div>
            <div className="min-w-[140px]">
              <label className="text-xs text-gray-500">Category</label>
              <select className="input" value={newSubjectCategory} onChange={(e) => setNewSubjectCategory(e.target.value as SubjectCategory)}>
                {tab === "preschool"
                  ? <option value="co-scholastic">Co-Scholastic</option>
                  : <>
                      <option value="core">Core</option>
                      {tab === "jhs" && <option value="elective">Elective</option>}
                    </>}
              </select>
            </div>
            <button className="btn-gold" onClick={onAddSubject}>Add subject</button>
          </div>
        </section>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-gold { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-gold:hover { background: #2c1a73; }
        `}</style>
      </div>
    </DashboardShell>
  );
}
