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
              Balance is read live from the provider once API keys are saved. Add Hubtel credentials in Accounts → API keys.
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
