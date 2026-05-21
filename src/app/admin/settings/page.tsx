"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const settings = useAppStore((s) => s.schoolSettings);
  const updateSettings = useAppStore((s) => s.updateSchoolSettings);

  const [form, setForm] = useState({
    name: settings.name,
    motto: settings.motto ?? "",
    location: settings.location,
    phones: settings.phones.join(", "),
    email: settings.email,
    website: settings.website ?? "",
    // Hubtel SMS retired — kept as no-op so persisted settings still satisfy the type.
    hubtel_payments_merchant_id: settings.hubtel_payments_merchant_id ?? "",
    hubtel_settlement_bank: settings.hubtel_settlement_bank ?? "",
    hubtel_settlement_account: settings.hubtel_settlement_account ?? "",
    payment_provider: settings.payment_provider,
    paystack_public_key: settings.paystack_public_key ?? "",
    paystack_secret_key: settings.paystack_secret_key ?? "",
    paystack_subaccount_code: settings.paystack_subaccount_code ?? "",
    ai_drafting_enabled: settings.ai_drafting_enabled !== false,
    anthropic_api_key: settings.anthropic_api_key ?? "",
    ai_model: settings.ai_model ?? "claude-opus-4-7",
  });

  const onSave = () => {
    if (!form.name.trim() || !form.location.trim() || !form.email.trim()) {
      toast.error("Name, location, and email are required");
      return;
    }
    const phones = form.phones
      .split(/[,;\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (phones.length === 0) {
      toast.error("At least one phone number is required");
      return;
    }
    updateSettings({
      name: form.name.trim(),
      motto: form.motto.trim() || undefined,
      location: form.location.trim(),
      phones,
      email: form.email.trim(),
      website: form.website.trim() || undefined,
      // Hubtel SMS fields removed; app now uses in-app push notifications.
      hubtel_payments_merchant_id: form.hubtel_payments_merchant_id.trim() || undefined,
      hubtel_settlement_bank: form.hubtel_settlement_bank.trim() || undefined,
      hubtel_settlement_account: form.hubtel_settlement_account.trim() || undefined,
      payment_provider: form.payment_provider,
      paystack_public_key: form.paystack_public_key.trim() || undefined,
      paystack_secret_key: form.paystack_secret_key.trim() || undefined,
      paystack_subaccount_code: form.paystack_subaccount_code.trim() || undefined,
      ai_drafting_enabled: form.ai_drafting_enabled,
      anthropic_api_key: form.anthropic_api_key.trim() || undefined,
      ai_model: form.ai_model.trim() || undefined,
    });
    toast.success("School settings saved");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">⚙️ School Settings</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Update the school&apos;s public info. These details appear on reports, parent invites, SMS, and the parent app header.
          </p>
        </header>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Identity</h2>
          <Field label="School name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Motto (optional)">
            <input className="input" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} />
          </Field>
          <Field label="Location">
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. AGAPE" />
          </Field>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Contact</h2>
          <Field label="Phone numbers (comma-separated)">
            <input className="input" value={form.phones} onChange={(e) => setForm({ ...form, phones: e.target.value })} placeholder="0508923445, 0545307614" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Website (optional)">
            <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
          </Field>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">Fee payment gateway</h2>
          <Field label="Provider">
            <select
              className="input"
              value={form.payment_provider}
              onChange={(e) => setForm({ ...form, payment_provider: e.target.value as typeof form.payment_provider })}
            >
              <option value="paystack">Paystack (recommended while Hubtel KYC is pending)</option>
              <option value="hubtel">Hubtel Receive Money</option>
              <option value="none">None (cash only — admin records every payment)</option>
            </select>
          </Field>

          {form.payment_provider === "paystack" && (
            <div className="space-y-3 rounded-lg border bg-emerald-50 border-emerald-200 p-3">
              <p className="text-sm font-semibold text-emerald-900">Paystack keys</p>
              <p className="text-xs text-emerald-900/80">
                Get these from your Paystack dashboard → Settings → API Keys &amp; Webhooks. Use <span className="font-mono">pk_test_</span> while testing, swap to <span className="font-mono">pk_live_</span> when you&apos;re ready to take real money.
              </p>
              <Field label="Public key (pk_test_ or pk_live_)">
                <input className="input" placeholder="pk_test_..." value={form.paystack_public_key} onChange={(e) => setForm({ ...form, paystack_public_key: e.target.value })} />
              </Field>
              <Field label="Secret key (server-side only — keep blank for now)">
                <input className="input" type="password" placeholder="sk_..." value={form.paystack_secret_key} onChange={(e) => setForm({ ...form, paystack_secret_key: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">Used for refunds and webhook verification later. Don&apos;t paste your live secret here until you have a server proxy — the in-app value is fine for early testing.</p>
              </Field>
              <Field label="Paystack Subaccount code (optional)">
                <input className="input" placeholder="ACCT_xxxxxxxxxxxxxx" value={form.paystack_subaccount_code} onChange={(e) => setForm({ ...form, paystack_subaccount_code: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">
                  Use a subaccount if Phoenix shares a Paystack business with another app (e.g. HomeLink). Each fee payment routes its settlement to the subaccount&apos;s bank. Without a subaccount, money lands in whatever bank account the Paystack business is set up with.
                </p>
              </Field>
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900">
                <p className="font-semibold mb-1">Shared with HomeLink — same DOXA &amp; CO. LLC Paystack business</p>
                <p>
                  Both apps use the same Paystack keys and settle to the same bank account. Each transaction is tagged with <span className="font-mono">metadata.school=&quot;phoenix&quot;</span> so admin can reconcile per-app. To split payouts later, create a Paystack subaccount under DOXA, tie it to a separate Phoenix bank account, and paste its <span className="font-mono">ACCT_…</span> code above.
                </p>
              </div>
            </div>
          )}

          {form.payment_provider === "hubtel" && (
            <div className="rounded-lg border bg-amber-50 border-amber-200 p-3 text-xs text-amber-900">
              <p className="font-semibold mb-1">Hubtel pending KYC</p>
              <p>
                Hubtel asked for: company registration document, business logo, Ghana Card IDs of directors (front + back), and director contact details. Submit those at <span className="font-mono">unity.hubtel.com</span>, wait for the dedicated Relationship Manager email, then paste the Hubtel Client ID + Secret + Payments Merchant Number below. Use Paystack until then.
              </p>
            </div>
          )}

        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <div>
            <h2 className="font-semibold">📢 In-app notifications</h2>
            <p className="text-xs text-gray-500 mt-1">
              Phoenix uses <strong>in-app push notifications</strong> instead of SMS. When you send a message from <span className="font-mono">/admin/messaging</span>, it reaches parents and staff via the 🔔 bell on their dashboard and (when they have notifications enabled) as a phone alert. <strong>No SMS credits to top up.</strong> Hubtel SMS can be added later if you ever decide you want it.
            </p>
          </div>
          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
            <li>Every recipient sees the message inside the app instantly.</li>
            <li>Triggered events (absence, fee due, low SMS — n/a now, payment confirmed, birthday) all route through the same notification log.</li>
            <li>Templates live in <span className="font-mono">/admin/messaging → Templates</span> — same merge tokens as before.</li>
          </ul>
        </section>

        <section className="glass rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-semibold">🤖 AI report-card drafting</h2>
            <p className="text-xs text-gray-500 mt-1">
              In <span className="font-mono">/admin/reports</span> the head sees a <strong>📋 Copy AI prompt</strong> button next to every remark box. It copies a ready-made prompt (with the student&apos;s marker grades baked in) and opens <span className="font-mono">claude.ai</span> — the head pastes it into the free Claude chat, then copies the draft back. <strong>No API key, no monthly bill.</strong>
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-900">
            <p className="font-semibold mb-1">💡 Optional: one-tap auto-draft</p>
            <p>
              If you want the draft to appear instantly without copy-paste, paste an Anthropic API key below. This is a paid service — about <strong>GH₵ 0.02–0.20 per remark</strong> depending on model. Most schools don&apos;t need this; the free copy-prompt flow above already covers report-card season.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ai_drafting_enabled}
              onChange={(e) => setForm({ ...form, ai_drafting_enabled: e.target.checked })} />
            <span className="text-sm font-semibold">Enable optional auto-draft (paid)</span>
          </label>
          {form.ai_drafting_enabled && (
            <>
              <Field label="Anthropic API key (optional)">
                <input className="input" type="password" placeholder="sk-ant-… (leave blank to use the free copy-prompt flow)"
                  aria-label="Anthropic API key"
                  value={form.anthropic_api_key}
                  onChange={(e) => setForm({ ...form, anthropic_api_key: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">
                  Get one from <span className="font-mono">console.anthropic.com</span> → API Keys. Keep it secret — same warning as the payment keys above.
                </p>
              </Field>
              <Field label="Model">
                <select className="input" aria-label="AI model"
                  value={form.ai_model}
                  onChange={(e) => setForm({ ...form, ai_model: e.target.value })}>
                  <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 — fastest, cheapest (recommended)</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6 — balanced</option>
                  <option value="claude-opus-4-7">Claude Opus 4.7 — highest quality, slower</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Haiku is plenty for routine remarks; use Opus only for end-of-year reports where wording really matters.
                </p>
              </Field>
            </>
          )}
        </section>

        {/* Lifecycle: switch out of demo mode */}
        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold">🧹 Start fresh / training data</h2>
          <p className="text-xs text-gray-500">
            The app ships with demo students, fees, attendance and lessons so you can see how everything works. When you&apos;re ready to go live, wipe the demos and start entering your own school&apos;s records. The Admin and Principal sign-in are preserved either way.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button"
              onClick={() => {
                if (!window.confirm("Wipe all demo students, fees, attendance, grades, lessons, etc.? Your Admin / Principal login is kept. This cannot be undone — use 'Restore demos' below if you change your mind.")) return;
                useAppStore.getState().wipeDemoData();
                toast.success("🧹 Demo data cleared — start adding your real students from /admin/students");
              }}
              className="text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: "#b91c1c", color: "white" }}>
              🧹 Wipe demo data &amp; start fresh
            </button>
            <button type="button"
              onClick={() => {
                if (!window.confirm("Restore the original demo dataset? This will overwrite your current students, fees, grades, lessons, etc.")) return;
                useAppStore.getState().restoreDemoData();
                toast.success("Demo data restored");
              }}
              className="text-sm font-bold px-4 py-2 rounded-lg"
              style={{ background: "rgba(245,158,11,0.15)", color: "#92400e", border: "1px solid rgba(245,158,11,0.35)" }}>
              ↩ Restore demos (training mode)
            </button>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>Discard</button>
          <button type="button" className="btn-gold" onClick={onSave}>Save settings</button>
        </div>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-gold { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-gold:hover { background: #2c1a73; }
          .btn-secondary { background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
        `}</style>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
