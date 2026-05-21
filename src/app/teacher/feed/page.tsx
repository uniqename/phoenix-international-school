"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";


export default function TeacherFeedPage() {
  const allFeedPosts = useAppStore((s) => s.feedPosts);
  const addFeedPost  = useAppStore((s) => s.addFeedPost);
  const toggleLikePost = useAppStore((s) => s.toggleLikePost);
  const { user }     = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image_url: "" });

  // Teacher sees approved posts publicly, plus their own pending/rejected items.
  const feedPosts = allFeedPosts.filter((p) => {
    const status = p.status ?? "approved";
    if (status === "approved") return true;
    return p.author_name === user?.full_name;
  });

  const handlePost = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    addFeedPost({
      title: form.title,
      content: form.content,
      image_url: form.image_url || undefined,
      author_name: user?.full_name,
      author_role: 'teacher',
    });
    toast("📨 Sent to admin for approval — you'll see it here marked Pending until it's reviewed.", { duration: 6000 });
    setForm({ title: "", content: "", image_url: "" });
    setShowModal(false);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">School Feed</h2>
          <p className="text-xs text-gray-500 mt-0.5">Visible to parents, students & all staff</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="btn-gold text-xs py-2 px-5">
          + New Post
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedPosts.length === 0 ? (
          <div className="col-span-3 glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
          </div>
        ) : feedPosts.map((p) => {
          const status = p.status ?? "approved";
          const isOwnPending = status === "pending" && p.author_name === user?.full_name;
          const isOwnRejected = status === "rejected" && p.author_name === user?.full_name;
          return (
          <div key={p.id} className="glass rounded-2xl overflow-hidden card-hover">
            {p.image_url && (
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl">
                📸
              </div>
            )}
            <div className="p-4">
              {isOwnPending && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-1.5">⏳ Awaiting admin approval</span>
              )}
              {isOwnRejected && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 mb-1.5">✖ Not approved{p.rejection_reason ? ` — ${p.rejection_reason}` : ""}</span>
              )}
              <h3 className="font-black text-gray-900 mb-1.5">{p.title}</h3>
              {p.content && <p className="text-sm text-gray-600 mb-3 line-clamp-3">{p.content}</p>}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {p.author_name && <span className="font-medium">{p.author_name} · </span>}
                  {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </div>
                <button type="button" onClick={() => user && toggleLikePost(p.id, user.id)}
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-all ${
                    p.liked_by?.includes(user?.id || '')
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}>
                  {p.liked_by?.includes(user?.id || '') ? '❤️' : '🤍'} {p.likes}
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="font-black text-gray-900 text-lg mb-4">New School Feed Post</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Our class Science experiment today"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Caption</label>
                <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={3} placeholder="Share what's happening in your class…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Image URL (optional)</label>
                <input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handlePost} className="btn-gold flex-1 py-2.5">
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
