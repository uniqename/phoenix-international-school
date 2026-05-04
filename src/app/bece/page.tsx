"use client";
import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

const SUBJECTS = ["Mathematics", "English Language", "Integrated Science", "Social Studies", "French", "RME"];

const COLORS: Record<string, { from: string; to: string }> = {
  Mathematics:          { from: "#003087", to: "#1565C0" },
  "English Language":   { from: "#1565C0", to: "#00D4FF" },
  "Integrated Science": { from: "#22c55e", to: "#10b981" },
  "Social Studies":     { from: "#f59e0b", to: "#E5B800" },
  French:               { from: "#8b5cf6", to: "#a78bfa" },
  RME:                  { from: "#ef4444", to: "#f97316" },
};

export default function BECESimulator() {
  const { user } = useAuth();
  const students         = useAppStore((s) => s.students);
  const quizQuestions    = useAppStore((s) => s.quizQuestions);
  const recordBECEAttempt = useAppStore((s) => s.recordBECEAttempt);

  const student = students.find((s) => s.full_name === user?.full_name) ?? students[0];

  const [selectedSubj, setSelectedSubj] = useState<string | null>(null);
  const [currentQ, setCurrentQ]         = useState(0);
  const [selected, setSelected]         = useState<number | null>(null);
  const [answered, setAnswered]         = useState(false);
  const [score, setScore]               = useState(0);
  const [done, setDone]                 = useState(false);
  const [answers, setAnswers]           = useState<(number | null)[]>([]);

  const qs = selectedSubj ? quizQuestions.filter((q) => q.subject === selectedSubj) : [];

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
    if (qs[currentQ].answer === idx) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  }

  function handleNext() {
    if (currentQ + 1 >= qs.length) {
      finishSession();
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  function finishSession() {
    if (student && selectedSubj) {
      recordBECEAttempt(student.id, selectedSubj, score, qs.length);
    }
    setDone(true);
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
              <div className="text-white font-black text-sm">BECE &apos;Pasco&apos; Simulator</div>
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
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700" }}>⏱️ Timed Practice</span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>📊 Instant Explanations</span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>🎯 Weakness Tracking</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS.map((s) => {
                const count = quizQuestions.filter((q) => q.subject === s).length;
                const c = COLORS[s] || { from: "#003087", to: "#1565C0" };
                return (
                  <button key={s} type="button" onClick={() => startSubject(s)}
                    className="rounded-2xl p-6 text-left card-hover relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                      style={{ background: "white", transform: "translate(30%, -30%)" }} />
                    <div className="font-black text-white text-lg mb-1">{s}</div>
                    <div className="text-white/70 text-sm">{count} question{count !== 1 ? "s" : ""}</div>
                    <div className="mt-4 text-xs px-3 py-1 rounded-full inline-block font-bold"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                      {count > 0 ? "Start Practice →" : "No questions yet"}
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
                  { range: "Agg 6–8",   label: "Excellent",  color: "#22c55e", desc: "Top SHS placement" },
                  { range: "Agg 9–12",  label: "Very Good",  color: "#00D4FF", desc: "Good SHS options" },
                  { range: "Agg 13–18", label: "Good",       color: "#f59e0b", desc: "Regular SHS" },
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
            <div className="text-blue-300 mb-2">You scored {score} out of {qs.length}</div>
            {student && (
              <div className="text-xs text-green-400 mb-6 font-bold">✅ Attempt saved to your practice history</div>
            )}

            <div className="glass rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-black text-gray-900 mb-4">Review Your Answers</h3>
              {qs.map((q, i) => {
                const wasCorrect = answers[i] === q.answer;
                return (
                  <div key={q.id} className={`mb-4 p-4 rounded-xl ${wasCorrect ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span>{wasCorrect ? "✅" : "❌"}</span>
                      <div className="text-sm font-semibold text-gray-800">{q.question}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      {!wasCorrect && <div className="text-red-600 mb-1">Your answer: {q.options[answers[i] ?? 0]}</div>}
                      <div className="text-green-700">Correct: {q.options[q.answer]}</div>
                      {q.explanation && <div className="mt-1 text-gray-600">💡 {q.explanation}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => startSubject(selectedSubj)} className="btn-gold">
                Retry {selectedSubj}
              </button>
              <button type="button" onClick={() => setSelectedSubj(null)} className="btn-outline">
                Choose Another Subject
              </button>
            </div>
          </div>
        ) : qs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-black text-white mb-2">No Questions Yet</h2>
            <p className="text-blue-300 mb-6">Your teacher hasn&apos;t added questions for {selectedSubj} yet.</p>
            <button type="button" onClick={() => setSelectedSubj(null)} className="btn-gold">← Back to Subjects</button>
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
                <button type="button" onClick={() => setSelectedSubj(null)}
                  className="text-xs text-blue-400 hover:text-white transition-colors">✕ Exit</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(currentQ / qs.length) * 100}%`, background: "#FFD700" }} />
            </div>

            {/* Question */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="text-gray-800 font-bold text-lg leading-relaxed">{qs[currentQ].question}</div>
              {qs[currentQ].year && (
                <div className="text-xs text-gray-400 mt-2">BECE {qs[currentQ].year} · {qs[currentQ].source ?? ""}</div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {qs[currentQ].options.map((opt, i) => {
                const isCorrect  = i === qs[currentQ].answer;
                const isSelected = i === selected;
                let bg        = "rgba(255,255,255,0.06)";
                let border    = "1px solid rgba(255,255,255,0.1)";
                let textColor = "white";

                if (answered) {
                  if (isCorrect)                    { bg = "rgba(34,197,94,0.2)";  border = "2px solid #22c55e"; textColor = "#22c55e"; }
                  else if (isSelected && !isCorrect) { bg = "rgba(239,68,68,0.2)"; border = "2px solid #ef4444"; textColor = "#ef4444"; }
                }

                return (
                  <button key={i} type="button" onClick={() => handleAnswer(i)}
                    className="w-full text-left p-4 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: bg, border, color: textColor, cursor: answered ? "default" : "pointer" }}>
                    <span className="font-black mr-3">{["A", "B", "C", "D"][i]}.</span>
                    {opt}
                    {answered && isCorrect    && <span className="float-right">✅</span>}
                    {answered && isSelected && !isCorrect && <span className="float-right">❌</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && qs[currentQ].explanation && (
              <div className="rounded-xl p-4 mb-6"
                style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}>
                <div className="text-xs font-black mb-1" style={{ color: "#FFD700" }}>💡 Explanation</div>
                <div className="text-sm text-white/80">{qs[currentQ].explanation}</div>
              </div>
            )}

            {answered && (
              <button type="button" onClick={handleNext} className="btn-gold w-full py-3 text-base">
                {currentQ + 1 >= qs.length ? "See Results →" : "Next Question →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
