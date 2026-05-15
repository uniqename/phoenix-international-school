"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { todayISO } from "@/lib/utils";
import toast from "react-hot-toast";


export default function TeacherPickupPage() {
  const { user } = useAuth();
  const pickupCodes     = useAppStore((s) => s.pickupCodes);
  const verifyPickupCode = useAppStore((s) => s.verifyPickupCode);
  const markPickupUsed   = useAppStore((s) => s.markPickupUsed);
  const teachers        = useAppStore((s) => s.teachers);

  const teacher = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const today   = todayISO();

  const [codeInput, setCodeInput]   = useState("");
  const [result, setResult]         = useState<{
    type: "valid" | "invalid" | "used" | "expired";
    student?: string;
    className?: string;
    parent?: string;
    entryId?: string;
  } | null>(null);

  const todayCodes = pickupCodes.filter((pc) => pc.valid_date === today);
  const myClassCodes = teacher?.class_name
    ? todayCodes // show all today's codes — teacher might verify for any student
    : todayCodes;

  const handleVerify = () => {
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;

    const { student, entry } = verifyPickupCode(trimmed);

    if (!entry) {
      setResult({ type: "invalid" });
      return;
    }
    if (entry.used) {
      setResult({
        type: "used",
        student: student?.full_name,
        className: student?.class_name,
        parent: student?.parent_name,
      });
      return;
    }
    setResult({
      type: "valid",
      student: student?.full_name,
      className: student?.class_name,
      parent: student?.parent_name,
      entryId: entry.id,
    });
  };

  const handleConfirmPickup = () => {
    if (!result?.entryId) return;
    markPickupUsed(result.entryId);
    toast.success(`✅ ${result.student} released to parent/guardian`);
    setResult({ ...result, type: "used" });
    setCodeInput("");
  };

  const statusBg: Record<string, string> = {
    valid:   "rgba(34,197,94,0.1)",
    invalid: "rgba(239,68,68,0.1)",
    used:    "rgba(245,158,11,0.1)",
    expired: "rgba(100,116,139,0.1)",
  };
  const statusColor: Record<string, string> = {
    valid:   "#16a34a",
    invalid: "#dc2626",
    used:    "#d97706",
    expired: "#64748b",
  };
  const statusLabel: Record<string, string> = {
    valid:   "✅ Valid — OK to release",
    invalid: "❌ Code not found",
    used:    "⚠️ Already used today",
    expired: "🕐 Code expired",
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-black text-white">Pickup Code Verifier</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Parents receive a daily code to authorise student pickup. Enter the code below to verify.
          </p>
        </div>

        {/* Code entry */}
        <div className="glass rounded-2xl p-6 mb-5">
          <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
            Enter 6-digit pickup code
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase().slice(0, 6));
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="e.g. AB3X9K"
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl border-2 font-mono font-black text-lg tracking-[0.4em] text-center uppercase"
              style={{
                borderColor: result?.type === "valid" ? "#22c55e"
                  : result?.type === "invalid" ? "#ef4444"
                  : "rgba(0,48,135,0.2)",
                background: "#fff",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              className="btn-gold px-6 py-3 rounded-xl text-sm font-black"
            >
              Verify
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4 rounded-xl p-4" style={{ background: statusBg[result.type] }}>
              <div className="font-black text-sm mb-1" style={{ color: statusColor[result.type] }}>
                {statusLabel[result.type]}
              </div>
              {(result.student || result.parent) && (
                <div className="space-y-1 mt-2">
                  {result.student && (
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Student:</span> {result.student}
                      {result.className && <span className="text-gray-400 ml-1">({result.className})</span>}
                    </div>
                  )}
                  {result.parent && (
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Releasing to:</span> {result.parent}
                    </div>
                  )}
                </div>
              )}
              {result.type === "valid" && result.entryId && (
                <button
                  type="button"
                  onClick={handleConfirmPickup}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-black text-white"
                  style={{ background: "#16a34a" }}
                >
                  ✅ Confirm Release — Allow Pickup
                </button>
              )}
            </div>
          )}
        </div>

        {/* Today's active codes list */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-800 text-sm">Today's Pickup Codes</h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,48,135,0.08)", color: "#1A3FA0" }}>
              {todayCodes.length} issued
            </span>
          </div>

          {todayCodes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No pickup codes issued today yet.
            </p>
          ) : (
            <div className="space-y-2">
              {todayCodes.map((pc) => (
                <div key={pc.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: pc.used ? "rgba(100,116,139,0.06)" : "rgba(34,197,94,0.06)" }}>
                  <div>
                    <div className="font-mono font-black text-base tracking-widest text-gray-800">
                      {pc.code}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {pc.student_name ?? pc.student_id}
                    </div>
                  </div>
                  <div>
                    {pc.used ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
                        Used {pc.used_at ? new Date(pc.used_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 p-3 rounded-xl text-xs text-center"
          style={{ background: "rgba(107,33,168,0.06)", color: "#6B21A8" }}>
          🔒 Codes are valid for today only. Parents can request a new code each school day from their portal.
        </div>
      </div>
    </DashboardShell>
  );
}
