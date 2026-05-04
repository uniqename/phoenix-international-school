"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES, LEVEL_NAMES, generateStudentId } from "@/lib/utils";
import type { Student, StudentLevel } from "@/lib/types";
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

const LEVELS: StudentLevel[] = ["creche","nursery","kg","primary","jhs"];

const blank = (): Omit<Student,"id"|"created_at"|"fee_status"> => ({
  student_id: "", full_name: "", gender: "male", level: "primary",
  class_name: "Primary 1", dob: "", parent_name: "", parent_phone: "",
});

export default function StudentsPage() {
  const students       = useAppStore((s) => s.students);
  const addStudent     = useAppStore((s) => s.addStudent);
  const updateStudent  = useAppStore((s) => s.updateStudent);
  const deleteStudent  = useAppStore((s) => s.deleteStudent);

  const [search, setSearch]         = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Student | null>(null);
  const [form, setForm]             = useState(blank());
  const [viewing, setViewing]       = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ student_id: s.student_id, full_name: s.full_name, gender: s.gender ?? "male",
      level: s.level, class_name: s.class_name, dob: s.dob ?? "",
      parent_name: s.parent_name ?? "", parent_phone: s.parent_phone ?? "" });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    if (editing) {
      updateStudent(editing.id, form);
      toast.success("Student updated");
    } else {
      const id = generateStudentId(form.level, students.length + 1);
      addStudent({ ...form, student_id: id, fee_status: "outstanding" });
      toast.success("Student added");
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
        <h2 className="text-xl font-black text-gray-900">Students ({students.length})</h2>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-gray-900 text-lg mb-4">{editing ? "Edit Student" : "Add New Student"}</h3>
            <div className="space-y-3">
              {[
                { label: "Full Name *", key: "full_name", type: "text", placeholder: "e.g. Kwame Asante Jr." },
                { label: "Date of Birth", key: "dob", type: "date", placeholder: "" },
                { label: "Parent / Guardian Name", key: "parent_name", type: "text", placeholder: "e.g. Mr. Kwame Asante" },
                { label: "Parent Phone", key: "parent_phone", type: "tel", placeholder: "0244000000" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as Record<string,string>)[f.key]}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as "male"|"female" }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Level</label>
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as StudentLevel }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_NAMES[l]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Class</label>
                <select value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="btn-gold flex-1 py-2.5">
                {editing ? "Update" : "Add Student"}
              </button>
            </div>
          </div>
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
