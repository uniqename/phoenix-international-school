"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";
import type { UserRole } from "@/lib/types";

const NAV = [
  { icon: "📊", label: "Overview",       href: "/admin" },
  { icon: "🎒", label: "Students",       href: "/admin/students" },
  { icon: "💳", label: "Fee Management", href: "/admin/fees" },
  { icon: "👩‍🏫", label: "Staff",         href: "/admin/staff" },
  { icon: "💼", label: "Payroll",         href: "/admin/payroll" },
  { icon: "📡", label: "Attendance",      href: "/admin/attendance" },
  { icon: "🏦", label: "Canteen Wallet",  href: "/admin/canteen" },
  { icon: "📢", label: "Announcements",   href: "/admin/announcements" },
  { icon: "📸", label: "School Feed",     href: "/admin/feed" },
  { icon: "🔑", label: "Accounts",        href: "/admin/accounts" },
  { icon: "❓", label: "Question Bank", href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

type Tab = "teachers" | "parents";

interface PersonRow {
  key: string;
  full_name: string;
  suggestedEmail: string;
  role: UserRole;
  subtitle: string;
  phone?: string;
}

interface SlipData {
  name: string;
  role: string;
  email: string;
  password: string;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmtDate(iso?: string) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AccountsPage() {
  const teachers           = useAppStore((s) => s.teachers);
  const students           = useAppStore((s) => s.students);
  const accounts           = useAppStore((s) => s.accounts);
  const createAccount      = useAppStore((s) => s.createAccount);
  const resetAccountPassword = useAppStore((s) => s.resetAccountPassword);
  const toggleAccount      = useAppStore((s) => s.toggleAccount);

  const [tab, setTab]             = useState<Tab>("teachers");
  const [search, setSearch]       = useState("");
  const [createModal, setCreateModal] = useState<PersonRow | null>(null);
  const [createEmail, setCreateEmail] = useState("");
  const [slip, setSlip]           = useState<SlipData | null>(null);

  // ── Build rows ──────────────────────────────────────────────────
  const teacherRows: PersonRow[] = teachers.map((t) => ({
    key: `teacher:${t.id}`,
    full_name: t.full_name,
    suggestedEmail: t.email ?? "",
    role: "teacher",
    subtitle: [t.class_name, t.subjects?.join(", ")].filter(Boolean).join(" · "),
    phone: t.phone,
  }));

  const parentMap = new Map<string, PersonRow>();
  students.forEach((s) => {
    if (!s.parent_name) return;
    const key = `parent:${s.parent_name}`;
    if (!parentMap.has(key)) {
      parentMap.set(key, {
        key,
        full_name: s.parent_name,
        suggestedEmail: "",
        role: "parent",
        subtitle: `Parent of ${s.full_name} (${s.class_name})`,
        phone: s.parent_phone,
      });
    } else {
      const ex = parentMap.get(key)!;
      parentMap.set(key, { ...ex, subtitle: ex.subtitle + `, ${s.full_name}` });
    }
  });
  const parentRows = Array.from(parentMap.values());

  const allRows = tab === "teachers" ? teacherRows : parentRows;
  const rows = search.trim()
    ? allRows.filter((r) => r.full_name.toLowerCase().includes(search.toLowerCase()))
    : allRows;

  // ── Helpers ─────────────────────────────────────────────────────
  const getAccount = (key: string) => accounts.find((a) => a.linked_id === key);

  const activeCount = accounts.filter((a) => a.is_active).length;
  const pendingCount = accounts.filter((a) => a.force_password_change).length;

  const openCreate = (person: PersonRow) => {
    setCreateEmail(person.suggestedEmail);
    setCreateModal(person);
  };

  const handleCreate = () => {
    if (!createModal) return;
    if (!createEmail.trim()) { toast.error("Email address is required"); return; }
    const account = createAccount({
      full_name: createModal.full_name,
      email: createEmail.trim(),
      role: createModal.role,
      linked_id: createModal.key,
    });
    setCreateModal(null);
    setSlip({ name: createModal.full_name, role: createModal.role, email: createEmail.trim(), password: account.password });
    toast.success(`Account created for ${createModal.full_name}`);
  };

  const handleReset = (person: PersonRow) => {
    const acc = getAccount(person.key);
    if (!acc) return;
    const newPw = resetAccountPassword(acc.id);
    setSlip({ name: person.full_name, role: person.role, email: acc.email, password: newPw });
    toast.success("Password reset — share the new credential slip");
  };

  const handleToggle = (person: PersonRow) => {
    const acc = getAccount(person.key);
    if (!acc) return;
    toggleAccount(acc.id);
    toast(acc.is_active ? `${person.full_name} disabled` : `${person.full_name} re-enabled`, {
      icon: acc.is_active ? "🔒" : "✅",
    });
  };

  const viewSlip = (person: PersonRow) => {
    const acc = getAccount(person.key);
    if (!acc) return;
    setSlip({ name: person.full_name, role: person.role, email: acc.email, password: acc.password });
  };

  const copyCredentials = () => {
    if (!slip) return;
    const text = `*Phoenix International School Ghana — Portal Access*\n\nName: ${slip.name}\nRole: ${slip.role.charAt(0).toUpperCase() + slip.role.slice(1)}\nEmail: ${slip.email}\nPassword: ${slip.password}\n\nLogin at: ${window.location.origin}/login\n_You will be asked to set a new password on first login._`;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied! Ready to paste into WhatsApp"));
  };

  const printSlip = () => {
    if (!slip) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Portal Access — ${slip.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; }
          .card { width: 380px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
          .header { background: #0A1628; padding: 22px 24px; }
          .header-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .eagle { font-size: 28px; }
          .school-name { color: white; font-weight: 900; font-size: 13px; line-height: 1.3; }
          .school-sub  { color: #94a3b8; font-size: 11px; }
          .badge { display: inline-block; background: rgba(255,215,0,0.18); color: #FFD700; border: 1px solid rgba(255,215,0,0.3); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: bold; margin-top: 6px; }
          .body { background: white; padding: 24px; }
          .field { margin-bottom: 16px; }
          .label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .pw-box { background: #f8fafc; border: 2px dashed #003087; border-radius: 10px; padding: 12px 16px; margin-top: 4px; }
          .pw-value { font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #003087; font-family: 'Courier New', monospace; }
          .footer { background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; }
          .url { font-weight: bold; color: #003087; }
          .warning { color: #dc2626; font-weight: bold; margin-top: 6px; }
          @media print { body { background: white; padding: 0; } .card { box-shadow: none; border: 1px solid #e2e8f0; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="header-logo">
              <span class="eagle">🦅</span>
              <div>
                <div class="school-name">Phoenix International School Ghana</div>
                <div class="school-sub">Official School Portal</div>
              </div>
            </div>
            <span class="badge">🔑 Portal Access Credentials</span>
          </div>
          <div class="body">
            <div class="field"><div class="label">Full Name</div><div class="value">${slip.name}</div></div>
            <div class="field"><div class="label">Role</div><div class="value">${slip.role.charAt(0).toUpperCase() + slip.role.slice(1)}</div></div>
            <div class="field"><div class="label">Login Email</div><div class="value">${slip.email}</div></div>
            <div class="field">
              <div class="label">Temporary Password</div>
              <div class="pw-box"><div class="pw-value">${slip.password}</div></div>
            </div>
          </div>
          <div class="footer">
            Login at: <span class="url">${window.location.origin}/login</span><br/>
            You will be asked to create a personal password on first login.<br/>
            <span class="warning">⚠ Keep these credentials private and do not share.</span>
          </div>
        </div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `);
    w.document.close();
  };

  // ── UI ───────────────────────────────────────────────────────────
  return (
    <DashboardShell role="admin" navItems={NAV}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-white">Account Access Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">Create login credentials for teachers and parents, share via print or WhatsApp.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="glass rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-black text-green-600">{activeCount}</div>
            <div className="text-[10px] text-gray-500 font-bold">Active</div>
          </div>
          <div className="glass rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-black text-orange-500">{pendingCount}</div>
            <div className="text-[10px] text-gray-500 font-bold">Pending PW</div>
          </div>
          <div className="glass rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-black" style={{ color: "#003087" }}>{accounts.length}</div>
            <div className="text-[10px] text-gray-500 font-bold">Total</div>
          </div>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="glass rounded-2xl p-3 mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["teachers", "parents"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="text-xs font-black px-4 py-1.5 rounded-full transition-all capitalize"
              style={tab === t
                ? { background: "#003087", color: "white" }
                : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
              {t} ({t === "teachers" ? teacherRows.length : parentRows.length})
            </button>
          ))}
        </div>
        <input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none" />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <span>Name</span>
          <span>Contact</span>
          <span>Status</span>
          <span>Last Login</span>
          <span>Actions</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {search ? "No results found." : `No ${tab} found.`}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rows.map((person) => {
              const acc = getAccount(person.key);
              return (
                <div key={person.key}
                  className="grid md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 md:gap-4 items-center px-5 py-4">

                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: person.role === "teacher" ? "#1565C0" : "#0ea5e9" }}>
                      {initials(person.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{person.full_name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{person.subtitle}</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="text-xs text-gray-600 min-w-0">
                    {acc ? (
                      <span className="font-mono truncate block">{acc.email}</span>
                    ) : (
                      <span className="text-gray-400 italic">No account yet</span>
                    )}
                    {person.phone && <span className="text-gray-400 block">{person.phone}</span>}
                  </div>

                  {/* Status */}
                  <div>
                    {!acc ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(148,163,184,0.15)", color: "#94a3b8" }}>
                        No Account
                      </span>
                    ) : acc.force_password_change ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                        ⏳ Pending Login
                      </span>
                    ) : acc.is_active ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                        ✅ Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                        🔒 Disabled
                      </span>
                    )}
                  </div>

                  {/* Last login */}
                  <div className="text-xs text-gray-500 font-medium">
                    {acc ? fmtDate(acc.last_login) : "—"}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5">
                    {!acc ? (
                      <button type="button" onClick={() => openCreate(person)}
                        className="text-xs font-black px-3 py-1.5 rounded-full"
                        style={{ background: "#003087", color: "white" }}>
                        + Create Login
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={() => viewSlip(person)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                          style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                          View Slip
                        </button>
                        <button type="button" onClick={() => handleReset(person)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                          Reset PW
                        </button>
                        <button type="button" onClick={() => handleToggle(person)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-full"
                          style={acc.is_active
                            ? { background: "rgba(239,68,68,0.08)", color: "#ef4444" }
                            : { background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                          {acc.is_active ? "Disable" : "Enable"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Account Modal ─────────────────────────────────── */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm" style={{ background: "white" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                style={{ background: createModal.role === "teacher" ? "#1565C0" : "#0ea5e9" }}>
                {initials(createModal.full_name)}
              </div>
              <div>
                <div className="font-black text-gray-900">{createModal.full_name}</div>
                <div className="text-xs text-gray-400">{createModal.subtitle}</div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-black text-gray-600 mb-1.5">
                Email or Phone Number *
                {createModal.role === "parent" && (
                  <span className="font-normal text-gray-400 ml-1">(personal email or phone, e.g. 024XXXXXXX)</span>
                )}
              </label>
              <input
                type="text"
                placeholder={createModal.role === "teacher" ? "staff email or 024XXXXXXX" : "parent email or phone number"}
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                autoFocus />
              {createModal.phone && (
                <p className="text-[11px] text-gray-400 mt-1.5">Phone on file: {createModal.phone}</p>
              )}
            </div>

            <div className="rounded-xl p-3 mb-5 text-xs text-blue-700"
              style={{ background: "rgba(14,165,233,0.08)" }}>
              A temporary password will be generated automatically. Share the credential slip with {createModal.full_name.split(" ")[0]} — they&apos;ll set their own password on first login.
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setCreateModal(null)}
                className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-xl border border-gray-200">
                Cancel
              </button>
              <button type="button" onClick={handleCreate}
                className="flex-1 py-2.5 text-sm font-black text-white rounded-xl"
                style={{ background: "#003087" }}>
                Create Account →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Credential Slip Modal ────────────────────────────────── */}
      {slip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm">
            {/* The slip card */}
            <div className="rounded-2xl overflow-hidden shadow-2xl" id="credential-slip">
              {/* Header */}
              <div className="p-5" style={{ background: "#0A1628" }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🦅</span>
                  <div>
                    <div className="text-white font-black text-sm">Phoenix International School Ghana</div>
                    <div className="text-blue-400 text-xs">Official School Portal</div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
                  🔑 Portal Access Credentials
                </div>
              </div>

              {/* Body */}
              <div className="p-5 bg-white space-y-4">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Full Name</div>
                  <div className="font-black text-gray-900">{slip.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Role</div>
                  <div className="font-bold text-gray-800 capitalize">{slip.role}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Login Email</div>
                  <div className="font-bold text-gray-800 font-mono text-sm">{slip.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Temporary Password</div>
                  <div className="rounded-xl p-3 text-center font-mono text-2xl font-black tracking-[0.2em]"
                    style={{ background: "rgba(0,48,135,0.06)", color: "#003087", border: "2px dashed rgba(0,48,135,0.2)" }}>
                    {slip.password}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 text-[11px] text-gray-500" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                Login at <span className="font-bold text-blue-700">/login</span> · Set your own password on first login · Keep this private
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button type="button" onClick={copyCredentials}
                className="py-2.5 text-xs font-black rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                📋 Copy for WhatsApp
              </button>
              <button type="button" onClick={printSlip}
                className="py-2.5 text-xs font-black rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                🖨️ Print Slip
              </button>
              <button type="button" onClick={() => setSlip(null)}
                className="py-2.5 text-xs font-black rounded-xl"
                style={{ background: "#FFD700", color: "#0A1628" }}>
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
