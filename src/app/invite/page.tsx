"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0C0A1E] text-white">Loading…</div>}>
      <InviteForm />
    </Suspense>
  );
}

function InviteForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const families = useAppStore((s) => s.families);
  const students = useAppStore((s) => s.students);
  const consumeInvite = useAppStore((s) => s.consumeFamilyInvite);
  const { login } = useAuth();

  const family = useMemo(() => families.find((f) => f.invite_token === token), [families, token]);
  const expired = family?.invite_expires_at ? new Date(family.invite_expires_at) < new Date() : false;
  const childCount = family ? students.filter((s) => s.family_id === family.id).length : 0;

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (family && family.invite_role === "secondary" && family.secondary_email) {
      setForm((f) => ({ ...f, email: family.secondary_email ?? "" }));
    } else if (family && family.invite_role === "primary" && family.primary_email) {
      setForm((f) => ({ ...f, email: family.primary_email ?? "" }));
    }
  }, [family]);

  if (!token) {
    return <Frame title="Missing invite token" body="The link you opened didn't include an invite token. Ask the school to send a new invite link." />;
  }
  if (!family) {
    return <Frame title="Invite not found" body="This invite link is invalid or has already been used. Ask the school admin to generate a new one." />;
  }
  if (expired) {
    return <Frame title="Invite expired" body="This invite link has expired. Ask the school to send a new one — they're valid for 7 days." />;
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { toast.error("Your full name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    setSubmitting(true);
    const result = consumeInvite(token, {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      password: form.password,
    });
    if (!result.ok) {
      toast.error(result.reason);
      setSubmitting(false);
      return;
    }
    toast.success("Account created! Logging you in…");
    const { error } = await login(form.email.trim().toLowerCase(), form.password);
    if (error) {
      toast.error(`Could not auto-login: ${error}. Try logging in at /login`);
      router.push("/login");
    } else {
      router.push("/parent");
    }
  };

  return (
    <Frame
      title={`Welcome — ${family.invite_role === "primary" ? "Primary" : "Second"} Parent for ${family.family_name}`}
      body={`You've been invited to set up your parent login. You'll be linked to ${childCount} child${childCount === 1 ? "" : "ren"} in this family and see fees, attendance, reports, and announcements for all of them.`}
    >
      <div className="space-y-3 mt-4">
        <Field label="Your full name">
          <input
            className="invite-input"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Mrs. Adjoa Mensah"
          />
        </Field>
        <Field label="Email (this is your login)">
          <input
            className="invite-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          {family.invite_role === "secondary" && family.primary_email && (
            <p className="text-xs mt-1 text-amber-300">
              💡 Use a different email from the primary parent ({family.primary_email}) so you each have your own login.
            </p>
          )}
        </Field>
        <Field label="Phone (optional)">
          <input
            className="invite-input"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0244000000"
          />
        </Field>
        <Field label="Choose a password">
          <input
            className="invite-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </Field>
        <Field label="Confirm password">
          <input
            className="invite-input"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Type the same password again"
          />
        </Field>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-2 py-3 rounded-xl font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #1A3FA0, #6B21A8)" }}
        >
          {submitting ? "Creating account…" : "Create account & log in"}
        </button>
      </div>
      <style jsx>{`
        .invite-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border-radius: 0.6rem;
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 0.95rem;
        }
        .invite-input::placeholder { color: rgba(255,255,255,0.4); }
        .invite-input:focus { outline: none; border-color: #A855F7; box-shadow: 0 0 0 3px rgba(168,85,247,0.25); }
      `}</style>
    </Frame>
  );
}

function Frame({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0C0A1E, #1A0E4D)" }}>
      <div className="max-w-md w-full rounded-2xl p-7 text-white" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-70">Phoenix International School</p>
            <p className="font-semibold">Parent invite</p>
          </div>
        </div>
        <h1 className="text-xl font-bold leading-snug mt-2">{title}</h1>
        <p className="text-sm opacity-80 mt-2">{body}</p>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium opacity-90">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
