"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Guardian, GuardianRelationship } from "@/lib/types";
import toast from "react-hot-toast";

type Form = {
  full_name: string;
  relationship: GuardianRelationship;
  phone: string;
  alt_phone: string;
  email: string;
  occupation: string;
  workplace: string;
  address: string;
  is_emergency_contact: boolean;
  can_pick_up_students: boolean;
  notes: string;
  student_ids: string[];
};

const RELATIONSHIPS: { value: GuardianRelationship; label: string; emoji: string }[] = [
  { value: "mother",       label: "Mother",       emoji: "👩" },
  { value: "father",       label: "Father",       emoji: "👨" },
  { value: "grandparent",  label: "Grandparent",  emoji: "👴" },
  { value: "aunt",         label: "Aunt",         emoji: "👩‍🦰" },
  { value: "uncle",        label: "Uncle",        emoji: "👨‍🦰" },
  { value: "sibling",      label: "Sibling",      emoji: "🧑" },
  { value: "driver",       label: "Driver",       emoji: "🚗" },
  { value: "nanny",        label: "Nanny",        emoji: "🧒" },
  { value: "guardian",     label: "Legal Guardian", emoji: "⚖️" },
  { value: "other",        label: "Other",        emoji: "🤝" },
];

const blank = (): Form => ({
  full_name: "",
  relationship: "guardian",
  phone: "",
  alt_phone: "",
  email: "",
  occupation: "",
  workplace: "",
  address: "",
  is_emergency_contact: true,
  can_pick_up_students: true,
  notes: "",
  student_ids: [],
});

export default function GuardiansPage() {
  const guardians = useAppStore((s) => s.guardians);
  const guardianLinks = useAppStore((s) => s.guardianLinks);
  const students = useAppStore((s) => s.students);
  const addGuardian = useAppStore((s) => s.addGuardian);
  const updateGuardian = useAppStore((s) => s.updateGuardian);
  const deleteGuardian = useAppStore((s) => s.deleteGuardian);
  const linkGuardian = useAppStore((s) => s.linkGuardianToStudent);
  const unlinkGuardian = useAppStore((s) => s.unlinkGuardianFromStudent);

  const [search, setSearch] = useState("");
  const [relFilter, setRelFilter] = useState<GuardianRelationship | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Guardian | null>(null);
  const [form, setForm] = useState<Form>(blank());

  const enriched = useMemo(() => guardians.map((g) => ({
    g,
    students: guardianLinks
      .filter((l) => l.guardian_id === g.id)
      .map((l) => ({ link: l, student: students.find((s) => s.id === l.student_id) }))
      .filter((x) => !!x.student),
  })), [guardians, guardianLinks, students]);

  const filtered = enriched.filter(({ g, students: linkedStudents }) => {
    if (relFilter !== "all" && g.relationship !== relFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return g.full_name.toLowerCase().includes(q)
      || g.phone?.includes(q)
      || g.email?.toLowerCase().includes(q)
      || linkedStudents.some((s) => s.student?.full_name.toLowerCase().includes(q));
  });

  const openNew = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };

  const openEdit = (g: Guardian) => {
    setEditing(g);
    setForm({
      full_name: g.full_name,
      relationship: g.relationship,
      phone: g.phone ?? "",
      alt_phone: g.alt_phone ?? "",
      email: g.email ?? "",
      occupation: g.occupation ?? "",
      workplace: g.workplace ?? "",
      address: g.address ?? "",
      is_emergency_contact: g.is_emergency_contact,
      can_pick_up_students: g.can_pick_up_students,
      notes: g.notes ?? "",
      student_ids: guardianLinks.filter((l) => l.guardian_id === g.id).map((l) => l.student_id),
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Phone or email is required so the school can reach this guardian");
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      relationship: form.relationship,
      phone: form.phone.trim() || undefined,
      alt_phone: form.alt_phone.trim() || undefined,
      email: form.email.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      workplace: form.workplace.trim() || undefined,
      address: form.address.trim() || undefined,
      is_emergency_contact: form.is_emergency_contact,
      can_pick_up_students: form.can_pick_up_students,
      notes: form.notes.trim() || undefined,
    };
    let guardianId: string;
    if (editing) {
      updateGuardian(editing.id, payload);
      guardianId = editing.id;
    } else {
      const created = addGuardian(payload);
      guardianId = created.id;
    }

    // Sync student links
    const existingLinks = guardianLinks.filter((l) => l.guardian_id === guardianId).map((l) => l.student_id);
    const want = new Set(form.student_ids);
    for (const sid of form.student_ids) {
      if (!existingLinks.includes(sid)) linkGuardian(guardianId, sid, false);
    }
    for (const sid of existingLinks) {
      if (!want.has(sid)) unlinkGuardian(guardianId, sid);
    }

    toast.success(editing ? "Guardian updated" : `${payload.full_name} added as guardian`);
    setShowModal(false);
  };

  const handleDelete = (g: Guardian) => {
    const links = guardianLinks.filter((l) => l.guardian_id === g.id).length;
    const msg = links > 0
      ? `Delete ${g.full_name}? They're currently linked to ${links} student${links === 1 ? "" : "s"} — links will be removed.`
      : `Delete ${g.full_name}?`;
    if (confirm(msg)) {
      deleteGuardian(g.id);
      toast.success("Guardian removed");
    }
  };

  const relMeta = (r: GuardianRelationship) => RELATIONSHIPS.find((x) => x.value === r) ?? RELATIONSHIPS[9];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">🧑‍🤝‍🧑 Guardians</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              People who can be contacted about a student or who can pick them up — parents, grandparents, drivers, nannies, legal guardians. One guardian can be linked to multiple unrelated students (e.g. a shared family driver).
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={openNew}>+ New guardian</button>
        </header>

        {/* Quick-filter pill row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setRelFilter("all")}
            className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{
              background: relFilter === "all" ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
              color: relFilter === "all" ? "white" : "rgba(196,181,253,0.8)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            All · {guardians.length}
          </button>
          {RELATIONSHIPS.map((r) => {
            const count = guardians.filter((g) => g.relationship === r.value).length;
            if (count === 0) return null;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRelFilter(r.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  background: relFilter === r.value ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                  color: relFilter === r.value ? "white" : "rgba(196,181,253,0.8)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {r.emoji} {r.label} · {count}
              </button>
            );
          })}
        </div>

        <input
          className="phx-input max-w-sm"
          placeholder="Search by name, phone, email, or student"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl border border-dashed p-8 text-center text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
              <p className="text-3xl mb-2">🧑‍🤝‍🧑</p>
              {search || relFilter !== "all" ? (
                <p>No guardians match your filter.</p>
              ) : (
                <>
                  <p className="font-semibold">No guardians yet — let&apos;s add one.</p>
                  <p className="text-xs mt-1">Parents, drivers, nannies, and emergency contacts all live here.</p>
                  <button type="button" className="btn-gold mt-3" onClick={openNew}>+ Add first guardian</button>
                </>
              )}
            </div>
          )}
          {filtered.map(({ g, students: linkedStudents }) => {
            const m = relMeta(g.relationship);
            return (
              <div key={g.id} className="glass rounded-2xl p-4 card-hover">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                      {m.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-black text-gray-900">{g.full_name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(107,33,168,0.1)", color: "#6B21A8" }}>
                          {m.label}
                        </span>
                        {g.is_emergency_contact && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            🚨 Emergency
                          </span>
                        )}
                        {g.can_pick_up_students && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                            ✅ Pick-up OK
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-2">
                        {g.phone && <span>📞 {g.phone}</span>}
                        {g.email && <span>✉️ {g.email}</span>}
                        {g.occupation && <span>· {g.occupation}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(26,63,160,0.1)", color: "#1A3FA0" }} onClick={() => openEdit(g)}>Edit</button>
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }} onClick={() => handleDelete(g)}>Delete</button>
                  </div>
                </div>

                {linkedStudents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Linked students ({linkedStudents.length})</p>
                    <ul className="flex flex-wrap gap-2">
                      {linkedStudents.map(({ student, link }) => (
                        <li key={link.id} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(168,85,247,0.08)", color: "#6B21A8" }}>
                          🎒 {student!.full_name} <span className="opacity-60">· {student!.class_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,10,30,0.7)" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 pt-5 pb-4 border-b sticky top-0 bg-white">
                <h2 className="font-black text-lg text-gray-900">{editing ? "Edit guardian" : "New guardian"}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Fill phone or email — both is best so we can reach them.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Full name *">
                    <input className="phx-input-light" placeholder="e.g. Mrs. Adjoa Mensah" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </Field>
                  <Field label="Relationship">
                    <select className="phx-input-light" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value as GuardianRelationship })}>
                      {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Phone">
                    <input className="phx-input-light" type="tel" placeholder="0244000000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Alt phone (optional)">
                    <input className="phx-input-light" type="tel" placeholder="Backup number" value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <input className="phx-input-light" type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <Field label="Address (optional)">
                    <input className="phx-input-light" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field>
                  <Field label="Occupation (optional)">
                    <input className="phx-input-light" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                  </Field>
                  <Field label="Workplace (optional)">
                    <input className="phx-input-light" value={form.workplace} onChange={(e) => setForm({ ...form, workplace: e.target.value })} />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4" checked={form.is_emergency_contact} onChange={(e) => setForm({ ...form, is_emergency_contact: e.target.checked })} />
                    🚨 Emergency contact
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4" checked={form.can_pick_up_students} onChange={(e) => setForm({ ...form, can_pick_up_students: e.target.checked })} />
                    ✅ Can pick up students
                  </label>
                </div>

                <Field label="Notes (optional)">
                  <textarea className="phx-input-light" rows={2} placeholder="Any extra context — special pickup instructions, custody notes, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Field>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1.5">Link to students</p>
                  <p className="text-xs text-gray-500 mb-2">Pick all students this guardian is responsible for. A driver can be linked to multiple unrelated kids.</p>
                  <div className="max-h-48 overflow-y-auto border rounded-xl p-2 bg-gray-50">
                    {students.length === 0 && <p className="text-sm text-gray-400 p-2">No students yet — admit one first, then come back.</p>}
                    {students.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={form.student_ids.includes(s.id)}
                          onChange={() => setForm((p) => ({
                            ...p,
                            student_ids: p.student_ids.includes(s.id)
                              ? p.student_ids.filter((x) => x !== s.id)
                              : [...p.student_ids, s.id],
                          }))}
                        />
                        <span className="flex-1">{s.full_name}</span>
                        <span className="text-xs text-gray-400">{s.class_name}</span>
                      </label>
                    ))}
                  </div>
                  {form.student_ids.length > 0 && (
                    <p className="text-xs text-emerald-700 mt-1.5 font-semibold">
                      ✅ Linking to {form.student_ids.length} student{form.student_ids.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-2 justify-end sticky bottom-0 bg-white">
                <button type="button" className="px-5 py-2 rounded-full font-bold text-sm border border-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn-gold" onClick={handleSave}>{editing ? "Save changes" : "Add guardian"}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .phx-input {
            width: 100%;
            padding: 0.6rem 0.85rem;
            border-radius: 0.75rem;
            background: rgba(255,255,255,0.08);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 0.95rem;
          }
          .phx-input::placeholder { color: rgba(255,255,255,0.4); }
          .phx-input:focus { outline: none; border-color: #A855F7; box-shadow: 0 0 0 3px rgba(168,85,247,0.25); }
          .phx-input-light {
            width: 100%;
            padding: 0.55rem 0.8rem;
            border-radius: 0.625rem;
            background: white;
            color: #111827;
            border: 1px solid #e5e7eb;
            font-size: 0.9rem;
          }
          .phx-input-light:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
