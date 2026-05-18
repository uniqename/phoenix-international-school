"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Employee, EmploymentStatus, PermissionKey } from "@/lib/types";
import { PERMISSION_TEMPLATES, PERMISSION_LABELS } from "@/lib/mockData";
import toast from "react-hot-toast";

type Tab = "details" | "roles";

type Form = {
  employee_id: string;
  full_name: string;
  other_names: string;
  email: string;
  phone: string;
  alt_phone: string;
  emergency_contact: string;
  gender: "male" | "female";
  dob: string;
  ssn: string;
  nationality: string;
  residential_city: string;
  address: string;
  category_id: string;
  department_id: string;
  position_id: string;
  supervisor_id: string;
  qualification: string;
  date_of_employment: string;
  status: EmploymentStatus;
  class_ids: string[];
  subject_ids: string[];
  permissions: PermissionKey[];
  is_principal: boolean;
};

const blankForm = (employee_id: string): Form => ({
  employee_id,
  full_name: "",
  other_names: "",
  email: "",
  phone: "",
  alt_phone: "",
  emergency_contact: "",
  gender: "male",
  dob: "",
  ssn: "",
  nationality: "Ghanaian",
  residential_city: "",
  address: "",
  category_id: "",
  department_id: "",
  position_id: "",
  supervisor_id: "",
  qualification: "",
  date_of_employment: new Date().toISOString().slice(0, 10),
  status: "active",
  class_ids: [],
  subject_ids: [],
  permissions: [],
  is_principal: false,
});

export default function EmployeesPage() {
  const employees = useAppStore((s) => s.employees);
  const categories = useAppStore((s) => s.employeeCategories);
  const departments = useAppStore((s) => s.employeeDepartments);
  const positions = useAppStore((s) => s.employeePositions);
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const upsertEmployee = useAppStore((s) => s.upsertEmployee);
  const deleteEmployee = useAppStore((s) => s.deleteEmployee);
  const nextEmployeeId = useAppStore((s) => s.nextEmployeeId);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState<Form>(blankForm("PSS061"));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (deptFilter && e.department_id !== deptFilter) return false;
      if (!q) return true;
      return e.full_name.toLowerCase().includes(q)
        || e.employee_id.toLowerCase().includes(q)
        || (e.email ?? "").toLowerCase().includes(q);
    });
  }, [employees, search, deptFilter]);

  const openNew = () => {
    setEditing(null);
    setForm(blankForm(nextEmployeeId()));
    setTab("details");
    setShowModal(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      employee_id: e.employee_id,
      full_name: e.full_name,
      other_names: e.other_names ?? "",
      email: e.email ?? "",
      phone: e.phone ?? "",
      alt_phone: e.alt_phone ?? "",
      emergency_contact: e.emergency_contact ?? "",
      gender: (e.gender ?? "male") as "male" | "female",
      dob: e.dob ?? "",
      ssn: e.ssn ?? "",
      nationality: e.nationality ?? "Ghanaian",
      residential_city: e.residential_city ?? "",
      address: e.address ?? "",
      category_id: e.category_id ?? "",
      department_id: e.department_id ?? "",
      position_id: e.position_id ?? "",
      supervisor_id: e.supervisor_id ?? "",
      qualification: e.qualification ?? "",
      date_of_employment: e.date_of_employment,
      status: e.status,
      class_ids: e.class_ids ?? [],
      subject_ids: e.subject_ids ?? [],
      permissions: e.permissions,
      is_principal: e.is_principal,
    });
    setTab("details");
    setShowModal(true);
  };

  const onSave = () => {
    if (!form.full_name.trim()) { toast.error("Full name required"); return; }
    if (!form.employee_id.trim()) { toast.error("Employee ID required"); return; }
    if (!editing) {
      const dupe = employees.find((e) => e.employee_id === form.employee_id);
      if (dupe) { toast.error(`Employee ID ${form.employee_id} already in use`); return; }
    }
    upsertEmployee({
      id: editing?.id,
      ...form,
      full_name: form.full_name.trim(),
      other_names: form.other_names.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      alt_phone: form.alt_phone.trim() || undefined,
      emergency_contact: form.emergency_contact.trim() || undefined,
      ssn: form.ssn.trim() || undefined,
      nationality: form.nationality.trim() || undefined,
      residential_city: form.residential_city.trim() || undefined,
      address: form.address.trim() || undefined,
      qualification: form.qualification.trim() || undefined,
      category_id: form.category_id || undefined,
      department_id: form.department_id || undefined,
      position_id: form.position_id || undefined,
      supervisor_id: form.supervisor_id || undefined,
    });
    toast.success(editing ? "Employee updated" : `${form.full_name.trim()} admitted as ${form.employee_id}`);
    setShowModal(false);
  };

  const applyTemplate = (templateKey: string) => {
    const t = PERMISSION_TEMPLATES[templateKey];
    if (!t) return;
    setForm((p) => ({ ...p, permissions: t.permissions, is_principal: templateKey === "principal" }));
    toast.success(`${t.emoji} ${t.label} permissions applied`);
  };

  const togglePermission = (perm: PermissionKey) => {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter((x) => x !== perm)
        : [...p.permissions, perm],
    }));
  };

  // Group permissions for the matrix UI
  const permissionsByGroup = useMemo(() => {
    const map = new Map<string, PermissionKey[]>();
    for (const [key, meta] of Object.entries(PERMISSION_LABELS)) {
      const arr = map.get(meta.group) ?? [];
      arr.push(key as PermissionKey);
      map.set(meta.group, arr);
    }
    return Array.from(map.entries());
  }, []);

  const statusBadge = (status: EmploymentStatus) => {
    const map: Record<EmploymentStatus, { bg: string; fg: string; emoji: string }> = {
      active:     { bg: "rgba(34,197,94,0.1)",  fg: "#16a34a", emoji: "✅" },
      on_leave:   { bg: "rgba(245,158,11,0.1)", fg: "#a16207", emoji: "🏖️" },
      suspended:  { bg: "rgba(239,68,68,0.1)",  fg: "#b91c1c", emoji: "⏸️" },
      terminated: { bg: "rgba(0,0,0,0.05)",     fg: "#374151", emoji: "🚪" },
    };
    const v = map[status];
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: v.bg, color: v.fg }}>{v.emoji} {status.replace("_", " ")}</span>;
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">🧑‍💼 Employees</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              Admit staff, assign them to departments + positions, and grant fine-grained permissions. The 30+ permission matrix replaces the flat &ldquo;admin / teacher&rdquo; role system.
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={openNew}>+ Admit an Employee</button>
        </header>

        <div className="flex gap-2 flex-wrap">
          <input className="input max-w-sm" placeholder="Search by name, ID, or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input max-w-[200px]" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
              <p className="text-3xl mb-2">🧑‍💼</p>
              {employees.length === 0 ? (
                <>
                  <p className="font-bold">No employees yet — admit the first one.</p>
                  <p className="text-xs mt-1">Start with the Principal so they can grant permissions to others.</p>
                  <button type="button" className="btn-gold mt-3" onClick={openNew}>+ Admit Employee</button>
                </>
              ) : (
                <p>No employees match your filter.</p>
              )}
            </div>
          )}
          {filtered.map((e) => {
            const dept = departments.find((d) => d.id === e.department_id);
            const pos = positions.find((p) => p.id === e.position_id);
            const cat = categories.find((c) => c.id === e.category_id);
            return (
              <div key={e.id} className="glass rounded-2xl p-4 flex flex-wrap items-start justify-between gap-3 card-hover">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                    {e.is_principal ? "👔" : "🧑‍💼"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-black text-gray-900">{e.full_name}</h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{e.employee_id}</span>
                      {statusBadge(e.status)}
                      {e.is_principal && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.15)", color: "#a16207" }}>👔 Principal</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      {pos && <span>💼 {pos.name}</span>}
                      {dept && <span>🏛️ {dept.name}</span>}
                      {cat && <span>🏷️ {cat.name}</span>}
                      {e.phone && <span>📞 {e.phone}</span>}
                      {e.email && <span>✉️ {e.email}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{e.permissions.length} permission{e.permissions.length === 1 ? "" : "s"} granted</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(26,63,160,0.1)", color: "#1A3FA0" }} onClick={() => openEdit(e)}>Edit</button>
                  <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }} onClick={() => {
                    if (confirm(`Delete ${e.full_name}?`)) deleteEmployee(e.id);
                  }}>Delete</button>
                </div>
              </div>
            );
          })}
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,10,30,0.7)" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 pt-5 pb-3 border-b">
                <h2 className="font-black text-lg text-gray-900">{editing ? "Edit Employee" : "Admit an Employee"}</h2>
                {!editing && <p className="text-xs text-gray-500 mt-0.5">Next employee ID: <span className="font-mono font-semibold">{form.employee_id}</span></p>}
                <div className="flex gap-1 mt-3 border-b -mb-3">
                  {(["details", "roles"] as Tab[]).map((t) => (
                    <button key={t} type="button" onClick={() => setTab(t)}
                      className={`text-sm px-4 py-2 font-medium border-b-2 -mb-px ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      {t === "details" ? "Employee Details" : "Batches & Subjects & Roles"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {tab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <section className="space-y-3">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Basic Info</h4>
                      <Field label="Full name *"><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
                      <Field label="Other names"><input className="input" value={form.other_names} onChange={(e) => setForm({ ...form, other_names: e.target.value })} /></Field>
                      <Field label="Gender">
                        <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}>
                          <option value="male">Male</option><option value="female">Female</option>
                        </select>
                      </Field>
                      <Field label="DOB"><input className="input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                      <Field label="SSNIT no."><input className="input" value={form.ssn} onChange={(e) => setForm({ ...form, ssn: e.target.value })} /></Field>
                    </section>
                    <section className="space-y-3">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Admission</h4>
                      <Field label="Employee ID *">
                        <input className="input font-mono" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} disabled={!!editing} />
                      </Field>
                      <Field label="Date of employment">
                        <input className="input" type="date" value={form.date_of_employment} onChange={(e) => setForm({ ...form, date_of_employment: e.target.value })} />
                      </Field>
                      <Field label="Department">
                        <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                          <option value="">—</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Category">
                        <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                          <option value="">—</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Position">
                        <select className="input" value={form.position_id} onChange={(e) => setForm({ ...form, position_id: e.target.value })}>
                          <option value="">—</option>
                          {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Supervisor">
                        <select className="input" value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}>
                          <option value="">—</option>
                          {employees.filter((x) => x.id !== editing?.id).map((x) => <option key={x.id} value={x.id}>{x.full_name}</option>)}
                        </select>
                      </Field>
                      <Field label="Qualification"><input className="input" placeholder="e.g. B.Ed Mathematics" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Field>
                      <Field label="Status">
                        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmploymentStatus })}>
                          <option value="active">Active</option>
                          <option value="on_leave">On leave</option>
                          <option value="suspended">Suspended</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </Field>
                    </section>
                    <section className="space-y-3">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Contact</h4>
                      <Field label="Nationality"><input className="input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></Field>
                      <Field label="Residential city"><input className="input" value={form.residential_city} onChange={(e) => setForm({ ...form, residential_city: e.target.value })} /></Field>
                      <Field label="Address"><textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                      <Field label="Mobile"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                      <Field label="Alt phone"><input className="input" value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} /></Field>
                      <Field label="Email"><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                      <Field label="Emergency contact"><input className="input" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} /></Field>
                    </section>
                  </div>
                )}

                {tab === "roles" && (
                  <div className="space-y-5">
                    <section>
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Assignments</h4>
                      <p className="text-xs text-gray-500 mb-2">Classes / batches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {classes.sort((a, b) => a.order - b.order).map((c) => {
                          const active = form.class_ids.includes(c.id);
                          return (
                            <button key={c.id} type="button" onClick={() => setForm((p) => ({ ...p, class_ids: active ? p.class_ids.filter((x) => x !== c.id) : [...p.class_ids, c.id] }))}
                              className="text-xs px-3 py-1 rounded-full font-bold"
                              style={{ background: active ? "rgba(26,63,160,0.15)" : "rgba(0,0,0,0.04)", color: active ? "#1A3FA0" : "#6b7280" }}>
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mb-2 mt-3">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map((s) => {
                          const active = form.subject_ids.includes(s.id);
                          return (
                            <button key={s.id} type="button" onClick={() => setForm((p) => ({ ...p, subject_ids: active ? p.subject_ids.filter((x) => x !== s.id) : [...p.subject_ids, s.id] }))}
                              className="text-xs px-3 py-1 rounded-full font-bold"
                              style={{ background: active ? "rgba(107,33,168,0.15)" : "rgba(0,0,0,0.04)", color: active ? "#6B21A8" : "#6b7280" }}>
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Quick-apply role template</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PERMISSION_TEMPLATES).map(([k, t]) => (
                          <button key={k} type="button" onClick={() => applyTemplate(k)}
                            className="text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                            {t.emoji} {t.label}
                          </button>
                        ))}
                        <button type="button" onClick={() => setForm((p) => ({ ...p, permissions: [], is_principal: false }))}
                          className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                          Clear all
                        </button>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm mt-3">
                        <input type="checkbox" className="w-4 h-4" checked={form.is_principal} onChange={(e) => setForm({ ...form, is_principal: e.target.checked })} />
                        <span className="font-bold">👔 This person is the Principal</span>
                      </label>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Permission matrix · {form.permissions.length} granted</h4>
                      {permissionsByGroup.map(([group, perms]) => (
                        <div key={group} className="mb-3">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{group}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {perms.map((perm) => {
                              const active = form.permissions.includes(perm);
                              const meta = PERMISSION_LABELS[perm];
                              return (
                                <button key={perm} type="button" onClick={() => togglePermission(perm)}
                                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-left flex items-center gap-2"
                                  style={{ background: active ? "rgba(34,197,94,0.12)" : "rgba(0,0,0,0.04)", color: active ? "#15803d" : "#6b7280", border: active ? "1px solid rgba(34,197,94,0.4)" : "1px solid transparent" }}>
                                  <span>{active ? "✅" : "○"}</span>
                                  <span className="flex-1">{meta.emoji} {meta.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </section>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded-full font-bold text-sm border border-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn-gold" onClick={onSave}>{editing ? "Save changes" : "Admit Employee"}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .input:disabled { background: #f3f4f6; color: #6b7280; }
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
