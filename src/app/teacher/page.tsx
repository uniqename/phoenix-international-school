import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const navItems = [
  { icon: "📊", label: "Overview", href: "/teacher" },
  { icon: "📡", label: "Attendance", href: "/teacher#attendance" },
  { icon: "📋", label: "Gradebook", href: "/teacher#grades" },
  { icon: "📝", label: "Lesson Planner", href: "/teacher#lessons" },
  { icon: "📚", label: "Homework", href: "/teacher#homework" },
  { icon: "📄", label: "Report Cards", href: "/teacher#reports" },
  { icon: "📸", label: "School Feed", href: "/teacher#feed" },
];

const classStudents = [
  { name: "Abena Frimpong", id: "P-2024-001", avg: 87, grade: 2, present: true, fees: "Cleared" },
  { name: "Kweku Owusu", id: "P-2024-002", avg: 74, grade: 3, present: true, fees: "Cleared" },
  { name: "Maame Asare", id: "P-2024-003", avg: 91, grade: 1, present: true, fees: "Cleared" },
  { name: "Yaw Mensah", id: "P-2024-004", avg: 62, grade: 4, present: false, fees: "Outstanding" },
  { name: "Akua Darko", id: "P-2024-005", avg: 55, grade: 5, present: true, fees: "Cleared" },
  { name: "Kofi Boateng", id: "P-2024-006", avg: 79, grade: 3, present: true, fees: "Outstanding" },
  { name: "Esi Nyarko", id: "P-2024-007", avg: 94, grade: 1, present: false, fees: "Cleared" },
];

const lessonStrands = [
  { subject: "Mathematics", strand: "Number and Algebra", sub: "Fractions & Decimals", week: "Week 14" },
  { subject: "English", strand: "Reading & Writing", sub: "Comprehension Passages", week: "Week 14" },
  { subject: "Science", strand: "Earth & Environment", sub: "Soil Types in Ghana", week: "Week 14" },
  { subject: "Social Studies", strand: "Our Nation Ghana", sub: "Traditional Governance", week: "Week 14" },
];

const gradeScale: Record<number, { label: string; color: string }> = {
  1: { label: "Excellent", color: "#22c55e" },
  2: { label: "Very Good", color: "#10b981" },
  3: { label: "Good", color: "#00D4FF" },
  4: { label: "Credit", color: "#f59e0b" },
  5: { label: "Pass", color: "#ef4444" },
  6: { label: "Weak Pass", color: "#ef4444" },
};

export default function TeacherPortal() {
  const present = classStudents.filter((s) => s.present).length;

  return (
    <DashboardShell title="Mrs. Adjoa Koomson" subtitle="JHS 2A · Form Teacher · Mathematics"
      role="Teacher" roleColor="#1565C0" navItems={navItems}>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Class", value: "JHS 2A", icon: "🏫", color: "#003087", bg: "rgba(0,48,135,0.08)" },
          { label: "Students", value: "32", icon: "🎒", color: "#1565C0", bg: "rgba(21,101,192,0.08)" },
          { label: "Present Today", value: `${present} / ${classStudents.length}`, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Avg Class Score", value: "76.8%", icon: "📊", color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 card-hover">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Attendance — Today</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              {present}/{classStudents.length} Present
            </span>
          </div>
          <div className="space-y-2">
            {classStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: s.present ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: s.present ? "#22c55e" : "#ef4444" }}>
                  {s.present ? "✓" : "✗"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.id}</div>
                </div>
                {!s.present && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Absent</span>
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #003087, #1565C0)" }}>
            Submit Attendance & Notify Parents
          </button>
        </div>

        {/* Gradebook */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">Gradebook — Maths SBA</h3>
            <span className="text-xs text-gray-400">Term 2 · Week 14</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3">Student</th>
                <th className="text-center pb-3">Score</th>
                <th className="text-center pb-3">Grade</th>
                <th className="text-center pb-3">Fees</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => {
                const gs = gradeScale[s.grade];
                return (
                  <tr key={s.id} className="table-row border-t border-gray-50">
                    <td className="py-2.5 text-gray-800 font-medium text-xs">{s.name}</td>
                    <td className="py-2.5 text-center font-black text-gray-900">{s.avg}%</td>
                    <td className="py-2.5 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: gs.color + "20", color: gs.color }}>
                        {s.grade} – {gs.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="text-xs">{s.fees === "Cleared" ? "✅" : "🔒"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NaCCA Lesson Planner */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">NaCCA / GES Lesson Planner</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
            GES Aligned
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {lessonStrands.map((l) => (
            <div key={l.subject} className="rounded-xl p-4 card-hover"
              style={{ background: "rgba(0,48,135,0.04)", border: "1px solid rgba(0,48,135,0.08)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-gray-900">{l.subject}</span>
                <span className="text-xs text-gray-400">{l.week}</span>
              </div>
              <div className="text-xs font-semibold text-blue-700 mb-0.5">{l.strand}</div>
              <div className="text-xs text-gray-500">{l.sub}</div>
              <button className="mt-2 text-xs text-blue-600 font-bold hover:underline">Generate Lesson Note →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Homework Upload */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-4">Upload Homework</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { subject: "Mathematics", due: "Mon 6 May", assigned: 30, submitted: 22 },
            { subject: "English", due: "Wed 8 May", assigned: 30, submitted: 28 },
            { subject: "Science", due: "Fri 10 May", assigned: 30, submitted: 15 },
          ].map((hw) => (
            <div key={hw.subject} className="rounded-xl p-4" style={{ background: "rgba(21,101,192,0.06)" }}>
              <div className="font-bold text-gray-900 text-sm mb-1">{hw.subject}</div>
              <div className="text-xs text-gray-400 mb-3">Due: {hw.due}</div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Submissions</span>
                <span className="font-bold text-gray-800">{hw.submitted}/{hw.assigned}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(hw.submitted / hw.assigned) * 100}%` }}></div>
              </div>
              <button className="mt-3 w-full text-xs py-1.5 rounded-lg font-bold text-white"
                style={{ background: "#1565C0" }}>+ Add Video Note</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Admin Dashboard", href: "/admin", icon: "🏛️", color: "#003087" },
          { label: "Parent Portal", href: "/parent", icon: "👨‍👩‍👧", color: "#1565C0" },
          { label: "Student Portal", href: "/student", icon: "🎒", color: "#E5B800" },
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
