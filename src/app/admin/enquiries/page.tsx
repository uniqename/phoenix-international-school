"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { Enquiry, EnquiryStatus, EnquirySource } from "@/lib/types";
import toast from "react-hot-toast";

const STATUS_META: Record<EnquiryStatus, { label: string; emoji: string; bg: string; fg: string }> = {
  new:                 { label: "New",                 emoji: "🆕", bg: "rgba(26,63,160,0.1)",  fg: "#1A3FA0" },
  contacted:           { label: "Contacted",           emoji: "📞", bg: "rgba(168,85,247,0.1)", fg: "#6B21A8" },
  interview_scheduled: { label: "Interview Scheduled", emoji: "📅", bg: "rgba(245,158,11,0.1)", fg: "#a16207" },
  admitted:            { label: "Admitted",            emoji: "🎉", bg: "rgba(34,197,94,0.1)",  fg: "#16a34a" },
  declined:            { label: "Declined",            emoji: "❌", bg: "rgba(239,68,68,0.1)",  fg: "#b91c1c" },
  archived:            { label: "Archived",            emoji: "🗄️", bg: "rgba(100,116,139,0.1)", fg: "#475569" },
};

const SOURCE_LABEL: Record<EnquirySource, string> = {
  website: "🌐 Website",
  walk_in: "🚶 Walk-in",
  phone: "📞 Phone",
  referral: "🤝 Referral",
  social: "📱 Social",
  other: "❓ Other",
};

export default function EnquiriesPage() {
  const enquiries = useAppStore((s) => s.enquiries);
  const addEnquiry = useAppStore((s) => s.addEnquiry);
  const updateEnquiry = useAppStore((s) => s.updateEnquiry);
  const setStatus = useAppStore((s) => s.setEnquiryStatus);
  const deleteEnquiry = useAppStore((s) => s.deleteEnquiry);

  const [filter, setFilter] = useState<EnquiryStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Enquiry | null>(null);

  const [form, setForm] = useState({
    child_name: "",
    child_dob: "",
    child_gender: "male" as "male" | "female",
    intended_class: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    source: "walk_in" as EnquirySource,
    follow_up_date: "",
    notes: "",
  });

  const counts = useMemo(() => {
    const m = new Map<EnquiryStatus, number>();
    for (const e of enquiries) m.set(e.status, (m.get(e.status) ?? 0) + 1);
    return m;
  }, [enquiries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return e.child_name.toLowerCase().includes(q)
        || e.parent_name.toLowerCase().includes(q)
        || e.parent_phone.includes(q);
    });
  }, [enquiries, filter, search]);

  const openNew = () => {
    setEditing(null);
    setForm({
      child_name: "", child_dob: "", child_gender: "male",
      intended_class: "", parent_name: "", parent_phone: "", parent_email: "",
      source: "walk_in", follow_up_date: "", notes: "",
    });
    setShowModal(true);
  };

  const openEdit = (e: Enquiry) => {
    setEditing(e);
    setForm({
      child_name: e.child_name,
      child_dob: e.child_dob ?? "",
      child_gender: (e.child_gender ?? "male") as "male" | "female",
      intended_class: e.intended_class ?? "",
      parent_name: e.parent_name,
      parent_phone: e.parent_phone,
      parent_email: e.parent_email ?? "",
      source: e.source,
      follow_up_date: e.follow_up_date ?? "",
      notes: e.notes ?? "",
    });
    setShowModal(true);
  };

  const onSave = () => {
    if (!form.child_name.trim() || !form.parent_name.trim() || !form.parent_phone.trim()) {
      toast.error("Child name, parent name and parent phone required");
      return;
    }
    if (editing) {
      updateEnquiry(editing.id, {
        ...form,
        child_dob: form.child_dob || undefined,
        intended_class: form.intended_class.trim() || undefined,
        parent_email: form.parent_email.trim() || undefined,
        follow_up_date: form.follow_up_date || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Enquiry updated");
    } else {
      addEnquiry({
        child_name: form.child_name.trim(),
        child_dob: form.child_dob || undefined,
        child_gender: form.child_gender,
        intended_class: form.intended_class.trim() || undefined,
        parent_name: form.parent_name.trim(),
        parent_phone: form.parent_phone.trim(),
        parent_email: form.parent_email.trim() || undefined,
        source: form.source,
        status: "new",
        follow_up_date: form.follow_up_date || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success(`📥 Enquiry from ${form.parent_name} logged`);
    }
    setShowModal(false);
  };

  const filterPills: Array<EnquiryStatus | "all"> = ["all", "new", "contacted", "interview_scheduled", "admitted", "declined", "archived"];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">📬 Enquiries</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
              Track every prospective parent — from first contact through interview to admission (or decline). Front office logs new ones, principal moves them through the pipeline.
            </p>
          </div>
          <button type="button" className="btn-gold" onClick={openNew}>+ New enquiry</button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {filterPills.filter((p): p is EnquiryStatus => p !== "all").map((s) => (
            <div key={s} className="glass rounded-2xl p-3">
              <p className="text-2xl font-black" style={{ color: STATUS_META[s].fg }}>{counts.get(s) ?? 0}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{STATUS_META[s].emoji} {STATUS_META[s].label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {filterPills.map((p) => (
            <button key={p} type="button" onClick={() => setFilter(p)}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: filter === p ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: filter === p ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
              {p === "all" ? "All" : `${STATUS_META[p].emoji} ${STATUS_META[p].label}`}
            </button>
          ))}
          <input className="input max-w-sm ml-auto" placeholder="Search by child, parent, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
              <p className="text-4xl mb-1">📥</p>
              {enquiries.length === 0 ? (
                <>
                  <p className="font-bold">No enquiries yet.</p>
                  <p className="text-xs mt-1">Log the first prospective parent who contacts the school.</p>
                  <button type="button" className="btn-gold mt-3" onClick={openNew}>+ Log first enquiry</button>
                </>
              ) : (
                <p>No enquiries match your filter.</p>
              )}
            </div>
          )}
          {filtered.map((e) => {
            const sm = STATUS_META[e.status];
            return (
              <div key={e.id} className="glass rounded-2xl p-4 card-hover">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900">{e.child_name}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.fg }}>{sm.emoji} {sm.label}</span>
                      {e.intended_class && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">🎯 {e.intended_class}</span>}
                      <span className="text-xs text-gray-400">{SOURCE_LABEL[e.source]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      👨‍👩 {e.parent_name} · 📞 {e.parent_phone}
                      {e.parent_email && ` · ✉️ ${e.parent_email}`}
                      {e.child_dob && ` · 🎂 ${e.child_dob}`}
                    </p>
                    {e.notes && <p className="text-xs text-gray-600 mt-1">{e.notes}</p>}
                    {e.follow_up_date && (
                      <p className="text-xs text-amber-700 mt-1">📅 Follow up by {e.follow_up_date}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <select className="text-xs font-bold px-2 py-1 rounded-lg border border-gray-200" value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value as EnquiryStatus)}>
                      {(Object.keys(STATUS_META) as EnquiryStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].emoji} {STATUS_META[s].label}</option>)}
                    </select>
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(26,63,160,0.1)", color: "#1A3FA0" }} onClick={() => openEdit(e)}>Edit</button>
                    <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }} onClick={() => {
                      if (confirm(`Delete enquiry for ${e.child_name}?`)) deleteEnquiry(e.id);
                    }}>×</button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,10,30,0.7)" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 pt-5 pb-3 border-b">
                <h2 className="font-black text-lg text-gray-900">{editing ? "Edit enquiry" : "Log new enquiry"}</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Child name *"><input className="input" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} /></Field>
                  <Field label="Child DOB"><input className="input" type="date" value={form.child_dob} onChange={(e) => setForm({ ...form, child_dob: e.target.value })} /></Field>
                  <Field label="Gender">
                    <select className="input" value={form.child_gender} onChange={(e) => setForm({ ...form, child_gender: e.target.value as "male" | "female" })}>
                      <option value="male">Male</option><option value="female">Female</option>
                    </select>
                  </Field>
                  <Field label="Intended class">
                    <input className="input" placeholder="e.g. KG 1, JHS 1" value={form.intended_class} onChange={(e) => setForm({ ...form, intended_class: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Parent name *"><input className="input" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} /></Field>
                  <Field label="Parent phone *"><input className="input" type="tel" placeholder="0244000000" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} /></Field>
                  <Field label="Parent email"><input className="input" type="email" value={form.parent_email} onChange={(e) => setForm({ ...form, parent_email: e.target.value })} /></Field>
                  <Field label="Source">
                    <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as EnquirySource })}>
                      {(Object.keys(SOURCE_LABEL) as EnquirySource[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Follow up date (optional)"><input className="input" type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></Field>
                <Field label="Notes (optional)"><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              </div>
              <div className="px-6 py-4 border-t flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded-full font-bold text-sm border border-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn-gold" onClick={onSave}>{editing ? "Save" : "Log enquiry"}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
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
