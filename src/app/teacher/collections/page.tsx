"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function TeacherCollectionsPage() {
  const { user } = useAuth();
  const { dailyCollectionHubs, recordCanteenCollection } = useAppStore();

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [amount, setAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayHub = dailyCollectionHubs.find(
    (h) => h.date === today && h.status === "active"
  );

  const isAssigned =
    todayHub &&
    todayHub.assigned_teachers.some((t) => t.teacher_id === user?.id);

  useEffect(() => {
    if (!isAssigned) return;

    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isAssigned]);

  const handleRecordCollection = () => {
    if (!todayHub) {
      toast.error("No active hub for today");
      return;
    }
    if (!studentId || !studentName || !amount) {
      toast.error("Fill all fields");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    recordCanteenCollection(
      todayHub.id,
      user?.id || "",
      user?.full_name || "",
      studentId,
      studentName,
      numAmount
    );
    toast.success("Collection recorded");
    setStudentId("");
    setStudentName("");
    setAmount("");
  };

  if (!user || user.role !== "teacher") return null;

  if (!isAssigned) {
    return (
      <DashboardShell
        role="teacher"
        navItems={[
          { icon: "👥", label: "My Classes", href: "/teacher/classes" },
          { icon: "📝", label: "Attendance", href: "/teacher/attendance" },
          { icon: "📚", label: "Lessons", href: "/teacher/lessons" },
          { icon: "🏆", label: "Grades", href: "/teacher/grades" },
        ]}
      >
        <div className="max-w-2xl mx-auto space-y-6 p-6">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-white mb-2">
              No Collection Assignment Today
            </h2>
            <p className="text-sm text-gray-400">
              You are not assigned to collect canteen fees today. Check back tomorrow or contact your admin.
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="teacher"
      navItems={[
        { icon: "👥", label: "My Classes", href: "/teacher/classes" },
        { icon: "📝", label: "Attendance", href: "/teacher/attendance" },
        { icon: "📚", label: "Lessons", href: "/teacher/lessons" },
        { icon: "🏆", label: "Grades", href: "/teacher/grades" },
        { icon: "🍽️", label: "Collections", href: "/teacher/collections" },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🍽️ Canteen Collections</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(147,51,234,0.95)" }}>
            Record student canteen payments today.
          </p>
        </header>

        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Hub Status
              </label>
              <div className="mt-2 text-lg font-semibold text-green-400">
                ✓ Active Today
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Time Remaining
              </label>
              <div className="mt-2 text-lg font-semibold text-white">
                {timeRemaining || "loading..."}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Daily Total Collected
            </label>
            <div className="mt-2 text-3xl font-black text-yellow-400">
              GH₵ {todayHub.daily_total.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {todayHub.collections.length} collection{todayHub.collections.length !== 1 ? "s" : ""} recorded today
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">
            ➕ Record Collection
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <input
              type="number"
              placeholder="Amount (GH₵)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecordCollection()}
              className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <button
              onClick={handleRecordCollection}
              className="btn-gold w-full py-3 text-sm font-black"
            >
              Record Collection →
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">
            📋 Today's Collections ({todayHub.collections.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todayHub.collections.length > 0 ? (
              todayHub.collections.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div className="text-white">
                    <div className="font-semibold">{col.student_name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(col.recorded_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-white font-bold">GH₵ {col.amount.toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No collections recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
