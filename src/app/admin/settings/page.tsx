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
    sms_provider: settings.sms_provider,
    sms_sender_id: settings.sms_sender_id ?? "",
    sms_alert_threshold: settings.sms_alert_threshold,
    hubtel_client_id: settings.hubtel_client_id ?? "",
    hubtel_client_secret: settings.hubtel_client_secret ?? "",
    hubtel_payments_merchant_id: settings.hubtel_payments_merchant_id ?? "",
    hubtel_settlement_bank: settings.hubtel_settlement_bank ?? "",
    hubtel_settlement_account: settings.hubtel_settlement_account ?? "",
    payment_provider: settings.payment_provider,
    paystack_public_key: settings.paystack_public_key ?? "",
    paystack_secret_key: settings.paystack_secret_key ?? "",
    paystack_subaccount_code: settings.paystack_subaccount_code ?? "",
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
      sms_provider: form.sms_provider,
      sms_sender_id: form.sms_sender_id.trim() || undefined,
      sms_alert_threshold: Number(form.sms_alert_threshold) || 10,
      hubtel_client_id: form.hubtel_client_id.trim() || undefined,
      hubtel_client_secret: form.hubtel_client_secret.trim() || undefined,
      hubtel_payments_merchant_id: form.hubtel_payments_merchant_id.trim() || undefined,
      hubtel_settlement_bank: form.hubtel_settlement_bank.trim() || undefined,
      hubtel_settlement_account: form.hubtel_settlement_account.trim() || undefined,
      payment_provider: form.payment_provider,
      paystack_public_key: form.paystack_public_key.trim() || undefined,
      paystack_secret_key: form.paystack_secret_key.trim() || undefined,
      paystack_subaccount_code: form.paystack_subaccount_code.trim() || undefined,
    });
    toast.success("School settings saved");
  };

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-bold">School Settings</h1>
          <p className="text-sm text-gray-500">
            Update the school&apos;s public info. These details appear on reports, parent invites, SMS, and the parent app header.
          </p>
        </header>

        <section className="rounded-xl border bg-white p-5 space-y-4">
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

        <section className="rounded-xl border bg-white p-5 space-y-4">
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

        <section className="rounded-xl border bg-white p-5 space-y-4">
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
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <p className="font-semibold mb-1">⚠️ Don&apos;t reuse another app&apos;s Paystack keys</p>
                <p>
                  HomeLink and Phoenix should have separate Paystack accounts OR Phoenix should use a Subaccount under the existing business. Otherwise school fees settle into HomeLink&apos;s bank account.
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

        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">SMS / Messaging</h2>
          <Field label="Provider">
            <select
              className="input"
              value={form.sms_provider}
              onChange={(e) => setForm({ ...form, sms_provider: e.target.value as typeof form.sms_provider })}
            >
              <option value="hubtel">Hubtel</option>
              <option value="mnotify">mNotify</option>
              <option value="arkesel">Arkesel</option>
              <option value="none">None (in-app + email only)</option>
            </select>
          </Field>
          {form.sms_provider === "none" && (
            <div className="rounded-lg border bg-gray-50 border-gray-200 p-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">No SMS today — announcements stay in-app + email</p>
              <p>
                Parents see notices when they open the app. To send SMS (e.g. fee reminders, attendance alerts) switch this back to Hubtel and add credentials below once your Hubtel KYC is approved.
              </p>
            </div>
          )}
          <Field label="Sender ID (registered with provider)">
            <input className="input" value={form.sms_sender_id} onChange={(e) => setForm({ ...form, sms_sender_id: e.target.value })} placeholder="PHOENIX" />
          </Field>
          <Field label="Low-credit alert threshold (GHS)">
            <input
              className="input"
              type="number"
              min={1}
              value={form.sms_alert_threshold}
              onChange={(e) => setForm({ ...form, sms_alert_threshold: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Principal gets a warning when SMS balance falls below this amount.
            </p>
          </Field>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
            <p className="font-medium text-amber-800">Current SMS balance: GHS {settings.sms_credit_balance.toFixed(2)}</p>
            <p className="text-xs text-amber-700 mt-1">
              {settings.hubtel_last_balance_check
                ? `Last checked ${new Date(settings.hubtel_last_balance_check).toLocaleString()}.`
                : "Balance refreshes after you save the Hubtel keys below."}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Payments</h2>
          <p className="text-xs text-gray-500">
            Which gateway parents use to pay fees from inside the app. Paystack works today; Hubtel switches on once your KYC is approved.
          </p>
          <Field label="Provider">
            <select
              className="input"
              value={form.payment_provider}
              onChange={(e) => setForm({ ...form, payment_provider: e.target.value as typeof form.payment_provider })}
            >
              <option value="paystack">Paystack (recommended for now)</option>
              <option value="hubtel">Hubtel (after KYC)</option>
              <option value="none">None — record payments manually</option>
            </select>
          </Field>
          {form.payment_provider === "paystack" && (
            <>
              <Field label="Paystack public key (pk_live_… or pk_test_…)">
                <input className="input" placeholder="pk_live_…" value={form.paystack_public_key} onChange={(e) => setForm({ ...form, paystack_public_key: e.target.value })} />
              </Field>
              <Field label="Paystack secret key (sk_live_… or sk_test_…)">
                <input className="input" type="password" placeholder="sk_live_…" value={form.paystack_secret_key} onChange={(e) => setForm({ ...form, paystack_secret_key: e.target.value })} />
              </Field>
              <Field label="Paystack subaccount code (optional)">
                <input className="input" placeholder="ACCT_xxxxxxxx" value={form.paystack_subaccount_code} onChange={(e) => setForm({ ...form, paystack_subaccount_code: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">
                  If you share a Paystack business with HomeLink, set up a subaccount for Phoenix and paste its code here so school fees settle into Phoenix&apos;s bank account, not HomeLink&apos;s.
                </p>
              </Field>
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900">
                <p className="font-semibold mb-1">⚠️ Separate Phoenix from HomeLink</p>
                <p>
                  HomeLink already runs on a Paystack account. <strong>Don&apos;t paste those keys here</strong> — fees collected from parents would settle into HomeLink&apos;s bank. Either:
                </p>
                <ol className="list-decimal list-inside mt-1 space-y-0.5">
                  <li>Sign up for a new Paystack business under <span className="font-mono">myphoenixschool@gmail.com</span>, OR</li>
                  <li>Create a subaccount in your existing Paystack (Dashboard → Settings → Subaccounts), tied to Phoenix&apos;s bank account, and paste the <span className="font-mono">ACCT_…</span> code above.</li>
                </ol>
              </div>
            </>
          )}
          {form.payment_provider === "none" && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700">
              Online payments off. Parents see a &quot;contact school&quot; message; admin records each payment manually on the Fees page.
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Hubtel API credentials</h2>
          <p className="text-xs text-gray-500">
            Get these from <span className="font-mono">unity.hubtel.com</span> → API → API Keys. The same Client ID + Secret unlocks both SMS and Receive Money payments. Never share them — they let anyone send SMS or collect funds on your account.
          </p>
          <Field label="Client ID">
            <input className="input" placeholder="hbtl_..." value={form.hubtel_client_id} onChange={(e) => setForm({ ...form, hubtel_client_id: e.target.value })} />
          </Field>
          <Field label="Client Secret">
            <input className="input" type="password" placeholder="••••••••" value={form.hubtel_client_secret} onChange={(e) => setForm({ ...form, hubtel_client_secret: e.target.value })} />
          </Field>
          <Field label="Payments Merchant Account Number (POS Sales)">
            <input className="input" placeholder="e.g. 2017557" value={form.hubtel_payments_merchant_id} onChange={(e) => setForm({ ...form, hubtel_payments_merchant_id: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Settlement bank">
              <input className="input" placeholder="GCB Bank Ghana" value={form.hubtel_settlement_bank} onChange={(e) => setForm({ ...form, hubtel_settlement_bank: e.target.value })} />
            </Field>
            <Field label="Settlement account">
              <input className="input" placeholder="1024567890" value={form.hubtel_settlement_account} onChange={(e) => setForm({ ...form, hubtel_settlement_account: e.target.value })} />
            </Field>
          </div>
          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900">
            <p className="font-semibold mb-1">🔒 Production note</p>
            <p>
              For production apps, store these keys on a small server proxy (Cloudflare Worker or similar) rather than in this settings form — the keys would otherwise ship inside the bundled APK/IPA. The Hubtel API calls from this app should route through that proxy. For now, these keys are stored locally in browser state and used in dev / staging only.
            </p>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => window.location.reload()}>Discard</button>
          <button className="btn-primary" onClick={onSave}>Save settings</button>
        </div>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-primary { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-primary:hover { background: #2c1a73; }
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
