import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const navItems = [
  { icon: "🏠", label: "My Dashboard", href: "/parent" },
  { icon: "💳", label: "Pay Fees (MoMo)", href: "/parent#fees" },
  { icon: "📡", label: "Attendance", href: "/parent#attendance" },
  { icon: "📄", label: "Report Card", href: "/parent#reports" },
  { icon: "📚", label: "Homework", href: "/parent#homework" },
  { icon: "🍼", label: "Daily Log (Crèche)", href: "/parent#dailylog" },
  { icon: "🔐", label: "Pick-up Code", href: "/parent#pickup" },
  { icon: "📸", label: "School Feed", href: "/parent#feed" },
];

const notifications = [
  { icon: "📡", msg: "Abena was marked present today at 7:48 AM", time: "7:48 AM", color: "#22c55e" },
  { icon: "📝", msg: "Mathematics homework due Monday 6 May", time: "Yesterday", color: "#00D4FF" },
  { icon: "💳", msg: "Fee payment of GH₵800 confirmed via MTN MoMo", time: "2 days ago", color: "#003087" },
  { icon: "📢", msg: "School closed Friday 9 May — Public holiday", time: "3 days ago", color: "#f59e0b" },
];

const reportCard = [
  { subject: "Mathematics", score: 87, grade: 2, label: "Very Good" },
  { subject: "English Language", score: 79, grade: 3, label: "Good" },
  { subject: "Integrated Science", score: 82, grade: 2, label: "Very Good" },
  { subject: "Social Studies", score: 91, grade: 1, label: "Excellent" },
  { subject: "ICT", score: 76, grade: 3, label: "Good" },
  { subject: "French", score: 68, grade: 4, label: "Credit" },
];

const gradeColors: Record<number, string> = {
  1: "#22c55e", 2: "#10b981", 3: "#00D4FF", 4: "#f59e0b", 5: "#ef4444",
};

const attendanceHistory = [
  { month: "Jan", days: 20, present: 19 },
  { month: "Feb", days: 18, present: 18 },
  { month: "Mar", days: 22, present: 20 },
  { month: "Apr", days: 19, present: 19 },
  { month: "May", days: 3, present: 2 },
];

const creecheLog = [
  { time: "7:30 AM", event: "Arrival", note: "Happy & active", icon: "🌟" },
  { time: "9:00 AM", event: "Breakfast", note: "Ate well — porridge & egg", icon: "🍳" },
  { time: "10:30 AM", event: "Nap Time", note: "Slept 45 mins", icon: "😴" },
  { time: "12:00 PM", event: "Lunch", note: "Rice & stew — full portion", icon: "🍽️" },
  { time: "2:00 PM", event: "Activity", note: "Painting & drawing", icon: "🎨" },
];

export default function ParentPortal() {
  return (
    <DashboardShell title="Mr. & Mrs. Asante" subtitle="Parent of Abena Asante · Primary 5B"
      role="Parent" roleColor="#1565C0" navItems={navItems}>

      {/* Child Card */}
      <div className="rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        style={{ background: "linear-gradient(135deg, #003087, #1565C0)" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>👧</div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-white font-black text-2xl mb-1">Abena Asante</div>
          <div className="text-blue-200 text-sm mb-3">Primary 5B · ID: P-2024-001 · Age: 11</div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: "rgba(34,197,94,0.2)", color: "#86efac" }}>✅ Fees Cleared</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: "rgba(255,215,0,0.2)", color: "#FFD700" }}>Avg: 80.5%</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>Rank: 5 / 32</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-gold text-xs whitespace-nowrap">Pay Fees via MoMo</button>
          <button className="btn-outline text-xs whitespace-nowrap">View Report Card</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Fee Summary */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Fee Summary</h3>
          <div className="space-y-3">
            {[
              { label: "School Fees (Term 2)", amount: "GH₵800", paid: true },
              { label: "Canteen Wallet Balance", amount: "GH₵45.00", paid: true },
              { label: "Bus Fee", amount: "GH₵200", paid: true },
              { label: "Excursion (Optional)", amount: "GH₵150", paid: false },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{f.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{f.amount}</span>
                  <span className="text-xs">{f.paid ? "✅" : "⏳"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div className="text-xs text-gray-500 mb-1">Canteen Wallet</div>
            <div className="text-xl font-black" style={{ color: "#E5B800" }}>GH₵45.00</div>
            <button className="mt-2 w-full text-xs py-2 rounded-lg font-bold"
              style={{ background: "rgba(255,215,0,0.2)", color: "#E5B800" }}>Top Up via MoMo</button>
          </div>
        </div>

        {/* Attendance */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Attendance This Term</h3>
          <div className="space-y-3">
            {attendanceHistory.map((a) => {
              const pct = Math.round((a.present / a.days) * 100);
              return (
                <div key={a.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{a.month}</span>
                    <span className="font-bold text-gray-900">{a.present}/{a.days} days</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : pct >= 90 ? "#00D4FF" : "#f59e0b" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-black" style={{ color: "#22c55e" }}>96.3%</div>
            <div className="text-xs text-gray-400">Overall attendance rate</div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-xl" style={{ background: n.color + "08" }}>
                <span className="text-lg">{n.icon}</span>
                <div>
                  <div className="text-xs text-gray-700 leading-snug">{n.msg}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Card */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">Report Card — Term 2, 2026</h3>
          <div className="flex gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              Class Rank: 5th / 32
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#E5B800" }}>
              Avg: 80.5%
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {reportCard.map((s) => (
            <div key={s.subject} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: gradeColors[s.grade] + "08", border: `1px solid ${gradeColors[s.grade]}20` }}>
              <div className="text-center w-12">
                <div className="text-xl font-black" style={{ color: gradeColors[s.grade] }}>{s.score}</div>
                <div className="text-[10px] text-gray-400">%</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">{s.subject}</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: gradeColors[s.grade] + "20", color: gradeColors[s.grade] }}>
                  Grade {s.grade} – {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <span className="text-xl">🔒</span>
          <div className="text-xs text-gray-600">
            <strong>Report card hard-lock is OFF</strong> — fees are cleared. If outstanding fees exist, this report card would be locked automatically.
          </div>
        </div>
      </div>

      {/* Crèche Daily Log */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🍼</span>
          <div>
            <h3 className="font-black text-gray-900">Today&apos;s Crèche Daily Log</h3>
            <div className="text-xs text-gray-400">For younger siblings in Crèche & Nursery</div>
          </div>
        </div>
        <div className="relative pl-4">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: "rgba(0,48,135,0.15)" }}></div>
          {creecheLog.map((e, i) => (
            <div key={i} className="flex gap-3 mb-4 last:mb-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 -ml-4 relative z-10 bg-white shadow-sm border border-blue-100">
                {e.icon}
              </div>
              <div>
                <div className="text-xs font-black text-gray-400">{e.time}</div>
                <div className="text-sm font-bold text-gray-900">{e.event}</div>
                <div className="text-xs text-gray-500">{e.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pick-up Code */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5"
        style={{ background: "linear-gradient(135deg, #0A1628, #003087)" }}>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔐</span>
            <h3 className="font-black text-white">Today&apos;s Pick-up Code</h3>
          </div>
          <p className="text-blue-300 text-sm">Show this code to the gate when picking up your child. Resets daily at midnight.</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-black tracking-widest mb-1 gold-glow rounded-2xl px-6 py-3"
            style={{ background: "rgba(255,215,0,0.1)", border: "2px solid #FFD700", color: "#FFD700" }}>
            7K9-4PX
          </div>
          <div className="text-xs text-blue-400 mt-2">Valid: Today only · 03 May 2026</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Admin Dashboard", href: "/admin", icon: "🏛️", color: "#003087" },
          { label: "Teacher Portal", href: "/teacher", icon: "👩‍🏫", color: "#1565C0" },
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
