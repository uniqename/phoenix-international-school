"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type { FeedPostStatus } from "@/lib/types";
import toast from "react-hot-toast";

type Tab = FeedPostStatus;

export default function FeedPage() {
  const feedPosts        = useAppStore((s) => s.feedPosts);
  const addFeedPost      = useAppStore((s) => s.addFeedPost);
  const approveFeedPost  = useAppStore((s) => s.approveFeedPost);
  const rejectFeedPost   = useAppStore((s) => s.rejectFeedPost);
  const deleteFeedPost   = useAppStore((s) => s.deleteFeedPost);
  const { user }         = useAuth();

  const [tab, setTab] = useState<Tab>("approved");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image_urls_raw: "" });

  const counts = useMemo(() => ({
    approved: feedPosts.filter((p) => (p.status ?? "approved") === "approved").length,
    pending: feedPosts.filter((p) => p.status === "pending").length,
    rejected: feedPosts.filter((p) => p.status === "rejected").length,
  }), [feedPosts]);

  const visible = useMemo(
    () => feedPosts.filter((p) => (p.status ?? "approved") === tab),
    [feedPosts, tab],
  );

  const handlePost = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const urls = form.image_urls_raw
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
    addFeedPost({
      title: form.title,
      content: form.content,
      image_url: urls[0],
      image_urls: urls.length > 1 ? urls : undefined,
      author_name: user?.full_name,
      author_role: 'admin',
    });
    toast.success(urls.length > 1 ? `Album of ${urls.length} photos published ✨` : "Post published to School Feed");
    setForm({ title: "", content: "", image_urls_raw: "" });
    setShowModal(false);
    setTab("approved");
  };

  const onApprove = (id: string) => {
    approveFeedPost(id, user?.full_name);
    toast.success("✅ Post approved — now visible to parents");
  };
  const onReject = (id: string) => {
    const reason = window.prompt("Reason for rejecting this post (shown to the author):", "");
    if (reason === null) return;
    rejectFeedPost(id, user?.full_name, reason.trim() || "Not approved");
    toast.success("Post moved to Rejected");
  };
  const onDelete = (id: string) => {
    if (!window.confirm("Delete this post permanently? Parents will no longer see it.")) return;
    deleteFeedPost(id);
    toast.success("Post deleted");
  };

  const TabButton = ({ value, label, count, accent }: { value: Tab; label: string; count: number; accent: string }) => (
    <button type="button" onClick={() => setTab(value)}
      className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
      style={{
        background: tab === value ? accent : "rgba(255,255,255,0.06)",
        color: tab === value ? "white" : "rgba(196,181,253,0.8)",
        border: `1px solid ${tab === value ? accent : "rgba(196,181,253,0.2)"}`,
      }}>
      {label}{count > 0 && <span className="ml-1.5 opacity-80">({count})</span>}
    </button>
  );

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">📸 School Feed</h2>
          <p className="text-xs text-gray-500 mt-0.5">Album posts + moderation queue. Teacher / parent submissions land in Pending first.</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="btn-gold text-xs py-2 px-5">+ New Post / Album</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <TabButton value="approved" label="Approved" count={counts.approved} accent="#10b981" />
        <TabButton value="pending"  label="Pending"  count={counts.pending}  accent="#f59e0b" />
        <TabButton value="rejected" label="Rejected" count={counts.rejected} accent="#ef4444" />
      </div>

      {visible.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
          {tab === "pending" ? "Nothing waiting for moderation 🎉" :
           tab === "rejected" ? "No rejected posts." :
           "No approved posts yet — click + New Post to publish one."}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((p) => {
          const urls = [p.image_url, ...(p.image_urls ?? [])].filter((u): u is string => !!u);
          const dedupedUrls = [...new Set(urls)];
          return (
            <div key={p.id} className="glass rounded-2xl overflow-hidden card-hover">
              {dedupedUrls.length > 0 && (
                <div className="h-40 grid grid-cols-2 gap-0.5 bg-black/20">
                  {dedupedUrls.slice(0, 4).map((u, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={u} alt={`${p.title} ${i + 1}`}
                      className={`w-full h-full object-cover ${dedupedUrls.length === 1 ? "col-span-2" : ""}`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ))}
                  {dedupedUrls.length > 4 && (
                    <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">
                      +{dedupedUrls.length - 4} more
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-black text-gray-900 mb-1.5">{p.title}</h3>
                {p.content && <p className="text-sm text-gray-600 mb-2 line-clamp-3">{p.content}</p>}
                {dedupedUrls.length > 1 && (
                  <p className="text-[10px] text-gray-400 mb-2">📷 Album of {dedupedUrls.length} photos</p>
                )}
                {p.status === "rejected" && p.rejection_reason && (
                  <p className="text-[11px] text-red-600 mb-2 italic">Rejected: {p.rejection_reason}</p>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[10px] text-gray-400">
                    {p.author_name && <span className="font-medium">{p.author_name}{p.author_role ? ` · ${p.author_role}` : ""} · </span>}
                    {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="flex gap-1.5">
                    {p.status === "pending" && (
                      <>
                        <button type="button" onClick={() => onApprove(p.id)}
                          className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white">✅ Approve</button>
                        <button type="button" onClick={() => onReject(p.id)}
                          className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700">✖ Reject</button>
                      </>
                    )}
                    {p.status === "rejected" && (
                      <button type="button" onClick={() => onApprove(p.id)}
                        className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white">Re-approve</button>
                    )}
                    {(p.status ?? "approved") === "approved" && (
                      <button type="button" onClick={() => onReject(p.id)}
                        className="text-[11px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700">Unpublish</button>
                    )}
                    <button type="button" onClick={() => onDelete(p.id)}
                      className="text-[11px] font-bold px-2 py-1 rounded-md text-gray-500" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="font-black text-gray-900 text-lg mb-1">New Feed Post / Album</h3>
            <p className="text-xs text-gray-500 mb-4">Paste several image URLs (one per line) to create a photo album.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Sports Day 2026" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Caption</label>
                <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={3} placeholder="What's happening at Phoenix today?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Image URLs (one per line, optional)</label>
                <textarea value={form.image_urls_raw}
                  onChange={(e) => setForm((p) => ({ ...p, image_urls_raw: e.target.value }))}
                  rows={4}
                  placeholder={"https://…/photo1.jpg\nhttps://…/photo2.jpg\nhttps://…/photo3.jpg"}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none font-mono resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>
              <button type="button" onClick={handlePost} className="btn-gold flex-1 py-2.5">Publish</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
