"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Family, Student } from "@/lib/types";
import toast from "react-hot-toast";

type FamilyForm = {
  family_name: string;
  primary_email: string;
  primary_phone: string;
  secondary_email: string;
  secondary_phone: string;
  child_ids: string[];
};

const blank = (): FamilyForm => ({
  family_name: "",
  primary_email: "",
  primary_phone: "",
  secondary_email: "",
  secondary_phone: "",
  child_ids: [],
});

export default function FamiliesPage() {
  const families = useAppStore((s) => s.families);
  const students = useAppStore((s) => s.students);
  const upsertFamily = useAppStore((s) => s.upsertFamily);
  const updateStudent = useAppStore((s) => s.updateStudent);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);
  const setOverride = useAppStore((s) => s.setFamilyDiscountOverride);
  const policy = useAppStore((s) => s.discountPolicy);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [form, setForm] = useState<FamilyForm>(blank());
  const [overrideOpen, setOverrideOpen] = useState<string | null>(null);
  const [overridePct, setOverridePct] = useState<string>("");
  const [overrideNote, setOverrideNote] = useState<string>("");

  const familyDetails = useMemo(() => {
    return families.map((f) => {
      const children = students.filter((s) => s.family_id === f.id);
      const autoPct = computeFamilyDiscount(f.id);
      return { family: f, children, autoPct };
    });
  }, [families, students, computeFamilyDiscount]);

  const filtered = familyDetails.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      d.family.family_name.toLowerCase().includes(q) ||
      d.family.primary_email?.toLowerCase().includes(q) ||
      d.family.primary_phone?.includes(q) ||
      d.children.some((c) => c.full_name.toLowerCase().includes(q))
    );
  });

  const unassigned = students.filter((s) => !s.family_id);

  const openNew = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };

  const openEdit = (fam: Family) => {
    setEditing(fam);
    setForm({
      family_name: fam.family_name,
      primary_email: fam.primary_email ?? "",
      primary_phone: fam.primary_phone ?? "",
      secondary_email: fam.secondary_email ?? "",
      secondary_phone: fam.secondary_phone ?? "",
      child_ids: students.filter((s) => s.family_id === fam.id).map((s) => s.id),
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.family_name.trim()) { toast.error("Family name is required"); return; }
    if (!form.primary_email.trim() && !form.primary_phone.trim()) {
      toast.error("Primary parent needs at least an email or phone");
      return;
    }

    const fam = upsertFamily({
      id: editing?.id,
      family_name: form.family_name.trim(),
      primary_email: form.primary_email.trim() || undefined,
      primary_phone: form.primary_phone.trim() || undefined,
      secondary_email: form.secondary_email.trim() || undefined,
      secondary_phone: form.secondary_phone.trim() || undefined,
      discount_override_percent: editing?.discount_override_percent,
      discount_override_note: editing?.discount_override_note,
    });

    const newSet = new Set(form.child_ids);
    students.forEach((s) => {
      if (newSet.has(s.id) && s.family_id !== fam.id) {
        updateStudent(s.id, { family_id: fam.id });
      } else if (!newSet.has(s.id) && s.family_id === fam.id) {
        updateStudent(s.id, { family_id: undefined });
      }
    });

    setShowModal(false);
    toast.success(editing ? "Family updated" : "Family created");
  };

  const handleApplyOverride = (familyId: string) => {
    if (!overridePct.trim()) {
      setOverride(familyId, undefined, undefined);
      toast.success("Override cleared — auto-calc restored");
    } else {
      const pct = Number(overridePct);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        toast.error("Percent must be 0–100");
        return;
      }
      setOverride(familyId, pct, overrideNote.trim() || undefined);
      toast.success(`Override set: ${pct}%`);
    }
    setOverrideOpen(null);
    setOverridePct("");
    setOverrideNote("");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Families</h1>
            <p className="text-sm text-gray-500">
              Group siblings into one family. Unlocks the sibling discount, dual-parent login, and one-view-of-the-whole-family in the parent app.
            </p>
          </div>
          <button className="btn-primary" onClick={openNew}>+ New family</button>
        </header>

        {unassigned.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <p className="font-medium">{unassigned.length} student{unassigned.length === 1 ? "" : "s"} not yet in a family.</p>
            <p className="text-xs mt-1">Click <span className="font-medium">+ New family</span> to group siblings, or <span className="font-medium">Edit</span> an existing family to add them.</p>
          </div>
        )}

        <input
          className="input max-w-md"
          placeholder="Search by family name, parent, or child"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
              No families {search ? "match your search" : "yet"}. Create one to start grouping siblings.
            </div>
          )}
          {filtered.map(({ family, children, autoPct }) => {
            const hasOverride = typeof family.discount_override_percent === "number";
            const effectivePct = hasOverride ? family.discount_override_percent! : autoPct;
            return (
              <div key={family.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{family.family_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Primary: {family.primary_email ?? "—"}
                      {family.primary_phone ? ` · ${family.primary_phone}` : ""}
                    </p>
                    {(family.secondary_email || family.secondary_phone) && (
                      <p className="text-xs text-gray-500">
                        Secondary: {family.secondary_email ?? "—"}
                        {family.secondary_phone ? ` · ${family.secondary_phone}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Effective discount</p>
                    <p className="text-2xl font-bold text-emerald-700">{effectivePct}%</p>
                    {hasOverride && (
                      <p className="text-xs text-amber-700">
                        admin override (auto would be {autoPct}%)
                      </p>
                    )}
                    {!hasOverride && policy.active && children.length >= 1 && (
                      <p className="text-xs text-gray-400">
                        from {children.length}-sibling tier
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Children ({children.length})
                  </p>
                  {children.length === 0 ? (
                    <p className="text-sm text-gray-400">No children linked yet — click Edit to add.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {children.map((c) => (
                        <li key={c.id} className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                          {c.full_name} <span className="opacity-60">· {c.class_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary text-sm" onClick={() => openEdit(family)}>Edit</button>
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => {
                      setOverrideOpen(family.id);
                      setOverridePct(hasOverride ? String(family.discount_override_percent) : "");
                      setOverrideNote(family.discount_override_note ?? "");
                    }}
                  >
                    {hasOverride ? "Edit override" : "Set discount override"}
                  </button>
                  {hasOverride && (
                    <button
                      className="text-xs text-red-500 self-center"
                      onClick={() => { setOverride(family.id, undefined, undefined); toast.success("Override cleared"); }}
                    >
                      Clear override
                    </button>
                  )}
                </div>

                {overrideOpen === family.id && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border space-y-2">
                    <p className="text-sm font-medium">Override discount for this family</p>
                    <p className="text-xs text-gray-500">Leave blank to restore the auto-calculated tier ({autoPct}%).</p>
                    <div className="flex gap-2 items-end">
                      <div>
                        <label className="text-xs text-gray-500">Percent</label>
                        <input className="input max-w-[100px]" type="number" min={0} max={100} value={overridePct} onChange={(e) => setOverridePct(e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Note (optional)</label>
                        <input className="input" placeholder="e.g. staff family" value={overrideNote} onChange={(e) => setOverrideNote(e.target.value)} />
                      </div>
                      <button className="btn-primary" onClick={() => handleApplyOverride(family.id)}>Apply</button>
                      <button className="btn-secondary" onClick={() => setOverrideOpen(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b sticky top-0 bg-white">
                <h2 className="font-bold text-lg">{editing ? "Edit family" : "New family"}</h2>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Family name">
                  <input className="input" placeholder="e.g. The Adjei Family" value={form.family_name} onChange={(e) => setForm({ ...form, family_name: e.target.value })} />
                </Field>

                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-sm font-medium">Primary parent</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Email">
                      <input className="input" type="email" placeholder="parent1@example.com" value={form.primary_email} onChange={(e) => setForm({ ...form, primary_email: e.target.value })} />
                    </Field>
                    <Field label="Phone">
                      <input className="input" type="tel" placeholder="0244000000" value={form.primary_phone} onChange={(e) => setForm({ ...form, primary_phone: e.target.value })} />
                    </Field>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Secondary parent <span className="font-normal text-xs text-gray-500">(optional — different email/phone for the second parent)</span></p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Email">
                      <input className="input" type="email" placeholder="parent2@example.com" value={form.secondary_email} onChange={(e) => setForm({ ...form, secondary_email: e.target.value })} />
                    </Field>
                    <Field label="Phone">
                      <input className="input" type="tel" placeholder="0244000000" value={form.secondary_phone} onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })} />
                    </Field>
                  </div>
                  <p className="text-xs text-gray-500">
                    Both parents log in separately and see the same children, fees, attendance, and reports. Invite link generation coming in Phase 2d.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Children in this family</p>
                  <p className="text-xs text-gray-500">Tick the students who belong to this family. They&apos;ll inherit the sibling discount automatically.</p>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                    {students.length === 0 && (
                      <p className="text-sm text-gray-400 p-2">No students yet — add students first.</p>
                    )}
                    {students.map((s) => {
                      const otherFamily = s.family_id && s.family_id !== editing?.id ? families.find((f) => f.id === s.family_id) : null;
                      return (
                        <label key={s.id} className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${otherFamily ? "opacity-60" : ""}`}>
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={form.child_ids.includes(s.id)}
                            disabled={!!otherFamily && !form.child_ids.includes(s.id)}
                            onChange={() => {
                              setForm((p) => ({
                                ...p,
                                child_ids: p.child_ids.includes(s.id)
                                  ? p.child_ids.filter((id) => id !== s.id)
                                  : [...p.child_ids, s.id],
                              }));
                            }}
                          />
                          <span className="flex-1 text-sm">{s.full_name}</span>
                          <span className="text-xs text-gray-400">{s.class_name}</span>
                          {otherFamily && <span className="text-xs text-amber-600">in {otherFamily.family_name}</span>}
                        </label>
                      );
                    })}
                  </div>
                  {form.child_ids.length > 0 && (
                    <p className="text-xs text-emerald-700">
                      With {form.child_ids.length} child{form.child_ids.length === 1 ? "" : "ren"}, this family would qualify for a {tierFor(form.child_ids.length, policy)}% discount under the current tier policy.
                    </p>
                  )}
                </div>
              </div>
              <div className="p-5 border-t flex gap-2 justify-end sticky bottom-0 bg-white">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>{editing ? "Update family" : "Create family"}</button>
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

function tierFor(siblings: number, policy: { tiers: { sibling_count: number; percent: number }[]; active: boolean }): number {
  if (!policy.active || siblings < 1) return 0;
  const tiers = [...policy.tiers].sort((a, b) => b.sibling_count - a.sibling_count);
  const tier = tiers.find((t) => siblings >= t.sibling_count);
  return tier?.percent ?? 0;
}
