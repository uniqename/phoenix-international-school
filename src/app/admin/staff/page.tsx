"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES, SUBJECTS_BY_LEVEL, formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV = [
  { icon: "📊", label: "Overview",       href: "/admin" },
  { icon: "🎒", label: "Students",       href: "/admin/students" },
  { icon: "💳", label: "Fee Management", href: "/admin/fees" },
  { icon: "👩‍🏫", label: "Staff",         href: "/admin/staff" },
  { icon: "💼", label: "Payroll",         href: "/admin/payroll" },
  { icon: "📡", label: "Attendance",      href: "/admin/attendance" },
  { icon: "🏦", label: "Canteen Wallet",  href: "/admin/canteen" },
  { icon: "📢", label: "Announcements",   href: "/admin/announcements" },
  { icon: "📸", label: "School Feed",     href: "/admin/feed" },
  { icon: "🔑", label: "Accounts",        href: "/admin/accounts" },
  { icon: "❓", label: "Question Bank", href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

const allSubjects = [...new Set(Object.values(SUBJECTS_BY_LEVEL).flat())];

export default function StaffPage() {
  const teachers     = useAppStore((s) => s.teachers);
  const addTeacher   = useAppStore((s) => s.addTeacher);
  const updateTeacher = useAppStore((s) => s.updateTeacher);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_id: "", full_name: "", phone: "", email: "",
    class_name: "JHS 3A", subjects: [] as string[], basic_salary: "", hire_date: "",
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ employee_id: `EMP-${String(teachers.length + 1).padStart(3,"0")}`, full_name: "", phone: "", email: "", class_name: "JHS 3A", subjects: [], basic_salary: "", hire_date: "" });
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const t = teachers.find((x) => x.id === id)!;
    setEditing(id);
    setForm({ employee_id: t.employee_id, full_name: t.full_name, phone: t.phone ?? "", email: t.email ?? "", class_name: t.class_name ?? "JHS 3A", subjects: t.subjects, basic_salary: String(t.basic_salary), hire_date: t.hire_date ?? "" });
    setShowModal(true);
  };

  const toggleSubject = (s: string) => {
    setForm((f) => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s] }));
  };

  const handleSave = () => {
    if (!form.full_name.trim()) { toast.error("Full name required"); return; }
    const data = { ...form, basic_salary: parseFloat(form.basic_salary) || 0 };
    if (editing) { updateTeacher(editing, data); toast.success("Staff updated"); }
    else { addTeacher(data); toast.success("Staff member added"); }
    setShowModal(false);
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">Teaching Staff ({teachers.length})</h2>
        <button type="button" onClick={openAdd} className="btn-gold text-xs py-2 px-5">+ Add Staff</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t) => (
          <div key={t.id} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(0,48,135,0.08)" }}>
                {t.full_name.charAt(0) === "M" && t.full_name.startsWith("Mrs") ? "👩‍🏫" : t.full_name.startsWith("Miss") ? "👩‍🏫" : "👨‍🏫"}
              </div>
              <button type="button" onClick={() => openEdit(t.id)}
                className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                Edit
              </button>
            </div>
            <div className="font-black text-gray-900 mb-0.5">{t.full_name}</div>
            <div className="text-xs text-gray-500 mb-2 font-mono">{t.employee_id}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {t.subjects.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>{s}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Form Class</div>
                <div className="font-bold text-gray-800">{t.class_name ?? "—"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Basic Salary</div>
                <div className="font-bold text-gray-800">{formatGHS(t.basic_salary)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Phone</div>
                <div className="font-bold text-gray-800">{t.phone ?? "—"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400">Hired</div>
                <div className="font-bold text-gray-800">{t.hire_date ?? "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-gray-900 text-lg mb-4">{editing ? "Edit Staff Member" : "Add Staff Member"}</h3>
            <div className="space-y-3">
              {[
                { label: "Full Name *", key: "full_name", type: "text" },
                { label: "Employee ID", key: "employee_id", type: "text" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Email", key: "email", type: "email" },
                { label: "Basic Salary (GH₵)", key: "basic_salary", type: "number" },
                { label: "Hire Date", key: "hire_date", type: "date" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={String((form as Record<string, unknown>)[f.key] ?? "")}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Form Class</label>
                <select value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Subjects Taught</label>
                <div className="flex flex-wrap gap-1.5">
                  {allSubjects.map((s) => (
                    <button type="button" key={s} onClick={() => toggleSubject(s)}
                      className="text-xs px-2.5 py-1 rounded-full font-bold transition-all"
                      style={form.subjects.includes(s)
                        ? { background: "#003087", color: "white" }
                        : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handleSave} className="btn-gold flex-1 py-2.5">
                {editing ? "Update" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
