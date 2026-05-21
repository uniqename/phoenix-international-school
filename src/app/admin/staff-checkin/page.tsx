"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

// Admin / front-desk staff time-clock. Tap a person → check in or out for today.
// Per-day, per-staff dedupe. Drives payroll later.

export default function StaffCheckInPage() {
  const teachers = useAppStore((s) => s.teachers);
  const checkIns = useAppStore((s) => s.staffCheckIns);
  const checkInNow = useAppStore((s) => s.staffCheckInNow);
  const checkOutNow = useAppStore((s) => s.staffCheckOutNow);

  const [search, setSearch] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const byStaff = useMemo(() => {
    const m = new Map<string, ReturnType<typeof Object> extends never ? never : (typeof checkIns)[number]>();
    for (const c of checkIns) {
      if (c.date === today) m.set(c.staff_id, c);
    }
    return m;
  }, [checkIns, today]);

  const filtered = teachers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.full_name.toLowerCase().includes(q) || (t.class_name ?? "").toLowerCase().includes(q);
  });

  const totalCheckedIn = byStaff.size;
  const stillIn = [...byStaff.values()].filter((c) => !c.out_at).length;

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">🕒 Staff Check-In</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Time-clock for teachers, cooks, drivers, store, canteen. {totalCheckedIn} signed in today · {stillIn} still on site.
        </p>
      </div>

      <div className="glass rounded-2xl p-3 mb-4">
        <input value={search}
          aria-label="Search staff"
          placeholder="Search staff name or class…"
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.12)" }} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-2 glass rounded-2xl p-8 text-center text-sm text-gray-500">
            No staff matching &ldquo;{search}&rdquo;.
          </div>
        ) : filtered.map((t) => {
          const entry = byStaff.get(t.id);
          const isIn = !!entry && !entry.out_at;
          const isDone = !!entry?.out_at;
          return (
            <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                style={{ background: isIn ? "#10b981" : isDone ? "#6b7280" : "#1A0E4D" }}>
                {t.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{t.full_name}</p>
                <p className="text-[11px] text-purple-300">{t.class_name ?? "—"}</p>
                {entry?.in_at && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    In: {new Date(entry.in_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    {entry.out_at && ` · Out: ${new Date(entry.out_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                )}
              </div>
              {!entry && (
                <button type="button"
                  onClick={() => { checkInNow(t.id, t.full_name, "Teacher"); toast.success(`${t.full_name.split(" ")[0]} checked in`); }}
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "#10b981", color: "white" }}>
                  ✓ Check in
                </button>
              )}
              {isIn && (
                <button type="button"
                  onClick={() => { checkOutNow(t.id); toast.success(`${t.full_name.split(" ")[0]} checked out`); }}
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.18)", color: "#92400e", border: "1px solid rgba(245,158,11,0.35)" }}>
                  🚪 Check out
                </button>
              )}
              {isDone && (
                <span className="text-[11px] font-bold px-2 py-1 rounded-md text-gray-400">Done for today</span>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
