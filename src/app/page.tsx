import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "💳",
    title: "MoMo Auto-Reconciliation",
    desc: "MTN, Telecel & AT Money integrated. Instant receipts auto-generated on every payment.",
    tag: "Finance",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
  },
  {
    icon: "🔒",
    title: "Hard-Lock Results",
    desc: "Report cards & BECE mocks are automatically blocked until outstanding fees are cleared.",
    tag: "Finance",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
  },
  {
    icon: "🏦",
    title: "Canteen/Bus Wallet",
    desc: "QR/NFC closed-loop wallet. Parents pre-load funds; students tap to pay for lunch or bus.",
    tag: "Finance",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
  },
  {
    icon: "📅",
    title: "Installment Planner",
    desc: "Custom payment schedules with automated MoMo prompt sent on the parent's chosen day.",
    tag: "Finance",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
  },
  {
    icon: "💼",
    title: "Staff Payroll & SSNIT",
    desc: "Automated PAYE/SSNIT tax calculations. Pay slips sent directly to teachers' phones.",
    tag: "Finance",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
  },
  {
    icon: "🎓",
    title: "BECE 'Pasco' Simulator",
    desc: "Timed CBT mock exams in the actual WAEC BECE format. JHS 3 students practice real past questions.",
    tag: "Academic",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.1)",
  },
  {
    icon: "📊",
    title: "Automated GES Grading",
    desc: "Raw scores auto-converted to the 1–9 GES scale with class positions and aggregates.",
    tag: "Academic",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.1)",
  },
  {
    icon: "📝",
    title: "NaCCA Lesson Planner",
    desc: "Pre-loaded GES curriculum strands. Teachers select a topic and generate lesson notes in seconds.",
    tag: "Academic",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.1)",
  },
  {
    icon: "📡",
    title: "Attendance Alerts",
    desc: "Instant SMS to parents the moment a child is marked absent. Real-time peace of mind.",
    tag: "Academic",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.1)",
  },
  {
    icon: "🧒",
    title: "Crèche Daily Log",
    desc: "Feeding times, nap records, diaper notes & health updates pushed to parents automatically.",
    tag: "Welfare",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    icon: "🔐",
    title: "Secure Pick-up Codes",
    desc: "Daily dynamic codes generated per child. School only releases to the code holder.",
    tag: "Welfare",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    icon: "📸",
    title: "School Social Feed",
    desc: "Private 'Wall of Fame' gallery. Parents see class photos, Sports Day, Wear Ghana Day events.",
    tag: "Welfare",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "The Revenue MVP",
    emoji: "💰",
    color: "#FFD700",
    bg: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.3)",
    items: [
      "Student database (Crèche → JHS 3)",
      "MoMo fee payments (MTN / Telecel / AT)",
      "Auto-generated digital receipts",
      "Hard-lock results for unpaid balances",
      "Bulk SMS announcements",
      "Push notifications to parents",
    ],
  },
  {
    phase: "Phase 2",
    title: "The Academic Core",
    emoji: "📚",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.3)",
    items: [
      "Real-time attendance + parent alerts",
      "GES-standard report card generator",
      "1–9 automated grading & class positions",
      "NaCCA/GES lesson note planner",
      "Teacher homework upload",
      "Homework audio/video explanations",
    ],
  },
  {
    phase: "Phase 3",
    title: "The Market Killer",
    emoji: "🚀",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.3)",
    items: [
      "BECE 'Pasco' CBT simulator",
      "JHS 3 aggregate auto-calculator",
      "Subject weakness tracker (AI)",
      "Digital canteen/bus wallet (QR/NFC)",
      "Installment payment planner",
      "Staff payroll (PAYE/SSNIT)",
      "Online admissions enrollment funnel",
      "Crèche daily log (feeding, naps, health)",
      "Secure daily pick-up codes",
      "Private school social feed / Wall of Fame",
    ],
  },
];

const portals = [
  {
    icon: "🏛️",
    title: "Admin Portal",
    desc: "Full financial control, student database, staff management & school-wide analytics.",
    href: "/admin",
    gradient: "linear-gradient(135deg, #003087 0%, #1565C0 100%)",
    badge: "Headteacher / Accountant",
  },
  {
    icon: "👩‍🏫",
    title: "Teacher Portal",
    desc: "Mark attendance, generate report cards, create lesson notes & upload homework.",
    href: "/teacher",
    gradient: "linear-gradient(135deg, #0A1628 0%, #003087 100%)",
    badge: "Class Teachers",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent Portal",
    desc: "Pay fees via MoMo, track child's attendance, view report cards & get daily updates.",
    href: "/parent",
    gradient: "linear-gradient(135deg, #1565C0 0%, #00D4FF 100%)",
    badge: "Parents / Guardians",
  },
  {
    icon: "🎒",
    title: "Student Portal",
    desc: "View assignments, practice BECE past questions & track your aggregate score.",
    href: "/student",
    gradient: "linear-gradient(135deg, #E5B800 0%, #FFD700 100%)",
    badge: "JHS 1 – JHS 3",
    textDark: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#f0f4ff" }}>
      <Navbar />

      {/* HERO */}
      <section className="hero-bg grid-pattern relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
              🇬🇭 Built for Ghana · Crèche to JHS 3
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Phoenix<br />
              <span className="gradient-text">International</span><br />
              <span style={{ color: "#FFD700" }}>School</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 max-w-xl mb-10 leading-relaxed">
              Ghana&apos;s most powerful school management platform. MoMo payments, BECE prep,
              real-time attendance — all in one app that <strong className="text-white">beats Adesua & EduCore.</strong>
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/admin" className="btn-gold text-sm">Get Started Free →</Link>
              <Link href="/#features" className="btn-outline text-sm">See All Features</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
              {[["600+", "Students"], ["48", "Teachers"], ["4 Levels", "Crèche→JHS 3"], ["99.9%", "Uptime"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black" style={{ color: "#FFD700" }}>{val}</div>
                  <div className="text-xs text-blue-300 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating dashboard mockup */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="animate-float">
              <div className="glass rounded-3xl p-6 w-80 blue-glow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "linear-gradient(135deg,#FFD700,#E5B800)" }}>🦅</div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Phoenix Admin</div>
                    <div className="text-xs text-gray-500">Today · 03 May 2026</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Students", val: "612", icon: "🎒", color: "#003087" },
                    { label: "Fees Collected", val: "GH₵84k", icon: "💳", color: "#22c55e" },
                    { label: "Attendance", val: "94%", icon: "✅", color: "#00D4FF" },
                    { label: "Unpaid", val: "38", icon: "⚠️", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                      <div className="text-[10px] text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-700 mb-2">Recent Payments</div>
                  {[
                    { name: "Kwame A.", amt: "GH₵800", via: "MTN MoMo" },
                    { name: "Ama B.", amt: "GH₵650", via: "Telecel" },
                    { name: "Kofi M.", amt: "GH₵800", via: "MTN MoMo" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.via}</div>
                      </div>
                      <div className="text-xs font-bold text-green-600">{p.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#f0f4ff"/>
        </svg>
      </section>

      {/* COMPETITOR COMPARISON */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="phase-badge mb-4" style={{ background: "rgba(255,215,0,0.1)", color: "#E5B800", border: "1px solid rgba(255,215,0,0.3)" }}>
              Why Phoenix Wins
            </div>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#0A1628" }}>Built Different. Built Better.</h2>
          </div>
          <div className="glass rounded-3xl overflow-hidden border border-blue-100">
            <div className="grid grid-cols-3 text-sm font-bold p-4" style={{ background: "#0A1628", color: "white" }}>
              <div className="px-2">Feature</div>
              <div className="px-2 text-blue-300">Adesua / EduCore</div>
              <div className="px-2" style={{ color: "#FFD700" }}>Phoenix ✨</div>
            </div>
            {[
              ["Branding", "Generic platform logo", "100% White-labeled — your school's colors, your app"],
              ["Connectivity", "Requires strong internet", "Offline-first — attendance & grades work without data"],
              ["BECE Prep", "Basic e-learning modules", "CBT Simulator with real WAEC past questions & aggregates"],
              ["Payments", "Standard MoMo portal", "Auto hard-lock: results blocked until fees are cleared"],
              ["Canteen", "Not available", "QR/NFC closed-loop wallet — kids tap, parents pre-load"],
              ["Crèche Support", "Not available", "Daily logs: feeding, naps, health, sent to parents"],
            ].map(([feat, them, us], i) => (
              <div key={feat} className={`grid grid-cols-3 p-4 text-sm border-t border-blue-50 ${i % 2 === 0 ? "bg-white" : ""}`}>
                <div className="px-2 font-semibold text-gray-800">{feat}</div>
                <div className="px-2 text-gray-400">{them}</div>
                <div className="px-2 font-semibold" style={{ color: "#003087" }}>✓ {us}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="phase-badge mb-4" style={{ background: "rgba(0,48,135,0.08)", color: "#003087", border: "1px solid rgba(0,48,135,0.15)" }}>
              Master Feature List
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#0A1628" }}>
              Every Tool You Need to Run a School
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From MoMo reconciliation to BECE past questions — Phoenix covers everything a Ghanaian school actually needs.
            </p>
          </div>

          {/* Tag filters */}
          <div className="flex gap-3 justify-center mb-10 flex-wrap">
            {[
              { tag: "Finance", color: "#FFD700", bg: "rgba(255,215,0,0.1)" },
              { tag: "Academic", color: "#00D4FF", bg: "rgba(0,212,255,0.1)" },
              { tag: "Welfare", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
            ].map((t) => (
              <div key={t.tag} className="phase-badge" style={{ background: t.bg, color: t.color, border: `1px solid ${t.color}40` }}>
                {t.tag}
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover">
                <div className="feature-icon mb-4" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div className="phase-badge mb-3 text-[11px]" style={{ background: f.bg, color: f.color, border: `1px solid ${f.color}40` }}>
                  {f.tag}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="py-16 px-6" style={{ background: "#0A1628" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="phase-badge mb-4" style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
              Build Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">3 Phases. 0 Excuses.</h2>
            <p className="text-blue-300 max-w-xl mx-auto">Every feature is tracked. Nothing ships until it ships right.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roadmap.map((r) => (
              <div key={r.phase} className="rounded-2xl p-6 card-hover"
                style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase" style={{ color: r.color }}>{r.phase}</div>
                    <div className="text-white font-black text-lg">{r.title}</div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {r.items.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: r.color + "20", border: `1.5px solid ${r.color}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }}></div>
                      </div>
                      <span className="text-sm text-blue-200 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#0A1628" }}>
              4 Portals. 1 Platform.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every user gets a dedicated, role-specific experience built for how they actually use the school.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p) => (
              <Link href={p.href} key={p.title}
                className="rounded-3xl p-6 flex flex-col gap-4 card-hover text-white relative overflow-hidden"
                style={{ background: p.gradient }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "white", transform: "translate(40%, -40%)" }}></div>
                <div className="text-4xl">{p.icon}</div>
                <div>
                  <div className="font-black text-lg mb-1" style={{ color: p.textDark ? "#0A1628" : "white" }}>{p.title}</div>
                  <div className="text-sm opacity-80 leading-relaxed" style={{ color: p.textDark ? "#0A1628" : "rgba(255,255,255,0.85)" }}>{p.desc}</div>
                </div>
                <div className="mt-auto">
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: p.textDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)", color: p.textDark ? "#0A1628" : "white" }}>
                    {p.badge}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-16 px-6 hero-bg">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">🦅</div>
          <h2 className="text-4xl font-black text-white mb-4">Ready to transform your school?</h2>
          <p className="text-blue-300 mb-8 text-lg">Join Phoenix International School Ghana — the platform that puts your school first.</p>
          <Link href="/admin" className="btn-gold text-base px-8 py-4 inline-block">Open Admin Dashboard →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center" style={{ background: "#0A1628" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🦅</span>
          <span className="text-white font-bold">Phoenix International School Ghana</span>
        </div>
        <p className="text-blue-400 text-sm">Crèche · Nursery · KG · Primary · JHS 1–3 · © 2026</p>
      </footer>
    </div>
  );
}
