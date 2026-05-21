"use client";
import { useEffect, useRef, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

// School-gate check-in kiosk. Each student carries a QR / code that contains
// their student_id. Gate attendant scans (or types it in) — kiosk marks them
// present today with context: 'gate' and arrival_time.
//
// Works without a native scanner: paste the code in the field and tap Check
// in. If you load this page on a tablet with a USB barcode scanner attached,
// most cheap scanners type the code + an Enter keystroke automatically — the
// auto-focus + onSubmit on Enter handles that path too.

export default function GateKioskPage() {
  const gateCheckIn = useAppStore((s) => s.gateCheckIn);
  const attendance = useAppStore((s) => s.attendance);
  const today = new Date().toISOString().slice(0, 10);
  const todayGate = attendance.filter((a) => a.date === today && a.context === "gate");

  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the input focused so a USB / Bluetooth scanner's keystrokes always
  // land in the right field without anyone tapping first.
  useEffect(() => {
    const t = window.setInterval(() => inputRef.current?.focus(), 1500);
    return () => window.clearInterval(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const res = gateCheckIn(code);
    if (!res.ok) {
      toast.error(res.reason ?? "Couldn't check in");
    } else if (res.alreadyToday) {
      toast(`ℹ️ ${res.studentName} was already marked today.`, { duration: 4000 });
    } else {
      toast.success(`✅ Welcome ${res.studentName?.split(" ")[0]}! Marked present.`, { duration: 4000 });
    }
    setCode("");
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">🚪 Gate Check-in Kiosk</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Scan or type a student ID. {todayGate.length} student{todayGate.length === 1 ? "" : "s"} checked in today via the gate.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-white/80">Student ID</label>
          <input ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Type or scan…"
            autoFocus
            aria-label="Student ID"
            className="w-full px-4 py-4 rounded-xl text-2xl font-mono text-center text-gray-900 focus:outline-none"
            style={{ background: "white", border: "1px solid rgba(255,255,255,0.2)" }} />
          <button type="submit" className="btn-gold w-full py-3 text-lg font-black">
            ✅ Check in
          </button>
          <p className="text-[11px] text-center text-gray-400">
            USB / Bluetooth barcode scanners work automatically — they send the code + Enter.
          </p>
        </form>
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="font-bold text-white text-sm mb-2">📋 Checked in today via gate ({todayGate.length})</h3>
        {todayGate.length === 0 ? (
          <p className="text-xs text-gray-500">No gate check-ins yet today.</p>
        ) : (
          <ul className="space-y-1 max-h-72 overflow-y-auto">
            {todayGate.sort((a, b) => (b.arrival_time ?? "").localeCompare(a.arrival_time ?? "")).map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-emerald-400 font-bold">✅</span>
                <span className="font-bold text-white flex-1 truncate">{a.student_name}</span>
                <span className="text-gray-400">{a.class_name}</span>
                <span className="text-emerald-300 font-mono">🕐 {a.arrival_time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
