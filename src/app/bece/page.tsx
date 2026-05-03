"use client";
import { useState } from "react";
import Link from "next/link";

const subjects = ["Mathematics", "English Language", "Integrated Science", "Social Studies", "French", "RME"];

const questions: Record<string, { q: string; opts: string[]; ans: number; exp: string }[]> = {
  Mathematics: [
    {
      q: "Simplify: 3/4 + 2/3",
      opts: ["5/7", "17/12", "1 5/12", "11/12"],
      ans: 2,
      exp: "LCM of 4 and 3 is 12. So 9/12 + 8/12 = 17/12 = 1 5/12",
    },
    {
      q: "Find the value of x in: 2x + 5 = 17",
      opts: ["4", "6", "5", "11"],
      ans: 1,
      exp: "2x = 17 − 5 = 12, so x = 6",
    },
    {
      q: "A rectangle has length 8cm and width 5cm. What is its area?",
      opts: ["26 cm²", "40 cm²", "13 cm²", "80 cm²"],
      ans: 1,
      exp: "Area = length × width = 8 × 5 = 40 cm²",
    },
    {
      q: "What is 15% of GH₵200?",
      opts: ["GH₵25", "GH₵30", "GH₵35", "GH₵20"],
      ans: 1,
      exp: "15% × 200 = 0.15 × 200 = GH₵30",
    },
    {
      q: "Round 4,756 to the nearest hundred.",
      opts: ["4,700", "4,800", "5,000", "4,760"],
      ans: 1,
      exp: "The digit in the tens place is 5, so we round up: 4,800",
    },
  ],
  "English Language": [
    {
      q: "Choose the correct sentence:",
      opts: [
        "The boys plays football every day.",
        "The boys play football every day.",
        "The boys playing football every day.",
        "The boys played football every days.",
      ],
      ans: 1,
      exp: "'The boys' is plural so we use 'play' (base form), not 'plays'.",
    },
    {
      q: "Which of these is a synonym of 'courageous'?",
      opts: ["Cowardly", "Fearful", "Brave", "Timid"],
      ans: 2,
      exp: "'Courageous' means showing courage — 'Brave' is the correct synonym.",
    },
    {
      q: "The word 'benevolent' means:",
      opts: ["Wicked", "Charitable and kind", "Powerful", "Cowardly"],
      ans: 1,
      exp: "'Benevolent' means well-meaning and kindly — charitable and kind.",
    },
  ],
  "Integrated Science": [
    {
      q: "Which organ is responsible for filtering waste from the blood?",
      opts: ["Heart", "Liver", "Kidney", "Lungs"],
      ans: 2,
      exp: "The kidneys filter waste products and excess water from the blood to produce urine.",
    },
    {
      q: "What is the process by which plants make their own food?",
      opts: ["Respiration", "Transpiration", "Photosynthesis", "Digestion"],
      ans: 2,
      exp: "Photosynthesis is the process where plants use sunlight, water, and CO₂ to make glucose.",
    },
    {
      q: "The force that pulls objects toward the Earth is called:",
      opts: ["Friction", "Magnetism", "Gravity", "Tension"],
      ans: 2,
      exp: "Gravity is the force of attraction between the Earth and objects on or near its surface.",
    },
  ],
  "Social Studies": [
    {
      q: "Who was Ghana's first President?",
      opts: ["J.J. Rawlings", "John Kufuor", "Kwame Nkrumah", "Kofi Busia"],
      ans: 2,
      exp: "Dr. Kwame Nkrumah became Ghana's first President on 1 July 1960.",
    },
    {
      q: "What does 'GDP' stand for?",
      opts: ["Gross Domestic Product", "General Development Plan", "Government Domestic Policy", "Gross Daily Production"],
      ans: 0,
      exp: "GDP = Gross Domestic Product — the total monetary value of all goods and services produced in a country.",
    },
    {
      q: "Lake Volta was created by the construction of which dam?",
      opts: ["Bui Dam", "Akosombo Dam", "Kpong Dam", "Vea Dam"],
      ans: 1,
      exp: "The Akosombo Dam (built 1961–1965) created Lake Volta, one of the world's largest man-made lakes.",
    },
  ],
  French: [
    {
      q: "What is the French word for 'school'?",
      opts: ["Maison", "École", "Classe", "Livre"],
      ans: 1,
      exp: "'École' is the French word for school.",
    },
    {
      q: "Translate: 'Je m'appelle Kwame'",
      opts: ["I am from Kwame", "My name is Kwame", "I know Kwame", "Hello Kwame"],
      ans: 1,
      exp: "'Je m'appelle' literally means 'I call myself' — in English: 'My name is'.",
    },
  ],
  RME: [
    {
      q: "Which of these is the holy book of Islam?",
      opts: ["The Bible", "The Torah", "The Quran", "The Vedas"],
      ans: 2,
      exp: "The Quran (also written Koran) is the holy scripture of Islam.",
    },
    {
      q: "The Golden Rule in most religions teaches us to:",
      opts: ["Pray daily", "Treat others as you want to be treated", "Give to the poor only", "Attend church regularly"],
      ans: 1,
      exp: "The Golden Rule: 'Do unto others as you would have them do unto you.'",
    },
  ],
};

export default function BECESimulator() {
  const [selectedSubj, setSelectedSubj] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const qs = selectedSubj ? questions[selectedSubj] : [];

  function startSubject(s: string) {
    setSelectedSubj(s);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
    setAnswers([]);
  }

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = qs[currentQ].ans === idx;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  }

  function handleNext() {
    if (currentQ + 1 >= qs.length) {
      setDone(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/student" className="text-blue-400 hover:text-white text-sm transition-colors">← Student Portal</Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <div className="text-white font-black text-sm">BECE &quot;Pasco&quot; Simulator</div>
              <div className="text-blue-400 text-xs">Phoenix International School Ghana</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-bold"
            style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700" }}>
            WAEC BECE Format
          </span>
          <Link href="/" className="nav-link text-xs">Home</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!selectedSubj ? (
          <>
            <div className="text-center mb-12">
              <div className="text-5xl mb-4">📚</div>
              <h1 className="text-3xl font-black text-white mb-3">Choose a Subject</h1>
              <p className="text-blue-300">Practice BECE past questions in CBT mode — just like the real exam.</p>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700" }}>
                  ⏱️ Timed Practice
                </span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
                  📊 Instant Explanations
                </span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                  🎯 Weakness Tracking
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => {
                const count = questions[s]?.length ?? 0;
                const colors: Record<string, { from: string; to: string }> = {
                  Mathematics: { from: "#003087", to: "#1565C0" },
                  "English Language": { from: "#1565C0", to: "#00D4FF" },
                  "Integrated Science": { from: "#22c55e", to: "#10b981" },
                  "Social Studies": { from: "#f59e0b", to: "#E5B800" },
                  French: { from: "#8b5cf6", to: "#a78bfa" },
                  RME: { from: "#ef4444", to: "#f97316" },
                };
                const c = colors[s] || { from: "#003087", to: "#1565C0" };
                return (
                  <button key={s} onClick={() => startSubject(s)}
                    className="rounded-2xl p-6 text-left card-hover relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                      style={{ background: "white", transform: "translate(30%, -30%)" }}></div>
                    <div className="font-black text-white text-lg mb-1">{s}</div>
                    <div className="text-white/70 text-sm">{count} past questions</div>
                    <div className="mt-4 text-xs px-3 py-1 rounded-full inline-block font-bold"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                      Start Practice →
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Aggregate info */}
            <div className="mt-10 rounded-2xl p-5" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <h3 className="font-black text-white mb-3">📊 Understanding Your BECE Aggregate</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                {[
                  { range: "Agg 6–8", label: "Excellent", color: "#22c55e", desc: "Top SHS placement" },
                  { range: "Agg 9–12", label: "Very Good", color: "#00D4FF", desc: "Good SHS options" },
                  { range: "Agg 13–18", label: "Good", color: "#f59e0b", desc: "Regular SHS" },
                  { range: "Agg 19–36", label: "Needs Work", color: "#ef4444", desc: "Keep practicing" },
                ].map((a) => (
                  <div key={a.range} className="text-center p-3 rounded-xl"
                    style={{ background: a.color + "15", border: `1px solid ${a.color}30` }}>
                    <div className="text-sm font-black" style={{ color: a.color }}>{a.range}</div>
                    <div className="text-xs text-white/80 font-bold">{a.label}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : done ? (
          /* Results Screen */
          <div className="text-center">
            <div className="text-6xl mb-4">{pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "💪"}</div>
            <h2 className="text-3xl font-black text-white mb-2">{selectedSubj} Complete!</h2>
            <div className="text-6xl font-black mb-2" style={{ color: pct >= 70 ? "#FFD700" : pct >= 50 ? "#00D4FF" : "#ef4444" }}>
              {pct}%
            </div>
            <div className="text-blue-300 mb-8">You scored {score} out of {qs.length}</div>

            <div className="glass rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-black text-gray-900 mb-4">Review Your Answers</h3>
              {qs.map((q, i) => {
                const wasCorrect = answers[i] === q.ans;
                return (
                  <div key={i} className={`mb-4 p-4 rounded-xl ${wasCorrect ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span>{wasCorrect ? "✅" : "❌"}</span>
                      <div className="text-sm font-semibold text-gray-800">{q.q}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      {!wasCorrect && (
                        <div className="text-red-600 mb-1">Your answer: {q.opts[answers[i] ?? 0]}</div>
                      )}
                      <div className="text-green-700">Correct: {q.opts[q.ans]}</div>
                      <div className="mt-1 text-gray-600">💡 {q.exp}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => startSubject(selectedSubj)}
                className="btn-gold">Retry {selectedSubj}</button>
              <button onClick={() => setSelectedSubj(null)}
                className="btn-outline">Choose Another Subject</button>
            </div>
          </div>
        ) : (
          /* Question Screen */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-blue-400 text-xs font-bold mb-1">{selectedSubj}</div>
                <div className="text-white font-black text-lg">Question {currentQ + 1} of {qs.length}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-blue-400">Score</div>
                  <div className="font-black" style={{ color: "#FFD700" }}>{score}/{currentQ}</div>
                </div>
                <button onClick={() => setSelectedSubj(null)}
                  className="text-xs text-blue-400 hover:text-white transition-colors">✕ Exit</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ) / qs.length) * 100}%`, background: "#FFD700" }}></div>
            </div>

            {/* Question */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="text-gray-800 font-bold text-lg leading-relaxed">{qs[currentQ].q}</div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {qs[currentQ].opts.map((opt, i) => {
                const isCorrect = i === qs[currentQ].ans;
                const isSelected = i === selected;
                let bg = "rgba(255,255,255,0.06)";
                let border = "1px solid rgba(255,255,255,0.1)";
                let textColor = "white";

                if (answered) {
                  if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "2px solid #22c55e"; textColor = "#22c55e"; }
                  else if (isSelected) { bg = "rgba(239,68,68,0.2)"; border = "2px solid #ef4444"; textColor = "#ef4444"; }
                }

                return (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full text-left p-4 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: bg, border, color: textColor, cursor: answered ? "default" : "pointer" }}>
                    <span className="font-black mr-3">{["A", "B", "C", "D"][i]}.</span>
                    {opt}
                    {answered && isCorrect && <span className="float-right">✅</span>}
                    {answered && isSelected && !isCorrect && <span className="float-right">❌</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && (
              <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}>
                <div className="text-xs font-black mb-1" style={{ color: "#FFD700" }}>💡 Explanation</div>
                <div className="text-sm text-white/80">{qs[currentQ].exp}</div>
              </div>
            )}

            {answered && (
              <button onClick={handleNext} className="btn-gold w-full py-3 text-base">
                {currentQ + 1 >= qs.length ? "See Results →" : "Next Question →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
