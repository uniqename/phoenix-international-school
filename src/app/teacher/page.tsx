"use client";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESColor, getGESLabel, todayISO, CLASSES } from "@/lib/utils";

const NAV = [
  { icon: "📊", label: "Overview",      href: "/teacher" },
  { icon: "📡", label: "Attendance",     href: "/teacher/attendance" },
  { icon: "📋", label: "Gradebook",      href: "/teacher/gradebook" },
  { icon: "📝", label: "Lesson Planner", href: "/teacher/lessons" },
  { icon: "📚", label: "Homework",       href: "/teacher/homework" },
  { icon: "📸", label: "School Feed",    href: "/teacher/feed" },
  { icon: "❓", label: "Question Bank", href: "/teacher/questions" },
  { icon: "🔐", label: "Pickup Verify",  href: "/teacher/pickup" },
];

export default function TeacherOverview() {
  const { user }   = useAuth();
  const students   = useAppStore((s) => s.students);
  const attendance = useAppStore((s) => s.attendance);
  const grades     = useAppStore((s) => s.grades);
  const homework   = useAppStore((s) => s.homework);
  const teachers   = useAppStore((s) => s.teachers);

  const teacher    = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const [activeClass, setActiveClass] = React.useState(teacher?.class_name ?? "JHS 3A");
  const myClass    = activeClass;
  const myStudents = students.filter((s) => s.class_name === myClass);

  const today      = todayISO();
  const todayAtt   = attendance.filter((a) => a.date === today && a.class_name === myClass);
  const present    = todayAtt.filter((a) => a.status === "present" || a.status === "late").length;
  const myGrades   = grades.filter((g) => g.class_name === myClass);
  const avgScore   = myGrades.length ? Math.round(myGrades.reduce((s, g) => s + g.raw_score, 0) / myGrades.length) : 0;
  const myHW       = homework.filter((h) => h.class_name === myClass);

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-gray-900">Welcome, {user?.full_name?.split(" ")[0]}</h2>
        <p className="text-sm text-gray-500">{teacher?.subjects?.join(", ")}</p>
      </div>

      {/* Class switcher */}
      <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-black text-gray-600">Viewing Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {CLASSES.map((c) => (
            <button type="button" key={c} onClick={() => setActiveClass(c)}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={activeClass === c
                ? { background: "#003087", color: "white" }
                : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "My Class",      value: myClass,                                    icon: "🏫", color: "#003087" },
          { label: "Students",      value: myStudents.length,                           icon: "🎒", color: "#1565C0" },
          { label: "Present Today", value: todayAtt.length ? `${present}/${todayAtt.length}` : "—", icon: "✅", color: "#22c55e" },
          { label: "Class Avg",     value: avgScore ? `${avgScore}%` : "—",             icon: "📊", color: "#FFD700" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 card-hover">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Today's class */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Today&apos;s Attendance — {myClass}</h3>
            <Link href="/teacher/attendance" className="text-xs text-blue-600 font-bold hover:underline">Mark →</Link>
          </div>
          {todayAtt.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">Not yet marked for today.</p>
              <Link href="/teacher/attendance" className="btn-gold text-xs py-2 px-5">Mark Attendance</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAtt.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: a.status === "present" ? "rgba(34,197,94,0.05)" : a.status === "late" ? "rgba(245,158,11,0.05)" : "rgba(239,68,68,0.05)" }}>
                  <span className="text-sm font-semibold text-gray-800">{a.student_name}</span>
                  <span className="text-xs font-bold capitalize" style={{ color: a.status === "present" ? "#22c55e" : a.status === "late" ? "#f59e0b" : "#ef4444" }}>
                    {a.status}
                  </span>
                </div>
              ))}
              {todayAtt.length > 6 && <p className="text-xs text-gray-400 text-center">+{todayAtt.length - 6} more</p>}
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Recent Grades</h3>
            <Link href="/teacher/gradebook" className="text-xs text-blue-600 font-bold hover:underline">Enter Grades →</Link>
          </div>
          {myGrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No grades entered yet.</p>
          ) : (
            <div className="space-y-2">
              {myGrades.slice(0, 6).map((g) => (
                <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <div>
                    <div className="text-xs font-bold text-gray-800">{g.student_name}</div>
                    <div className="text-[10px] text-gray-400">{g.subject}</div>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: getGESColor(g.ges_grade) + "20", color: getGESColor(g.ges_grade) }}>
                    {g.raw_score}% · {getGESLabel(g.ges_grade)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Homework summary */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">Homework Assigned</h3>
          <Link href="/teacher/homework" className="text-xs text-blue-600 font-bold hover:underline">Manage →</Link>
        </div>
        {myHW.length === 0 ? (
          <p className="text-sm text-gray-400">No homework assigned yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {myHW.map((hw) => (
              <div key={hw.id} className="rounded-xl p-3" style={{ background: "rgba(21,101,192,0.06)" }}>
                <div className="text-xs font-black text-gray-900">{hw.subject}</div>
                <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{hw.title}</div>
                <div className="text-[11px] text-orange-500 font-bold mt-2">Due: {hw.due_date}</div>
                {hw.submission_count !== undefined && (
                  <div className="mt-1">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Submissions</span><span>{hw.submission_count}/{hw.total_students ?? myStudents.length}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((hw.submission_count ?? 0) / (hw.total_students ?? myStudents.length)) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
