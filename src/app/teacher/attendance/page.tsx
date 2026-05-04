"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { todayISO, CLASSES } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";
import toast from "react-hot-toast";

const NAV = [
  { icon: "📊", label: "Overview",      href: "/teacher" },
  { icon: "📡", label: "Attendance",     href: "/teacher/attendance" },
  { icon: "📋", label: "Gradebook",      href: "/teacher/gradebook" },
  { icon: "📝", label: "Lesson Planner", href: "/teacher/lessons" },
  { icon: "📚", label: "Homework",       href: "/teacher/homework" },
  { icon: "📸", label: "School Feed",    href: "/teacher/feed" },
  { icon: "❓", label: "Question Bank",  href: "/teacher/questions" },
  { icon: "🔐", label: "Pickup Verify",  href: "/teacher/pickup" },
];

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; bg: string }[] = [
  { value: "present", label: "Present", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { value: "absent",  label: "Absent",  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  { value: "late",    label: "Late",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "excused", label: "Excused", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
];

function buildStatuses(
  students: { id: string }[],
  existing: { student_id: string; status: AttendanceStatus }[]
): Record<string, AttendanceStatus> {
  const init: Record<string, AttendanceStatus> = {};
  students.forEach((s) => {
    const ex = existing.find((a) => a.student_id === s.id);
    init[s.id] = ex?.status ?? "present";
  });
  return init;
}

// ── Manual tab ──────────────────────────────────────────────────────────────

function ManualTab({
  activeClass, setActiveClass, user,
}: {
  activeClass: string;
  setActiveClass: (c: string) => void;
  user: { full_name?: string } | null;
}) {
  const students       = useAppStore((s) => s.students);
  const attendance     = useAppStore((s) => s.attendance);
  const saveAttendance = useAppStore((s) => s.saveAttendance);

  const myStudents = students.filter((s) => s.class_name === activeClass);
  const today      = todayISO();
  const existing   = attendance.filter((a) => a.date === today && a.class_name === activeClass);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() =>
    buildStatuses(myStudents, existing)
  );

  useEffect(() => {
    const fresh = attendance.filter((a) => a.date === today && a.class_name === activeClass);
    setStatuses(buildStatuses(students.filter((s) => s.class_name === activeClass), fresh));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass]);

  const handleSubmit = () => {
    const records: AttendanceRecord[] = myStudents.map((s) => ({
      id: existing.find((a) => a.student_id === s.id)?.id ?? `a${Date.now()}-${s.id}`,
      student_id: s.id,
      student_name: s.full_name,
      class_name: activeClass,
      date: today,
      status: statuses[s.id] ?? "present",
      parent_notified: false,
      marked_by: user?.full_name,
      context: "classroom",
    }));
    saveAttendance(records);
    const absentCount = records.filter((r) => r.status === "absent").length;
    toast.success(`Attendance saved · ${absentCount} absent — parents will be notified`);
  };

  const presentCount = Object.values(statuses).filter((v) => v === "present" || v === "late").length;
  const absentCount  = Object.values(statuses).filter((v) => v === "absent").length;

  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
          ✅ {presentCount} Present
        </span>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          ❌ {absentCount} Absent
        </span>
      </div>

      {/* Class switcher */}
      <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-black text-gray-600">Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {CLASSES.map((c) => (
            <button type="button" key={c} onClick={() => setActiveClass(c)}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={activeClass === c
                ? { background: "#1A3FA0", color: "white" }
                : { background: "rgba(26,63,160,0.07)", color: "#1A3FA0" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {myStudents.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏫</div>
          <p className="text-gray-500 text-sm">No students enrolled in {activeClass}.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500 font-bold self-center mr-1">Mark all as:</span>
            {STATUS_OPTIONS.map((o) => (
              <button type="button" key={o.value}
                onClick={() => setStatuses(() => Object.fromEntries(myStudents.map((s) => [s.id, o.value])))}
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: o.bg, color: o.color }}>
                {o.label}
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl p-4 mb-5">
            <div className="space-y-2">
              {myStudents.map((s) => {
                const cur = statuses[s.id] ?? "present";
                const curOpt = STATUS_OPTIONS.find((o) => o.value === cur)!;
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                      style={{ background: curOpt.color }}>
                      {s.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{s.full_name}</div>
                      <div className="text-xs text-gray-400">{s.student_id}</div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {STATUS_OPTIONS.map((o) => (
                        <button type="button" key={o.value}
                          onClick={() => setStatuses((p) => ({ ...p, [s.id]: o.value }))}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                          style={cur === o.value ? { background: o.color, color: "white" } : { background: o.bg, color: o.color }}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="button" onClick={handleSubmit} className="btn-gold w-full py-3 text-sm">
            Submit Attendance — {activeClass} &amp; Notify Absent Parents
          </button>

          {absentCount > 0 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              📲 {absentCount} parent{absentCount > 1 ? "s" : ""} will receive an absence notification.
            </p>
          )}
        </>
      )}
    </>
  );
}

// ── Scan Mode tab ────────────────────────────────────────────────────────────

type ScanContext = "classroom" | "bus";

interface ScannedEntry {
  student_id: string;
  student_name: string;
  class_name: string;
  status: AttendanceStatus;
  scanned_at: string;
}

function ScanModeTab({ user }: { user: { full_name?: string } | null }) {
  const students       = useAppStore((s) => s.students);
  const saveAttendance = useAppStore((s) => s.saveAttendance);

  const [context, setContext]   = useState<ScanContext>("classroom");
  const [input, setInput]       = useState("");
  const [scanned, setScanned]   = useState<ScannedEntry[]>([]);
  const [flash, setFlash]       = useState<{ ok: boolean; msg: string } | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const triggerFlash = (ok: boolean, msg: string) => {
    setFlash({ ok, msg });
    setTimeout(() => setFlash(null), 2000);
  };

  const findStudent = useCallback((query: string) => {
    const q = query.trim();
    // match by student_id (exact) or last 4 digits (PIN)
    return students.find(
      (s) =>
        s.student_id.toLowerCase() === q.toLowerCase() ||
        s.student_id.slice(-4) === q
    );
  }, [students]);

  const processEntry = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const student = findStudent(q);
    if (!student) {
      triggerFlash(false, `Not found: "${q}"`);
      return;
    }
    const already = scanned.find((e) => e.student_id === student.id);
    if (already) {
      triggerFlash(false, `Already scanned: ${student.full_name}`);
      return;
    }
    const entry: ScannedEntry = {
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
      status: "present",
      scanned_at: new Date().toISOString(),
    };
    setScanned((prev) => [entry, ...prev]);
    triggerFlash(true, `✅ ${student.full_name}`);
    setInput("");
    inputRef.current?.focus();
  }, [scanned, findStudent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      processEntry(input);
    }
  };

  const removeEntry = (studentId: string) =>
    setScanned((prev) => prev.filter((e) => e.student_id !== studentId));

  const toggleStatus = (studentId: string) =>
    setScanned((prev) =>
      prev.map((e) =>
        e.student_id === studentId
          ? { ...e, status: e.status === "present" ? "late" : "present" }
          : e
      )
    );

  const handleSave = () => {
    if (scanned.length === 0) {
      toast.error("No students scanned yet");
      return;
    }
    const today = todayISO();
    const records: AttendanceRecord[] = scanned.map((e) => ({
      id: `scan${Date.now()}-${e.student_id}`,
      student_id: e.student_id,
      student_name: e.student_name,
      class_name: e.class_name,
      date: today,
      status: e.status,
      parent_notified: false,
      marked_by: user?.full_name,
      context,
    }));
    saveAttendance(records);
    toast.success(`${scanned.length} students marked present on ${context === "bus" ? "bus 🚌" : "classroom 🏫"}`);
    setScanned([]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      toast.error("Camera permission denied. Use ID / PIN entry instead.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  // cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-5">

      {/* Context toggle */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs font-black text-gray-600 uppercase tracking-wider mb-3">Scan Context</div>
        <div className="flex gap-3">
          {(["classroom", "bus"] as ScanContext[]).map((ctx) => (
            <button type="button" key={ctx}
              onClick={() => setContext(ctx)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all"
              style={context === ctx
                ? { background: ctx === "bus" ? "#f59e0b" : "#1A3FA0", color: "white" }
                : { background: ctx === "bus" ? "rgba(245,158,11,0.1)" : "rgba(26,63,160,0.08)", color: ctx === "bus" ? "#d97706" : "#1A3FA0" }}>
              {ctx === "bus" ? "🚌 Bus" : "🏫 Classroom"}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">
          {context === "bus"
            ? "Recording who boarded the bus this morning"
            : "Recording classroom register for today"}
        </p>
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-4">
        <div className="text-xs font-black text-gray-600 uppercase tracking-wider mb-3">
          Enter Student ID or 4-digit PIN
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Student ID or last 4 digits…"
            className="flex-1 px-4 py-3 rounded-xl border-2 font-mono text-sm"
            style={{
              borderColor: flash ? (flash.ok ? "#22c55e" : "#ef4444") : "rgba(26,63,160,0.2)",
              background: flash ? (flash.ok ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)") : "#fff",
              outline: "none",
            }}
            autoFocus
          />
          <button type="button" onClick={() => processEntry(input)}
            className="btn-gold px-5 py-3 rounded-xl text-sm font-black">
            Mark
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono">Enter</kbd> after each student · PIN = last 4 digits of Student ID
        </p>

        {/* Flash feedback */}
        {flash && (
          <div className="mt-3 px-4 py-2.5 rounded-xl font-bold text-sm text-center transition-all"
            style={{ background: flash.ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: flash.ok ? "#16a34a" : "#dc2626" }}>
            {flash.msg}
          </div>
        )}
      </div>

      {/* Camera */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-black text-gray-600 uppercase tracking-wider">Camera (Visual Aid)</div>
          <button type="button"
            onClick={cameraOn ? stopCamera : startCamera}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={cameraOn
              ? { background: "rgba(239,68,68,0.1)", color: "#dc2626" }
              : { background: "rgba(26,63,160,0.08)", color: "#1A3FA0" }}>
            {cameraOn ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl"
            style={{ maxHeight: "240px", objectFit: "cover", background: "#000" }}
          />
        ) : (
          <div className="rounded-xl flex items-center justify-center py-8"
            style={{ background: "rgba(0,0,0,0.04)", border: "2px dashed rgba(0,0,0,0.1)" }}>
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-1">📷</div>
              <div className="text-xs">Camera off — tap to start for visual confirmation</div>
            </div>
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
          Camera shows student's face for visual confirmation. ID/PIN entry still required.
        </p>
      </div>

      {/* Scanned list */}
      {scanned.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-black text-gray-700 uppercase tracking-wider">
              Checked In — {scanned.length} students
            </div>
            <button type="button"
              onClick={handleSave}
              className="btn-gold text-sm px-5 py-2 rounded-xl">
              Save &amp; Finish
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {scanned.map((e) => (
              <div key={e.student_id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: e.status === "late" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.07)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: e.status === "late" ? "#f59e0b" : "#22c55e" }}>
                    {e.student_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{e.student_name}</div>
                    <div className="text-[10px] text-gray-400">{e.class_name} · {new Date(e.scanned_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => toggleStatus(e.student_id)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={e.status === "late"
                      ? { background: "rgba(245,158,11,0.15)", color: "#d97706" }
                      : { background: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
                    {e.status === "late" ? "Late" : "Present"}
                  </button>
                  <button type="button"
                    onClick={() => removeEntry(e.student_id)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanned.length > 0 && (
        <button type="button" onClick={handleSave} className="btn-gold w-full py-3 text-sm">
          💾 Save {scanned.length} {context === "bus" ? "🚌 Bus" : "🏫 Classroom"} Check-ins
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function TeacherAttendancePage() {
  const { user }   = useAuth();
  const teachers   = useAppStore((s) => s.teachers);
  const teacher    = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];

  const [tab, setTab]             = useState<"manual" | "scan">("manual");
  const [activeClass, setActiveClass] = useState(teacher?.class_name ?? "JHS 3A");

  const today = todayISO();

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Attendance</h2>
          <p className="text-xs text-gray-500">
            {new Date(today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: "rgba(26,63,160,0.2)" }}>
          {([
            { key: "manual", label: "📋 Manual Register" },
            { key: "scan",   label: "📲 Scan Mode" },
          ] as const).map(({ key, label }) => (
            <button type="button" key={key}
              onClick={() => setTab(key)}
              className="px-4 py-2 text-xs font-black transition-all"
              style={tab === key
                ? { background: "#1A3FA0", color: "white" }
                : { background: "transparent", color: "#1A3FA0" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "manual" ? (
        <ManualTab activeClass={activeClass} setActiveClass={setActiveClass} user={user} />
      ) : (
        <ScanModeTab user={user} />
      )}
    </DashboardShell>
  );
}
