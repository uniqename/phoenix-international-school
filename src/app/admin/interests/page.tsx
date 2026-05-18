"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function InterestsPage() {
  const students = useAppStore((s) => s.students);
  const interests = useAppStore((s) => s.studentInterests);
  const banks = useAppStore((s) => s.remarkBanks);
  const addInterest = useAppStore((s) => s.addStudentInterest);
  const removeInterest = useAppStore((s) => s.removeStudentInterest);

  const interestSuggestions = useMemo(() => {
    const bank = banks.find((b) => b.kind === "interest");
    return bank ? bank.remarks.sort((a, b) => a.order - b.order).map((r) => r.text) : [];
  }, [banks]);

  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [rating, setRating] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) =>
      !q || s.full_name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q),
    ).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [students, search]);

  const selected = students.find((s) => s.id === selectedStudentId);
  const studentInterests = interests.filter((i) => i.student_id === selectedStudentId);

  const onAdd = () => {
    if (!selected) { toast.error("Pick a student first"); return; }
    if (!newInterest.trim()) { toast.error("Pick or type an interest"); return; }
    const dupe = studentInterests.some((i) => i.interest.toLowerCase() === newInterest.trim().toLowerCase());
    if (dupe) { toast.error("Already added"); return; }
    addInterest({
      student_id: selected.id,
      interest: newInterest.trim(),
      rating,
      notes: notes.trim() || undefined,
    });
    setNewInterest("");
    setNotes("");
    toast.success("Interest added");
  };

  const ratingPill = (r?: "low" | "medium" | "high") => {
    const map: Record<string, { bg: string; fg: string; emoji: string }> = {
      low:    { bg: "rgba(245,158,11,0.15)", fg: "#a16207", emoji: "🌱" },
      medium: { bg: "rgba(26,63,160,0.15)",  fg: "#1A3FA0", emoji: "🌿" },
      high:   { bg: "rgba(34,197,94,0.15)",  fg: "#16a34a", emoji: "🌟" },
    };
    const v = map[r ?? "medium"];
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: v.bg, color: v.fg }}>
        {v.emoji} {(r ?? "medium").toUpperCase()}
      </span>
    );
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">💗 Student Interests</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Track each student&apos;s extracurricular interests — athletics, reading, music, etc. Appears on the report card under the &ldquo;Interests&rdquo; section and helps teachers pick relevant clubs / activities.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Students</p>
            <input className="input" placeholder="Search by name or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
            <ul className="mt-3 max-h-96 overflow-y-auto divide-y">
              {filtered.length === 0 && <li className="text-xs text-gray-400 py-3 text-center">No students match.</li>}
              {filtered.slice(0, 80).map((s) => {
                const count = interests.filter((i) => i.student_id === s.id).length;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(s.id)}
                      className="w-full text-left py-2 px-2 hover:bg-indigo-50 rounded text-sm flex justify-between items-center"
                      style={{ background: selectedStudentId === s.id ? "rgba(107,33,168,0.1)" : undefined }}
                    >
                      <div>
                        <p className="font-bold text-gray-800">{s.full_name}</p>
                        <p className="text-xs text-gray-500">{s.class_name}</p>
                      </div>
                      {count > 0 && <span className="text-xs font-bold text-indigo-700">{count}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            {!selected ? (
              <div className="glass rounded-2xl p-8 text-center text-sm text-gray-400">
                <p className="text-4xl mb-2">💗</p>
                <p>Pick a student on the left to add or view interests.</p>
              </div>
            ) : (
              <>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Selected</p>
                  <p className="text-xl font-black text-gray-900">{selected.full_name}</p>
                  <p className="text-xs text-gray-500">{selected.class_name} · {selected.student_id} · {studentInterests.length} interest{studentInterests.length === 1 ? "" : "s"} on record</p>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-black text-gray-900 mb-3">Interests</h3>
                  {studentInterests.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No interests recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {studentInterests.map((i) => (
                        <li key={i.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <span className="text-lg">💗</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{i.interest}</p>
                            {i.notes && <p className="text-xs text-gray-500">{i.notes}</p>}
                          </div>
                          {ratingPill(i.rating)}
                          <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => removeInterest(i.id)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-black text-gray-900 mb-3">➕ Add an interest</h3>
                  {interestSuggestions.length > 0 && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">Tap a common interest to add quickly, or type below:</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {interestSuggestions.map((s) => {
                          const already = studentInterests.some((i) => i.interest === s);
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={already}
                              onClick={() => setNewInterest(s)}
                              className="text-xs px-3 py-1 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: newInterest === s ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(168,85,247,0.1)",
                                color: newInterest === s ? "white" : "#6B21A8",
                              }}
                            >
                              {already ? "✓ " : "+ "}{s}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 font-bold">Interest</label>
                      <input className="input" placeholder="e.g. Athletics" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold">Level</label>
                      <select className="input" value={rating} onChange={(e) => setRating(e.target.value as "low" | "medium" | "high")}>
                        <option value="low">🌱 Low</option>
                        <option value="medium">🌿 Medium</option>
                        <option value="high">🌟 High</option>
                      </select>
                    </div>
                  </div>
                  <textarea className="input mt-2" rows={2} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <button type="button" className="btn-gold mt-2" onClick={onAdd}>+ Add interest</button>
                </div>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
