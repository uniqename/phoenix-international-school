"use client";
import { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function ExcusesPage() {
  const excuses = useAppStore((s) => s.excuseRequests);
  const reviewExcuse = useAppStore((s) => s.reviewExcuseRequest);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return filter === 'all' ? excuses : excuses.filter((e) => e.status === filter);
  }, [excuses, filter]);

  const selected = excuses.find((e) => e.id === selectedId);
  const stats = { total: excuses.length, pending: excuses.filter((e) => e.status === 'pending').length, approved: excuses.filter((e) => e.status === 'approved').length };

  const handleReview = (decision: 'approved' | 'declined') => {
    if (!selectedId) return;
    reviewExcuse(selectedId, decision, 'Admin', '');
    toast.success(`Excuse ${decision}`);
    setSelectedId(null);
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <h2 className="text-xl font-black text-white mb-4">🚫 Absence Excuses</h2>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black">{stats.total}</div><div className="text-[10px] text-gray-400">Total</div></div>
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black text-amber-300">{stats.pending}</div><div className="text-[10px] text-gray-400">Pending</div></div>
        <div className="glass rounded-2xl p-3"><div className="text-xl font-black text-emerald-300">{stats.approved}</div><div className="text-[10px] text-gray-400">Approved</div></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex gap-2 mb-3">{(['all', 'pending', 'approved', 'declined'] as const).map((s) => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 text-xs font-bold rounded-full ${filter === s ? 'bg-purple-600' : 'bg-gray-700'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div>
          {filtered.map((e) => (
            <button key={e.id} onClick={() => setSelectedId(e.id)} className={`w-full text-left p-3 rounded-xl ${selectedId === e.id ? 'ring-2 ring-purple-500 bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}>
              <p className="font-bold">{e.student_name} • {e.class_name}</p>
              <p className="text-xs text-gray-400">{e.reason.substring(0, 50)}...</p>
            </button>
          ))}
        </div>
        {selected ? (
          <div className="glass rounded-2xl p-4">
            <h3 className="font-bold mb-3">📋 Details</h3>
            <p className="text-sm"><span className="text-gray-500">Student:</span> <span className="font-bold">{selected.student_name}</span></p>
            <p className="text-sm"><span className="text-gray-500">Reason:</span> <span className="font-bold">{selected.reason}</span></p>
            {selected.status === 'pending' && (
              <div className="mt-4 space-y-2">
                <button onClick={() => handleReview('approved')} className="w-full bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg font-bold text-sm">✅ Approve</button>
                <button onClick={() => handleReview('declined')} className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-bold text-sm">✖ Decline</button>
              </div>
            )}
          </div>
        ) : <div className="glass rounded-2xl p-4 flex items-center justify-center text-gray-500">Select an excuse</div>}
      </div>
    </DashboardShell>
  );
}
