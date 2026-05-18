"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { CourseGroup } from "@/lib/types";
import toast from "react-hot-toast";

type Form = { name: string; code: string; description: string; active: boolean };

const blank = (): Form => ({ name: "", code: "", description: "", active: true });

export default function CourseGroupsPage() {
  const groups = useAppStore((s) => s.courseGroups);
  const students = useAppStore((s) => s.students);
  const addGroup = useAppStore((s) => s.addCourseGroup);
  const updateGroup = useAppStore((s) => s.updateCourseGroup);
  const deleteGroup = useAppStore((s) => s.deleteCourseGroup);

  const [editing, setEditing] = useState<CourseGroup | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Form>(blank());
  const [search, setSearch] = useState("");

  const countByGroup = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of students) {
      if (s.course_group_id) m.set(s.course_group_id, (m.get(s.course_group_id) ?? 0) + 1);
    }
    return m;
  }, [students]);

  const filtered = groups.filter((g) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };

  const openEdit = (g: CourseGroup) => {
    setEditing(g);
    setForm({
      name: g.name,
      code: g.code,
      description: g.description ?? "",
      active: g.active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    const codeUpper = form.code.trim().toUpperCase();
    const dupe = groups.find((g) => g.code.toUpperCase() === codeUpper && g.id !== editing?.id);
    if (dupe) { toast.error(`Code "${codeUpper}" already used by ${dupe.name}`); return; }
    if (editing) {
      updateGroup(editing.id, {
        name: form.name.trim(),
        code: codeUpper,
        description: form.description.trim() || undefined,
        active: form.active,
      });
      toast.success("Course group updated");
    } else {
      addGroup({
        name: form.name.trim(),
        code: codeUpper,
        description: form.description.trim() || undefined,
        active: form.active,
      });
      toast.success("Course group added");
    }
    setShowModal(false);
  };

  const handleDelete = (g: CourseGroup) => {
    const count = countByGroup.get(g.id) ?? 0;
    const msg = count > 0
      ? `Delete "${g.name}"? ${count} student${count === 1 ? " is" : "s are"} currently in this group — they'll keep their class but lose this group label.`
      : `Delete "${g.name}"?`;
    if (confirm(msg)) {
      deleteGroup(g.id);
      toast.success("Course group deleted");
    }
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">🎓 Course Groups</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              Tracks or cohorts that cut across classes. Students stay in their main class but inherit a course group for elective routing, scholarship tracking, or specialty cohorts.
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={openNew}>+ New course group</button>
        </header>

        <input
          className="input max-w-sm"
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
              No course groups {search ? "match your search" : "yet"}.
            </div>
          )}
          {filtered.map((g) => {
            const count = countByGroup.get(g.id) ?? 0;
            return (
              <div key={g.id} className="rounded-xl border glass p-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{g.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{g.code}</span>
                    {!g.active && <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">inactive</span>}
                  </div>
                  {g.description && <p className="text-sm text-gray-600 mt-1">{g.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{count} student{count === 1 ? "" : "s"} in this group</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary text-sm" onClick={() => openEdit(g)}>Edit</button>
                  <button type="button" className="text-sm text-red-500 hover:text-red-700 self-center" onClick={() => handleDelete(g)}>Delete</button>
                </div>
              </div>
            );
          })}
        </section>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-5 border-b">
                <h2 className="font-bold text-lg">{editing ? "Edit course group" : "New course group"}</h2>
              </div>
              <div className="p-5 space-y-3">
                <Field label="Name">
                  <input className="input" placeholder='e.g. "Science Track"' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Code">
                  <input className="input font-mono" placeholder="e.g. SCI" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                </Field>
                <Field label="Description (optional)">
                  <textarea className="input" rows={2} placeholder="What is this group for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Field>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <span className="text-sm">Active (visible when admitting students)</span>
                </label>
              </div>
              <div className="p-5 border-t flex gap-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn-gold" onClick={handleSave}>{editing ? "Save changes" : "Create group"}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-gold { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-gold:hover { background: #2c1a73; }
          .btn-secondary { background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
        `}</style>
      </div>
    </DashboardShell>
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
