"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESColor, getGESLabel, calculateAggregate, aggregateRating } from "@/lib/utils";
import toast from "react-hot-toast";

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const NAV = [
  { icon: "🏠", label: "Dashboard",    href: "/student" },
  { icon: "📊", label: "My Grades",    href: "/student#grades" },
  { icon: "📚", label: "Homework",     href: "/student#homework" },
  { icon: "🎓", label: "BECE Prep",    href: "/bece" },
  { icon: "📸", label: "School Feed",  href: "/student#feed" },
];

export default function StudentPortal() {
  const { user }   = useAuth();
  const students   = useAppStore((s) => s.students);
  const grades     = useAppStore((s) => s.grades);
  const homework   = useAppStore((s) => s.homework);
  const beceAttempts = useAppStore((s) => s.beceAttempts);
  const feedPosts  = useAppStore((s) => s.feedPosts);
  const likePost   = useAppStore((s) => s.likePost);
  const homeworkSubmissions = useAppStore((s) => s.homeworkSubmissions);
  const submitHomeworkFn    = useAppStore((s) => s.submitHomework);

  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});

  const student    = students.find((s) => s.full_name === user?.full_name) ?? students[0];
  const myGrades   = grades.filter((g) => g.student_id === student?.id);
  const myHW       = homework.filter((h) => h.class_name === student?.class_name);
  const myAttempts = beceAttempts.filter((a) => a.student_id === student?.id);

  const mySubmissions = Object.fromEntries(
    homeworkSubmissions.filter((s) => s.student_id === student?.id).map((s) => [s.homework_id, s])
  );

  const handleSubmit = (hwId: string) => {
    const file = pendingFiles[hwId];
    if (!file || !student) return;
    submitHomeworkFn(hwId, student.id, student.full_name, file.name, file.type, file.size);
    setPendingFiles((p) => ({ ...p, [hwId]: null }));
    toast.success("Homework submitted successfully!");
  };

  const aggregate = myGrades.length ? calculateAggregate(myGrades) : null;
  const avgScore  = myGrades.length ? Math.round(myGrades.reduce((s, g) => s + g.raw_score, 0) / myGrades.length) : null;

  const subjectScores = myGrades.map((g) => ({ subject: g.subject, score: g.raw_score, ges: g.ges_grade }));
  const weakSubjects  = subjectScores.filter((s) => s.score < 60).sort((a, b) => a.score - b.score);

  return (
    <DashboardShell role="student" navItems={NAV}>
      {/* Hero */}
      <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        style={{ background: "linear-gradient(135deg, #E5B800, #FFD700)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: "rgba(0,0,0,0.1)" }}>
          {student?.gender === "female" ? "👧" : "👦"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-black text-black mb-0.5">{student?.full_name ?? user?.full_name}</h2>
          <p className="text-yellow-800 text-sm mb-2">{student?.class_name} · {student?.student_id}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {avgScore !== null && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">Avg: {avgScore}%</span>}
            {aggregate !== null && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">Aggregate: {aggregate}</span>}
            {myAttempts.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">BECE Attempts: {myAttempts.length}</span>}
          </div>
        </div>
        <Link href="/bece"
          className="whitespace-nowrap text-sm px-5 py-2.5 rounded-full font-black flex-shrink-0"
          style={{ background: "#0A1628", color: "#FFD700" }}>
          BECE Practice →
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Grades */}
        <div id="grades" className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">My Grades — Term {myGrades[0]?.term ?? 2}</h3>
          {myGrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No grades available yet.</p>
          ) : (
            <>
              <div className="space-y-2.5 mb-3">
                {myGrades.map((g) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-28 text-xs font-semibold text-gray-600 truncate">{g.subject}</div>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${g.raw_score}%`, background: getGESColor(g.ges_grade) }} />
                    </div>
                    <div className="w-8 text-xs font-black text-gray-900">{g.raw_score}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: getGESColor(g.ges_grade) + "20", color: getGESColor(g.ges_grade) }}>
                      {getGESLabel(g.ges_grade)}
                    </span>
                  </div>
                ))}
              </div>
              {aggregate !== null && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black" style={{ color: "#E5B800" }}>{aggregate}</div>
                    <div className="text-xs text-gray-600">{aggregateRating(aggregate)}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Homework */}
        <div id="homework" className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Homework Due</h3>
          {myHW.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No homework assigned.</p>
          ) : (
            <div className="space-y-3">
              {myHW.map((hw) => {
                const overdue    = new Date(hw.due_date) < new Date();
                const submission = mySubmissions[hw.id];
                const pending    = pendingFiles[hw.id];
                return (
                  <div key={hw.id} className="p-3 rounded-xl"
                    style={{ background: overdue ? "rgba(239,68,68,0.05)" : "rgba(0,48,135,0.05)" }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-black text-gray-800">{hw.subject}</span>
                      <span className={`text-[10px] font-bold ${overdue ? "text-red-500" : "text-orange-500"}`}>
                        {overdue ? "Overdue" : `Due ${hw.due_date}`}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 mb-0.5">{hw.title}</div>
                    {hw.description && (
                      <div className="text-[11px] text-gray-500 mb-1">{hw.description}</div>
                    )}
                    {hw.video_url && (
                      <a href={hw.video_url} target="_blank" rel="noreferrer"
                        className="text-[11px] text-blue-600 font-bold hover:underline mb-1 block">
                        📹 Watch explanation
                      </a>
                    )}

                    {/* Submission status / upload */}
                    {submission ? (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg"
                        style={{ background: "rgba(34,197,94,0.1)" }}>
                        <span className="text-xs font-black text-green-600">✅ Submitted</span>
                        <span className="text-[11px] text-gray-600 truncate flex-1">{submission.file_name}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtSize(submission.file_size)}</span>
                        <label className="cursor-pointer text-[10px] text-blue-500 font-bold flex-shrink-0 hover:underline">
                          Replace
                          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFiles((p) => ({ ...p, [hw.id]: f })); e.target.value = ""; }} />
                        </label>
                      </div>
                    ) : pending ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0 text-[11px] text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 truncate">
                          📄 {pending.name} <span className="text-gray-400">({fmtSize(pending.size)})</span>
                        </div>
                        <button type="button" onClick={() => handleSubmit(hw.id)}
                          className="text-xs font-black px-3 py-1.5 rounded-lg flex-shrink-0"
                          style={{ background: "#22c55e", color: "white" }}>Submit →</button>
                        <button type="button" onClick={() => setPendingFiles((p) => ({ ...p, [hw.id]: null }))}
                          className="text-xs text-gray-400 hover:text-red-400 flex-shrink-0">✕</button>
                      </div>
                    ) : (
                      <label className="mt-2 cursor-pointer inline-block">
                        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFiles((p) => ({ ...p, [hw.id]: f })); e.target.value = ""; }} />
                        <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg inline-block"
                          style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                          📎 Attach & Submit Work
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BECE Weak Areas */}
      {weakSubjects.length > 0 && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(135deg, #0A1628, #003087)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white">🎯 BECE — Weak Areas to Focus On</h3>
            <Link href="/bece" className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: "#FFD700", color: "#0A1628" }}>Practice Now →</Link>
          </div>
          <div className="space-y-2">
            {weakSubjects.map((s) => (
              <div key={s.subject} className="flex items-center gap-3">
                <div className="w-24 text-xs text-blue-300 font-semibold">{s.subject}</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: getGESColor(s.ges) }} />
                </div>
                <span className="text-xs font-black text-white w-8">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BECE Practice History */}
      {myAttempts.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-3">BECE Practice History</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {myAttempts.slice(-8).map((a) => (
              <div key={a.id} className="p-3 rounded-xl text-center"
                style={{ background: a.percentage >= 70 ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)" }}>
                <div className="text-xs font-bold text-gray-700">{a.subject}</div>
                <div className="text-xl font-black mt-1" style={{ color: a.percentage >= 70 ? "#22c55e" : "#f59e0b" }}>
                  {a.percentage}%
                </div>
                <div className="text-[10px] text-gray-400">{a.score}/{a.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div id="feed" className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-3">📸 School Feed</h3>
        <div className="space-y-2">
          {feedPosts.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate">{p.title}</div>
                <div className="text-[10px] text-gray-400">{p.author_name}</div>
              </div>
              <button type="button" onClick={() => likePost(p.id)}
                className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ml-2 flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                ❤️ {p.likes}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
