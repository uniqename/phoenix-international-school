import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const navItems = [
  { icon: "🏠", label: "My Dashboard", href: "/student" },
  { icon: "📅", label: "My Schedule", href: "/student#schedule" },
  { icon: "📚", label: "Homework", href: "/student#homework" },
  { icon: "📊", label: "My Grades", href: "/student#grades" },
  { icon: "🎓", label: "BECE Prep", href: "/bece" },
  { icon: "📸", label: "School Feed", href: "/student#feed" },
];

const grades = [
  { subject: "Mathematics", score: 82, grade: 2, change: "+5" },
  { subject: "English", score: 76, grade: 3, change: "-2" },
  { subject: "Integrated Science", score: 89, grade: 2, change: "+8" },
  { subject: "Social Studies", score: 91, grade: 1, change: "+3" },
  { subject: "ICT", score: 74, grade: 3, change: "0" },
  { subject: "French", score: 61, grade: 5, change: "-4" },
];

const gradeColors: Record<number, string> = {
  1: "#22c55e", 2: "#10b981", 3: "#00D4FF", 4: "#f59e0b", 5: "#ef4444", 6: "#ef4444",
};
const gradeLabels: Record<number, string> = {
  1: "Excellent", 2: "Very Good", 3: "Good", 4: "Credit", 5: "Pass", 6: "Weak Pass",
};

const homework = [
  { subject: "Mathematics", task: "Exercises 14.1–14.4: Fractions", due: "Mon 6 May", done: false },
  { subject: "English", task: "Write a 2-page essay on 'My Community'", due: "Wed 8 May", done: true },
  { subject: "Science", task: "Draw and label types of soil in Ghana", due: "Fri 10 May", done: false },
];

const schedule = [
  { time: "7:30", subj: "Assembly / Morning Devotion", room: "Hall" },
  { time: "8:00", subj: "Mathematics", room: "JHS 3A" },
  { time: "9:00", subj: "English Language", room: "JHS 3A" },
  { time: "10:00", subj: "Break", room: "Canteen" },
  { time: "10:30", subj: "Integrated Science", room: "Lab" },
  { time: "11:30", subj: "Social Studies", room: "JHS 3A" },
  { time: "12:30", subj: "Lunch", room: "Canteen" },
  { time: "1:30", subj: "ICT", room: "Computer Lab" },
  { time: "2:30", subj: "French", room: "JHS 3A" },
];

const beceSubjects = [
  { subj: "Mathematics", score: 71, total: 100, weakness: "Mensuration & Algebra" },
  { subj: "English", score: 66, total: 100, weakness: "Summary Writing" },
  { subj: "Science", score: 74, total: 100, weakness: "Genetics" },
  { subj: "Social Studies", score: 82, total: 100, weakness: "History: Independence" },
  { subj: "French", score: 55, total: 100, weakness: "Verb conjugation" },
];

export default function StudentPortal() {
  const avg = Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length);
  const aggregate = grades.reduce((s, g) => s + g.grade, 0);

  return (
    <DashboardShell title="Kwame Mensah" subtitle="JHS 3A · Student ID: JHS-2024-088"
      role="Student" roleColor="#E5B800" navItems={navItems}>

      {/* Hero card */}
      <div className="rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        style={{ background: "linear-gradient(135deg, #E5B800, #FFD700)" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: "rgba(0,0,0,0.1)" }}>👦</div>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-black text-2xl text-black mb-1">Kwame Mensah</div>
          <div className="text-yellow-800 text-sm mb-3">JHS 3A · Phoenix International School</div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/10 text-black">Avg: {avg}%</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/10 text-black">Aggregate: {aggregate}</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/10 text-black">Rank: 7 / 27</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/10 text-black">BECE: Nov 2026</span>
          </div>
        </div>
        <Link href="/bece" className="whitespace-nowrap text-sm px-5 py-2.5 rounded-full font-black"
          style={{ background: "#0A1628", color: "#FFD700" }}>
          Start BECE Practice →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Grades */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">My Grades — Term 2</h3>
            <div className="flex gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#E5B800" }}>
                Avg: {avg}%
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                Agg: {aggregate}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {grades.map((g) => {
              const color = gradeColors[g.grade];
              return (
                <div key={g.subject} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-semibold text-gray-600 truncate">{g.subject}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${g.score}%`, background: color }}></div>
                  </div>
                  <div className="w-8 text-xs font-black text-gray-900">{g.score}</div>
                  <div className="w-16 text-center">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: color + "20", color }}>
                      {gradeLabels[g.grade]}
                    </span>
                  </div>
                  <div className={`w-8 text-xs font-bold text-center ${g.change.startsWith("+") ? "text-green-500" : g.change === "0" ? "text-gray-400" : "text-red-500"}`}>
                    {g.change}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div className="text-xs text-gray-500 mb-1">Current BECE Aggregate Estimate</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black" style={{ color: "#E5B800" }}>{aggregate}</div>
              <div className="text-xs text-gray-500">
                {aggregate <= 8 ? "🟢 Excellent — Top SHS likely" :
                 aggregate <= 12 ? "🔵 Very Good — Good SHS placement" :
                 aggregate <= 18 ? "🟡 Good — Keep improving" :
                 "🔴 Needs serious improvement"}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Today&apos;s Schedule</h3>
          <div className="space-y-1.5 overflow-y-auto max-h-72 scrollbar-hide">
            {schedule.map((s, i) => (
              <div key={i} className={`flex gap-3 p-2 rounded-xl ${i === 1 ? "border-l-4" : ""}`}
                style={i === 1 ? { background: "rgba(0,48,135,0.06)", borderColor: "#003087" } : {}}>
                <div className="text-xs font-bold w-10 text-gray-400 flex-shrink-0 pt-0.5">{s.time}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{s.subj}</div>
                  <div className="text-[10px] text-gray-400">{s.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Homework */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="font-black text-gray-900 mb-4">Homework Due</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {homework.map((hw) => (
            <div key={hw.subject} className={`rounded-xl p-4 ${hw.done ? "opacity-60" : ""}`}
              style={{ background: hw.done ? "rgba(34,197,94,0.06)" : "rgba(0,48,135,0.06)", border: `1px solid ${hw.done ? "rgba(34,197,94,0.2)" : "rgba(0,48,135,0.1)"}` }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-black text-gray-700">{hw.subject}</span>
                {hw.done ? <span className="text-green-500 text-sm">✅</span> : <span className="text-orange-400 text-sm">⏳</span>}
              </div>
              <div className="text-xs text-gray-600 mb-2">{hw.task}</div>
              <div className="text-[11px] font-bold" style={{ color: hw.done ? "#22c55e" : "#f59e0b" }}>
                Due: {hw.due}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BECE Subject Weakness */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "linear-gradient(135deg, #0A1628, #003087)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h3 className="font-black text-white">BECE Weak Areas — Fix These First</h3>
          </div>
          <Link href="/bece" className="text-xs font-bold px-4 py-2 rounded-full"
            style={{ background: "#FFD700", color: "#0A1628" }}>Start Pasco →</Link>
        </div>
        <div className="space-y-3">
          {beceSubjects.map((s) => {
            const pct = s.score;
            const color = pct >= 80 ? "#22c55e" : pct >= 70 ? "#00D4FF" : pct >= 60 ? "#f59e0b" : "#ef4444";
            return (
              <div key={s.subj} className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold text-blue-300">{s.subj}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-white/10 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}></div>
                    </div>
                    <span className="text-xs font-bold text-white">{pct}%</span>
                  </div>
                  {pct < 70 && (
                    <div className="text-[10px] text-orange-300">⚠️ Weak: {s.weakness}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Admin Dashboard", href: "/admin", icon: "🏛️", color: "#003087" },
          { label: "Teacher Portal", href: "/teacher", icon: "👩‍🏫", color: "#1565C0" },
          { label: "Parent Portal", href: "/parent", icon: "👨‍👩‍👧", color: "#1565C0" },
          { label: "BECE Simulator", href: "/bece", icon: "🎓", color: "#8b5cf6" },
        ].map((l) => (
          <Link key={l.href} href={l.href}
            className="glass rounded-xl p-3 flex items-center gap-2 text-xs font-semibold card-hover"
            style={{ color: l.color }}>
            <span className="text-lg">{l.icon}</span>{l.label}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
