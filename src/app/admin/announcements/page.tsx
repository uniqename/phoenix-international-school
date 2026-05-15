"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { CLASSES } from "@/lib/utils";
import type { Announcement } from "@/lib/types";
import toast from "react-hot-toast";


const TYPE_ICONS: Record<string, string> = { push: "🔔", sms: "📱", both: "📣", internal: "📋" };
const AUD_LABELS: Record<string, string> = { all: "Everyone", parents: "Parents", teachers: "Teachers", students: "Students", specific_class: "Specific Class" };

export default function AnnouncementsPage() {
  const announcements    = useAppStore((s) => s.announcements);
  const addAnnouncement  = useAppStore((s) => s.addAnnouncement);
  const { user }         = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    title: string; content: string; type: Announcement["type"]; audience: Announcement["audience"]; class_name: string;
  }>({ title: "", content: "", type: "both", audience: "all", class_name: "" });

  const handleSend = () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and message are required"); return; }
    addAnnouncement({ ...form, created_by: user?.full_name });
    toast.success(`Announcement sent to ${AUD_LABELS[form.audience]}`);
    setForm({ title: "", content: "", type: "both", audience: "all", class_name: "" });
    setShowModal(false);
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">Announcements</h2>
        <button type="button" onClick={() => setShowModal(true)} className="btn-gold text-xs py-2 px-5">
          + New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-black text-gray-900">{a.title}</h3>
              <div className="flex gap-2 flex-shrink-0">
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                  {TYPE_ICONS[a.type]} {a.type.toUpperCase()}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                  {AUD_LABELS[a.audience]}{a.class_name ? ` (${a.class_name})` : ""}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{a.content}</p>
            <div className="text-xs text-gray-400">
              {a.created_by && <span className="font-medium">{a.created_by} · </span>}
              {new Date(a.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="font-black text-gray-900 text-lg mb-4">New Announcement</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. No school tomorrow" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Message *</label>
                <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={4} placeholder="Type your message here…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Send Via</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Announcement["type"] }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                    <option value="both">📣 SMS + Push</option>
                    <option value="push">🔔 Push Only</option>
                    <option value="sms">📱 SMS Only</option>
                    <option value="internal">📋 Internal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Audience</label>
                  <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value as Announcement["audience"] }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                    <option value="all">Everyone</option>
                    <option value="parents">Parents</option>
                    <option value="teachers">Teachers</option>
                    <option value="students">Students</option>
                    <option value="specific_class">Specific Class</option>
                  </select>
                </div>
              </div>
              {form.audience === "specific_class" && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Select Class</label>
                  <select value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                    <option value="">— Select —</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handleSend} className="btn-gold flex-1 py-2.5">Send Now</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
