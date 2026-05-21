"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type { ExcuseStatus } from "@/lib/types";
import toast from "react-hot-toast";

const KIND_LABEL: Record<string, string> = {
  medical: "🩺 Medical / doctor's note",
  family: "👨‍👩‍👧 Family matter",
  religious: "🕊 Religious observance",
  bereavement: "🕯 Bereavement",
  travel: "✈️ Travel",
  other: "📄 Other",
};

export default function ExcusesPage() {
  const { user } = useAuth();
  const excuseRequests = useAppStore((s) => s.excuseRequests);
  const reviewExcuseRequest = useAppStore((s) => s.reviewExcuseRequest);

  const [filter, setFilter] = useState<ExcuseStatus | 'all'>('pending');

  const sorted = useMemo(() => [...excuseRequests].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  ), [excuseRequests]);

  const visible = filter === 'all' ? sorted : sorted.filter((r) => r.status === filter);

  const counts = useMemo(() => ({
    pending: excuseRequests.filter((r) => r.status === 'pending').length,
    approved: excuseRequests.filter((r) => r.status === 'approved').length,
    declined: excuseRequests.filter((r) => r.status === 'declined').length,
  }), [excuseRequests]);

  const decide = (id: string, kind: 'approved' | 'declined') => {
    const notes = kind === 'declined'
      ? (window.prompt("Reason for decline (shown to parent):", "") ?? "")
      : undefined;
    if (kind === 'declined' && notes === "") {
      // user cancelled prompt
      return;
    }
    reviewExcuseRequest(id, kind, user?.full_name, notes);
    toast.success(kind === 'approved' ? "✅ Excuse approved, attendance updated" : "❌ Excuse declined");
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">📋 Excuse Requests</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Parent-submitted notes for absences. Approving an excuse retro-marks the matching attendance as &ldquo;excused&rdquo;.
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['pending', 'approved', 'declined', 'all'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: filter === f ? "#1A0E4D" : "rgba(255,255,255,0.06)",
                color: filter === f ? "white" : "rgba(196,181,253,0.85)",
                border: `1px solid ${filter === f ? "#1A0E4D" : "rgba(255,255,255,0.12)"}`,
              }}>
              {f === 'all' ? 'All' : f === 'pending' ? `Pending (${counts.pending})` : f === 'approved' ? `Approved (${counts.approved})` : `Declined (${counts.declined})`}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-gray-500">
          {filter === 'pending' ? "No pending excuses 🎉" : `No ${filter} excuses.`}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((r) => {
            const days = Math.max(1, Math.round((new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / 86400000) + 1);
            return (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      {KIND_LABEL[r.kind] ?? "📄 Other"}
                    </p>
                    <h3 className="font-black text-white text-base mt-0.5">{r.student_name ?? r.student_id}</h3>
                    <p className="text-xs text-gray-400">{r.class_name ?? "—"} · submitted {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{r.submitted_by_email ? ` · ${r.submitted_by_email}` : ""}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: r.status === 'pending' ? "rgba(245,158,11,0.18)" : r.status === 'approved' ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)",
                      color: r.status === 'pending' ? "#fcd34d" : r.status === 'approved' ? "#34d399" : "#fca5a5",
                    }}>
                    {r.status}
                  </span>
                </div>

                <div className="rounded-lg p-3 text-xs mb-2"
                  style={{ background: "rgba(26,14,77,0.18)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-white font-bold">
                    {r.start_date}{r.end_date !== r.start_date ? ` → ${r.end_date}` : ""} · {days} day{days === 1 ? "" : "s"}
                  </p>
                  <p className="text-gray-300 mt-1 whitespace-pre-wrap">{r.reason}</p>
                </div>

                {r.document_data_url && (
                  <a href={r.document_data_url} download={r.document_name ?? "excuse-document"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 underline mb-2">
                    📎 Download supporting document{r.document_name ? ` — ${r.document_name}` : ""}
                  </a>
                )}

                {r.review_notes && (
                  <p className="text-[11px] text-gray-400 italic mb-2">Reviewer note: {r.review_notes}</p>
                )}

                {r.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => decide(r.id, 'approved')}
                      className="text-xs font-bold px-3 py-2 rounded-lg"
                      style={{ background: "#10b981", color: "white" }}>
                      ✅ Approve + mark excused
                    </button>
                    <button type="button" onClick={() => decide(r.id, 'declined')}
                      className="text-xs font-bold px-3 py-2 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }}>
                      ❌ Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
