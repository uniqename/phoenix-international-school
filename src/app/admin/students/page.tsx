"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES, LEVEL_NAMES } from "@/lib/utils";
import type { Student, StudentLevel, BloodGroup } from "@/lib/types";
import toast from "react-hot-toast";


const LEVELS: StudentLevel[] = ["creche","nursery","kg","primary","jhs"];
const BLOOD_GROUPS: BloodGroup[] = ['unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'];

const blank = (): Omit<Student,"id"|"created_at"|"fee_status"> => ({
  student_id: "", full_name: "", other_names: "", gender: "male", level: "primary",
  class_name: "Primary 1", dob: "", parent_name: "", parent_phone: "",
  category: "new", course_group_id: undefined,
  blood_group: 'unknown', nhis_no: "", gps_address: "", residential_city: "",
  nationality: "Ghanaian", address: "", mobile_no: "", email: "",
  can_receive_sms: true, can_receive_email: true,
  previous_school: "", previous_class: "",
});

type AdmissionTab = "details" | "previous" | "general";

export default function StudentsPage() {
  const students       = useAppStore((s) => s.students);
  const addStudent     = useAppStore((s) => s.addStudent);
  const updateStudent  = useAppStore((s) => s.updateStudent);
  const deleteStudent  = useAppStore((s) => s.deleteStudent);
  const courseGroups   = useAppStore((s) => s.courseGroups);
  const nextAdmissionNumber = useAppStore((s) => s.nextAdmissionNumber);

  const [search, setSearch]         = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Student | null>(null);
  const [form, setForm]             = useState(blank());
  const [viewing, setViewing]       = useState<Student | null>(null);
  const [tab, setTab]               = useState<AdmissionTab>("details");

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blank(), student_id: nextAdmissionNumber() });
    setTab("details");
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      student_id: s.student_id,
      full_name: s.full_name,
      other_names: s.other_names ?? "",
      gender: s.gender ?? "male",
      level: s.level,
      class_name: s.class_name,
      dob: s.dob ?? "",
      parent_name: s.parent_name ?? "",
      parent_phone: s.parent_phone ?? "",
      category: s.category ?? "new",
      family_id: s.family_id,
      course_group_id: s.course_group_id,
      blood_group: s.blood_group ?? "unknown",
      nhis_no: s.nhis_no ?? "",
      gps_address: s.gps_address ?? "",
      residential_city: s.residential_city ?? "",
      nationality: s.nationality ?? "Ghanaian",
      address: s.address ?? "",
      mobile_no: s.mobile_no ?? "",
      email: s.email ?? "",
      can_receive_sms: s.can_receive_sms ?? true,
      can_receive_email: s.can_receive_email ?? true,
      previous_school: s.previous_school ?? "",
      previous_class: s.previous_class ?? "",
    });
    setTab("details");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (!editing) {
      // On a new admission, enforce admission # uniqueness in case admin edited it manually
      const id = (form.student_id || nextAdmissionNumber()).trim();
      const dupe = students.find((s) => s.student_id === id);
      if (dupe) {
        toast.error(`Admission number ${id} already in use by ${dupe.full_name}`);
        return;
      }
      addStudent({ ...form, student_id: id, fee_status: "outstanding" });
      toast.success(`Student admitted as ${id}`);
    } else {
      updateStudent(editing.id, form);
      toast.success("Student updated");
    }
    setShowModal(false);
  };

  const handleDelete = (s: Student) => {
    if (!confirm(`Delete ${s.full_name}? This cannot be undone.`)) return;
    deleteStudent(s.id);
    toast.success("Student removed");
  };

  const statusStyle = (status: Student["fee_status"]) => {
    if (status === "cleared")     return { bg: "rgba(34,197,94,0.1)",  color: "#22c55e" };
    if (status === "partial")     return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    return                               { bg: "rgba(239,68,68,0.1)",  color: "#ef4444" };
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h2 className="text-xl font-black text-white">Students ({students.length})</h2>
        <button type="button" onClick={openAdd} className="btn-gold text-xs py-2 px-5">+ Add Student</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ID…"
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
          <option value="all">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_NAMES[l]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#0A1628" }}>
              <tr className="text-xs text-blue-300 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-semibold">Student</th>
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Parent</th>
                <th className="text-left px-4 py-3 font-semibold">Fees</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const st = statusStyle(s.fee_status);
                return (
                  <tr key={s.id} className="table-row border-t border-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{s.full_name}</div>
                      <div className="text-xs text-gray-400">{s.gender} · {s.dob ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.student_id}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                        {s.class_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-700 font-medium">{s.parent_name ?? "—"}</div>
                      <div className="text-xs text-gray-400">{s.parent_phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                        style={{ background: st.bg, color: st.color }}>
                        {s.fee_status === "cleared" ? "✅ Cleared" : s.fee_status === "partial" ? "⏳ Partial" : "🔒 Outstanding"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setViewing(s)}
                          className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                          View
                        </button>
                        <button type="button" onClick={() => openEdit(s)}
                          className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(s)}
                          className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal — 3-tab admission form mirroring doc */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-3 border-b">
              <h3 className="font-black text-gray-900 text-lg">{editing ? "Edit Student" : "Student Admission"}</h3>
              {!editing && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Last admission no: <span className="font-mono">{nextAdmissionNumber().replace(/(\d+)$/, (m) => String(parseInt(m, 10) - 1))}</span> · Next: <span className="font-mono font-semibold">{form.student_id}</span>
                </p>
              )}
              <div className="flex gap-1 mt-3 border-b -mb-3">
                {(["details","previous","general"] as AdmissionTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`text-sm px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {t === "details" ? "Student Details" : t === "previous" ? "Guardian & Previous Education" : "General Information"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Basic Info</h4>
                    <Field label="Full Name *">
                      <input className="input" placeholder="e.g. Kwame Asante Jr." value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </Field>
                    <Field label="Other Names">
                      <input className="input" placeholder="Middle / other names" value={form.other_names ?? ""} onChange={(e) => setForm({ ...form, other_names: e.target.value })} />
                    </Field>
                    <Field label="Date of Birth">
                      <input className="input" type="date" value={form.dob ?? ""} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                    </Field>
                    <Field label="Gender">
                      <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </Field>
                    <Field label="Blood Group">
                      <select className="input" value={form.blood_group ?? "unknown"} onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup })}>
                        {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Admission</h4>
                    <Field label="Admission Number *">
                      <input className="input font-mono" placeholder="PIS001" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} disabled={!!editing} />
                      {!editing && (
                        <button type="button" className="text-xs text-indigo-600 hover:underline mt-1" onClick={() => setForm({ ...form, student_id: nextAdmissionNumber() })}>
                          Reset to auto-generated
                        </button>
                      )}
                    </Field>
                    <Field label="Level">
                      <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as StudentLevel })}>
                        {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_NAMES[l]}</option>)}
                      </select>
                    </Field>
                    <Field label="Class / Batch">
                      <select className="input" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })}>
                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Course Group">
                      <select className="input" value={form.course_group_id ?? ""} onChange={(e) => setForm({ ...form, course_group_id: e.target.value || undefined })}>
                        <option value="">— none —</option>
                        {courseGroups.filter((g) => g.active).map((g) => <option key={g.id} value={g.id}>{g.name} ({g.code})</option>)}
                      </select>
                    </Field>
                    <Field label="Student Category">
                      <select className="input" value={form.category ?? "new"} onChange={(e) => setForm({ ...form, category: e.target.value as "new" | "continuing" })}>
                        <option value="new">New Student</option>
                        <option value="continuing">Continuing Student</option>
                      </select>
                    </Field>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Contact</h4>
                    <Field label="Nationality">
                      <input className="input" value={form.nationality ?? ""} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                    </Field>
                    <Field label="Residential City">
                      <input className="input" placeholder="e.g. Accra" value={form.residential_city ?? ""} onChange={(e) => setForm({ ...form, residential_city: e.target.value })} />
                    </Field>
                    <Field label="GPS Address">
                      <input className="input" placeholder="e.g. GA-123-4567" value={form.gps_address ?? ""} onChange={(e) => setForm({ ...form, gps_address: e.target.value })} />
                    </Field>
                    <Field label="NHIS No.">
                      <input className="input" value={form.nhis_no ?? ""} onChange={(e) => setForm({ ...form, nhis_no: e.target.value })} />
                    </Field>
                    <Field label="Address">
                      <textarea className="input" rows={2} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </Field>
                    <Field label="Mobile No.">
                      <input className="input" placeholder="0244000000" value={form.mobile_no ?? ""} onChange={(e) => setForm({ ...form, mobile_no: e.target.value })} />
                    </Field>
                    <Field label="Email">
                      <input className="input" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </Field>
                    <div className="flex gap-4 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" className="w-4 h-4" checked={form.can_receive_sms ?? true} onChange={(e) => setForm({ ...form, can_receive_sms: e.target.checked })} />
                        Can Receive SMS
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" className="w-4 h-4" checked={form.can_receive_email ?? true} onChange={(e) => setForm({ ...form, can_receive_email: e.target.checked })} />
                        Can Receive Email
                      </label>
                    </div>
                  </section>
                </div>
              )}

              {tab === "previous" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <Field label="Primary Guardian Name (quick-add)">
                    <input className="input" placeholder="Mr. / Mrs. ..." value={form.parent_name ?? ""} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
                    <p className="text-xs text-gray-500 mt-1">
                      For a full guardian record (relationship, occupation, emergency contact, multi-student links), use the <span className="font-medium">Guardians</span> page after admitting.
                    </p>
                  </Field>
                  <Field label="Primary Guardian Phone">
                    <input className="input" type="tel" placeholder="0244000000" value={form.parent_phone ?? ""} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} />
                  </Field>
                  <Field label="Previous School (for new admissions)">
                    <input className="input" value={form.previous_school ?? ""} onChange={(e) => setForm({ ...form, previous_school: e.target.value })} />
                  </Field>
                  <Field label="Previous Class">
                    <input className="input" placeholder="e.g. Class 4" value={form.previous_class ?? ""} onChange={(e) => setForm({ ...form, previous_class: e.target.value })} />
                  </Field>
                </div>
              )}

              {tab === "general" && (
                <div className="space-y-3 max-w-xl">
                  <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">📸 Photo upload</p>
                    <p className="text-xs">Photo upload requires a server-side storage bucket (Supabase Storage or Cloudflare R2). Will be wired in a future phase. For now, leave blank — student avatars fall back to initials.</p>
                  </div>
                  <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">🆔 Birth certificate / supporting docs</p>
                    <p className="text-xs">Document attachments queued for the same storage-bucket phase.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 bg-white">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="btn-gold px-6 py-2.5">
                {editing ? "Update Student" : "Admit Student"}
              </button>
            </div>
          </div>
          <style jsx>{`
            .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.9rem; }
            .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
            .input:disabled { background: #f3f4f6; color: #6b7280; }
          `}</style>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ background: "rgba(0,48,135,0.08)" }}>
                {viewing.gender === "female" ? "👧" : "👦"}
              </div>
              <h3 className="font-black text-gray-900 text-lg">{viewing.full_name}</h3>
              <p className="text-xs text-gray-400 font-mono">{viewing.student_id}</p>
            </div>
            {[
              ["Class", viewing.class_name], ["Level", LEVEL_NAMES[viewing.level]],
              ["Date of Birth", viewing.dob ?? "—"], ["Gender", viewing.gender ?? "—"],
              ["Parent", viewing.parent_name ?? "—"], ["Parent Phone", viewing.parent_phone ?? "—"],
              ["Fee Status", viewing.fee_status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                <span className="text-gray-500 font-medium">{k}</span>
                <span className="font-bold text-gray-900 capitalize">{v}</span>
              </div>
            ))}
            <button type="button" onClick={() => setViewing(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 text-sm font-bold text-gray-700">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
