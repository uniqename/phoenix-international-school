"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type {
  AssessmentTemplate, AssessmentMarkerScale, AssessmentScope, ClassDef,
} from "@/lib/types";
import toast from "react-hot-toast";

const SCALE_LABEL: Record<AssessmentMarkerScale, string> = {
  abcd: "A / B / C / D",
  percent: "Percent (0–100)",
  letter5: "A+ / A / B / C / D",
  narrative: "Narrative only",
};

const SCOPE_LABEL: Record<AssessmentScope, string> = {
  admission: "Admission",
  term: "End of Term",
  "mid-term": "Mid-Term",
  project: "Project",
};

const blankTemplate = (classId: string): Omit<AssessmentTemplate, "id" | "created_at"> => ({
  class_id: classId,
  name: "",
  scope: "term",
  scale: "abcd",
  markers: [],
  description: "",
  active: true,
});

export default function AssessmentsPage() {
  const classes = useAppStore((s) => s.classes);
  const templates = useAppStore((s) => s.assessmentTemplates);
  const upsertTemplate = useAppStore((s) => s.upsertAssessmentTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteAssessmentTemplate);
  const addMarker = useAppStore((s) => s.addMarker);
  const updateMarker = useAppStore((s) => s.updateMarker);
  const removeMarker = useAppStore((s) => s.removeMarker);

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id ?? "");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AssessmentTemplate | null>(null);
  const [form, setForm] = useState(blankTemplate(selectedClassId));
  const [newMarker, setNewMarker] = useState({ name: "", description: "" });
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const classTemplates = useMemo(
    () => templates.filter((t) => t.class_id === selectedClassId),
    [templates, selectedClassId],
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const openNew = () => {
    setEditing(null);
    setForm(blankTemplate(selectedClassId));
    setShowForm(true);
  };

  const openEdit = (t: AssessmentTemplate) => {
    setEditing(t);
    setForm({
      class_id: t.class_id,
      name: t.name,
      scope: t.scope,
      scale: t.scale,
      markers: t.markers,
      description: t.description ?? "",
      active: t.active,
    });
    setShowForm(true);
  };

  const saveTemplate = () => {
    if (!form.name.trim()) { toast.error("Template name is required"); return; }
    upsertTemplate({ id: editing?.id, ...form });
    toast.success(editing ? "Template updated" : "Template created");
    setShowForm(false);
  };

  const onAddMarker = (templateId: string) => {
    if (!newMarker.name.trim()) { toast.error("Marker name is required"); return; }
    const template = templates.find((t) => t.id === templateId);
    const nextOrder = (template?.markers.length ?? 0) + 1;
    addMarker(templateId, {
      name: newMarker.name.trim(),
      description: newMarker.description.trim() || undefined,
      order: nextOrder,
    });
    setNewMarker({ name: "", description: "" });
    toast.success("Marker added");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Assessments</h1>
            <p className="text-sm text-gray-500">
              Each class has its own assessment template. Add markers, scored A–D (or your chosen scale). Teachers fill these in for each student per term; reports auto-generate.
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={openNew}>+ New template</button>
        </header>

        {/* Class picker */}
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Class</p>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => {
              const count = templates.filter((t) => t.class_id === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClassId(c.id)}
                  className={`text-sm px-3 py-1.5 rounded-full border ${selectedClassId === c.id ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"}`}
                >
                  {c.name} {count > 0 && <span className="opacity-70">· {count}</span>}
                </button>
              );
            })}
          </div>
          {selectedClass && (
            <p className="text-xs text-gray-400 mt-2">
              {classTemplates.length} template{classTemplates.length === 1 ? "" : "s"} for {selectedClass.name}
            </p>
          )}
        </div>

        {/* Template list for selected class */}
        <section className="space-y-3">
          {classTemplates.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
              No templates yet for {selectedClass?.name}. Click <span className="font-medium">+ New template</span> to create one.
              For preschool admission, try the example from the principal: <em>&quot;Can child read&quot;</em>, <em>&quot;Can child recognize numbers&quot;</em>, etc.
            </div>
          )}
          {classTemplates.map((t) => (
            <div key={t.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-xs text-gray-500">
                    {SCOPE_LABEL[t.scope]} · {SCALE_LABEL[t.scale]} · {t.markers.length} marker{t.markers.length === 1 ? "" : "s"}
                    {!t.active && <span className="ml-2 text-amber-600 font-medium">· inactive</span>}
                  </p>
                  {t.description && <p className="text-xs text-gray-600 mt-1">{t.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary text-sm" onClick={() => openEdit(t)}>Edit settings</button>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={() => setEditingTemplate(editingTemplate === t.id ? null : t.id)}
                  >
                    {editingTemplate === t.id ? "Hide markers" : "Edit markers"}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-500 hover:text-red-700 self-center"
                    onClick={() => {
                      if (confirm(`Delete template "${t.name}"? All scores using it will also be removed.`)) {
                        deleteTemplate(t.id);
                        toast.success("Template deleted");
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingTemplate === t.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Markers</p>
                  <ul className="divide-y">
                    {t.markers
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((m) => (
                        <li key={m.id} className="py-2 flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <input
                              className="input font-medium"
                              value={m.name}
                              onChange={(e) => updateMarker(t.id, m.id, { name: e.target.value })}
                            />
                            <input
                              className="input text-xs mt-1"
                              placeholder="Description / what to look for (optional)"
                              value={m.description ?? ""}
                              onChange={(e) => updateMarker(t.id, m.id, { description: e.target.value })}
                            />
                          </div>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:text-red-700 self-center"
                            onClick={() => {
                              if (confirm(`Remove marker "${m.name}"?`)) removeMarker(t.id, m.id);
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                  </ul>

                  <div className="pt-2 flex flex-col md:flex-row gap-2 items-stretch md:items-end">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">New marker</label>
                      <input
                        className="input"
                        placeholder='e.g. "Can child read simple words"'
                        value={newMarker.name}
                        onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Description (optional)</label>
                      <input
                        className="input"
                        placeholder='e.g. "Recognizes cat, mat, sun"'
                        value={newMarker.description}
                        onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                      />
                    </div>
                    <button type="button" className="btn-primary" onClick={() => onAddMarker(t.id)}>Add marker</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Template form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
              <div className="p-5 border-b">
                <h2 className="font-bold text-lg">{editing ? "Edit template settings" : "New assessment template"}</h2>
                <p className="text-xs text-gray-500 mt-0.5">For class: {classes.find((c) => c.id === form.class_id)?.name}</p>
              </div>
              <div className="p-5 space-y-3">
                <Field label="Template name">
                  <input className="input" placeholder='e.g. "End of Term 1 Report"' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Class">
                    <select className="input" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Scope">
                    <select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as AssessmentScope })}>
                      <option value="admission">Admission</option>
                      <option value="term">End of Term</option>
                      <option value="mid-term">Mid-Term</option>
                      <option value="project">Project</option>
                    </select>
                  </Field>
                </div>
                <Field label="Scoring scale">
                  <select className="input" value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value as AssessmentMarkerScale })}>
                    <option value="abcd">A / B / C / D</option>
                    <option value="percent">Percent (0–100)</option>
                    <option value="letter5">A+ / A / B / C / D</option>
                    <option value="narrative">Narrative only</option>
                  </select>
                </Field>
                <Field label="Description (optional)">
                  <textarea className="input" rows={2} placeholder="Short note for teachers grading this template" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Field>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <span className="text-sm">Active (visible to teachers in the gradebook)</span>
                </label>
              </div>
              <div className="p-5 border-t flex gap-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={saveTemplate}>{editing ? "Save changes" : "Create template"}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-primary { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-primary:hover { background: #2c1a73; }
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
