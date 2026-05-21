"use client";
import { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ExcusesPage() {
  const { user } = useAuth();
  const excuses = useAppStore((s) => s.excuseRequests);
  const reviewExcuse = useAppStore((s) => s.reviewExcuseRequest);
  const bulkApproveExcuses = useAppStore((s) => s.bulkApproveExcuses);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [filterClass, setFilterClass] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [selectedBulk, setSelectedBulk] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = filterStatus === 'all' ? excuses : excuses.filter((e) => e.status === filterStatus);
    if (filterClass !== 'all') result = result.filter((e) => e.class_name === filterClass);
    if (search) result = result.filter((e) => (e.student_name?.toLowerCase().includes(search.toLowerCase()) || e.reason?.toLowerCase().includes(search.toLowerCase())));
    return result;
  }, [excuses, filterStatus, filterClass, search]);

  const selected = excuses.find((e) => e.id === selectedId);
  const stats = { total: excuses.length, pending: excuses.filter((e) => e.status === 'pending').length, approved: excuses.filter((e) => e.status === 'approved').length };
  const classes = [...new Set(excuses.map((e) => e.class_name))];

  const handleReview = (decision: 'approved' | 'declined') => {
    if (!selectedId) return;
    reviewExcuse(selectedId, decision, user?.full_name ?? 'Admin', reviewerNotes);
    toast.success(`Excuse ${decision}`);
    setSelectedId(null);
    setReviewerNotes('');
  };

  const handleBulkApprove = () => {
    if (selectedBulk.size === 0) { toast.error("Select at least one excuse"); return; }
    bulkApproveExcuses(Array.from(selectedBulk), user?.full_name ?? 'Admin');
    toast.success(`✅ Approved ${selectedBulk.size} excuse${selectedBulk.size > 1 ? 's' : ''}`);
    setSelectedBulk(new Set());
  };

  const toggleBulk = (id: string) => {
    const newSet = new Set(selectedBulk);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBulk(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedBulk.size === filtered.length) setSelectedBulk(new Set());
    else setSelectedBulk(new Set(filtered.map((e) => e.id)));
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <h2 className="text-xl font-black text-white mb-4">🚫 Absence Excuses</h2>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black">{stats.total}</div><div className="text-[10px] text-gray-400">Total</div></div>
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black text-amber-300">{stats.pending}</div><div className="text-[10px] text-gray-400">Pending</div></div>
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black text-emerald-300">{stats.approved}</div><div className="text-[10px] text-gray-400">Approved</div></div>
      </div>

      <div className="mb-4 space-y-2">
        <input type="text" placeholder="🔍 Search student or reason..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          aria-label="Search excuses"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:outline-none" />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'declined'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full ${filterStatus === s ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            aria-label="Filter by class"
            className="px-3 py-1.5 rounded-lg border border-gray-500 bg-gray-800 text-white text-xs font-bold">
            <option value="all">All Classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 space-y-2">
          {selectedBulk.size > 0 && (
            <div className="flex gap-2 p-3 bg-purple-900 rounded-lg items-center justify-between">
              <span className="text-white font-bold text-sm">{selectedBulk.size} selected</span>
              <button type="button" onClick={handleBulkApprove}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white text-sm">
                Bulk Approve
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedBulk.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll} aria-label="Select all excuses" className="rounded w-4 h-4" />
              <span className="text-xs font-bold text-gray-400">Select all</span>
            </label>
          </div>
          {filtered.map((e) => (
            <div key={e.id} className="flex gap-2 items-start p-3 rounded-xl bg-gray-800 hover:bg-gray-700">
              <input type="checkbox" checked={selectedBulk.has(e.id)}
                onChange={() => toggleBulk(e.id)} aria-label={`Select excuse for ${e.student_name}`} className="mt-1 rounded w-4 h-4" />
              <button type="button" onClick={() => setSelectedId(e.id)} className={`flex-1 text-left ${selectedId === e.id ? 'ring-2 ring-purple-500' : ''} p-2 rounded-lg`}>
                <p className="font-bold text-white">{e.student_name} · {e.class_name}</p>
                <p className="text-xs text-gray-400">{e.start_date} to {e.end_date}</p>
                <p className="text-xs text-gray-500 mt-1">{e.reason.substring(0, 60)}...</p>
              </button>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                style={{
                  background: e.status === 'pending' ? "rgba(245,158,11,0.15)" : e.status === 'approved' ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: e.status === 'pending' ? "#b45309" : e.status === 'approved' ? "#047857" : "#991b1b",
                }}>
                {e.status}
              </span>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="font-bold">📋 Details</h3>
            <div className="space-y-1.5 text-sm">
              <div><span className="text-gray-500">Student:</span> <span className="font-bold text-white">{selected.student_name ?? "—"}</span></div>
              <div><span className="text-gray-500">Class:</span> <span className="font-bold text-white">{selected.class_name ?? "—"}</span></div>
              <div><span className="text-gray-500">Type:</span> <span className="font-bold text-white capitalize">{selected.kind}</span></div>
              <div><span className="text-gray-500">Period:</span> <span className="font-bold text-white">{selected.start_date} to {selected.end_date}</span></div>
              {selected.submitted_by_email && <div><span className="text-gray-500">By:</span> <span className="font-bold text-white text-xs">{selected.submitted_by_email}</span></div>}
              {selected.reviewed_at && <div><span className="text-gray-500">Reviewed:</span> <span className="font-bold text-white text-xs">{new Date(selected.reviewed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span></div>}
            </div>
            {selected.document_name && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">📎 Document attached:</p>
                {selected.document_data_url ? (
                  <a href={selected.document_data_url} download={selected.document_name}
                    className="text-xs font-bold text-blue-400 hover:underline">
                    {selected.document_name}
                  </a>
                ) : (
                  <p className="text-xs text-gray-400">{selected.document_name}</p>
                )}
              </div>
            )}
            <div className="border-t border-gray-700 pt-2">
              <p className="text-xs text-gray-500 mb-1">Reason:</p>
              <p className="text-xs text-gray-200">{selected.reason}</p>
            </div>
            {selected.status === 'pending' && (
              <div className="border-t border-gray-700 pt-3">
                <label className="block mb-2">
                  <span className="text-xs font-bold text-gray-400">Reviewer Notes (optional)</span>
                  <textarea value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="e.g. Medical certificate provided, appears valid"
                    rows={2} className="w-full mt-1 px-2 py-1 rounded-lg bg-gray-800 border border-gray-600 text-white text-xs resize-none" />
                </label>
                <div className="space-y-2">
                  <button type="button" onClick={() => handleReview('approved')} className="w-full bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg font-bold text-sm text-white">
                    ✅ Approve
                  </button>
                  <button type="button" onClick={() => handleReview('declined')} className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-bold text-sm text-white">
                    ✖ Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : <div className="glass rounded-2xl p-4 flex items-center justify-center text-gray-500">Select an excuse</div>}
      </div>
    </DashboardShell>
  );
}
