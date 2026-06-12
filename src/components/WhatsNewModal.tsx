"use client";
import { useEffect, useState } from "react";

// Shows a "what's new in this build" splash once per build. Keyed by an
// app-version constant so future updates trigger another splash automatically.
// Storage key is short and prefixed so future updates can clean it up if needed.

const APP_BUILD = "v2.4.0-build-19";

const HIGHLIGHTS: Array<{ emoji: string; title: string; detail: string }> = [
  { emoji: "💸", title: "Paystack Transfers payroll (free path)", detail: "/admin/payroll → ⬇ Paystack transfers CSV. Pays staff straight from the same Paystack account that collects fees — no NIBSS, no monthly bank fees, ~GH₵1.50 per teacher per pay run. Drop the CSV on dashboard.paystack.com → Transfers → Bulk." },
  { emoji: "🔁", title: "Paystack settlement reconciliation", detail: "New /admin/settlements. Weekly, download the settlement CSV from your Paystack dashboard and drop it here — the app marks every matched in-app payment as 'settled to bank' so you know exactly what cleared and what's pending. No webhook required." },
  { emoji: "🔔", title: "Real device notifications for urgent messages", detail: "When Admin / Principal sends an 'urgent' chat, parents now get a real OS notification on their phone (lock screen, home screen) on top of the in-app red banner. Uses Capacitor LocalNotifications — entirely free, no server." },
];

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem("phoenix-last-seen-build");
      if (last !== APP_BUILD) setOpen(true);
    } catch { /* ignore (private mode etc.) */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem("phoenix-last-seen-build", APP_BUILD); } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
      <div className="rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950 to-purple-950 border border-yellow-500/40">
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-white">What&apos;s new</h2>
            <p className="text-xs mt-1 text-yellow-400">{APP_BUILD}</p>
          </div>

          <ul className="space-y-3 mb-5">
            {HIGHLIGHTS.map((h, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span className="text-2xl flex-shrink-0">{h.emoji}</span>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm">{h.title}</p>
                  <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">{h.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <button type="button" onClick={dismiss}
            className="btn-gold w-full py-3 text-sm font-black">
            Got it — let&apos;s go →
          </button>
        </div>
      </div>
    </div>
  );
}
