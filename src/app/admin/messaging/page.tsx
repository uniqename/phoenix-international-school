"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { MessageChannel, MessageTemplate } from "@/lib/types";
import toast from "react-hot-toast";

type Tab = "quick" | "students" | "staff" | "all" | "events" | "reports";

const MERGE_FIELDS = [
  { key: "first_name",     label: "First Name" },
  { key: "last_name",      label: "Last Name" },
  { key: "full_name",      label: "Full Name" },
  { key: "username",       label: "Username" },
  { key: "password",       label: "Initial Password" },
  { key: "school_name",    label: "School Name" },
  { key: "erp_portal_url", label: "ERP Portal URL" },
  { key: "home_website_url", label: "Home Website URL" },
];

const CHANNEL_META: Record<MessageChannel, { label: string; emoji: string }> = {
  sms:      { label: "SMS",      emoji: "📱" },
  email:    { label: "Email",    emoji: "✉️" },
  whatsapp: { label: "WhatsApp", emoji: "💬" },
};

export default function MessagingPage() {
  const settings = useAppStore((s) => s.schoolSettings);
  const students = useAppStore((s) => s.students);
  const families = useAppStore((s) => s.families);
  const guardians = useAppStore((s) => s.guardians);
  const employees = useAppStore((s) => s.employees);
  const departments = useAppStore((s) => s.employeeDepartments);
  const classes = useAppStore((s) => s.classes);
  const courseGroups = useAppStore((s) => s.courseGroups);
  const templates = useAppStore((s) => s.messageTemplates);
  const logs = useAppStore((s) => s.messageLogs);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const addTemplate = useAppStore((s) => s.addMessageTemplate);
  const updateTemplate = useAppStore((s) => s.updateMessageTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteMessageTemplate);

  const [tab, setTab] = useState<Tab>("quick");

  // Shared compose state
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [channels, setChannels] = useState<MessageChannel[]>(["sms"]);

  // Quick message — manual numbers
  const [quickRecipients, setQuickRecipients] = useState("");

  // To Students filters
  const [stuTarget, setStuTarget] = useState<"students" | "courses" | "classes" | "groups">("students");
  const [stuCourseGroupId, setStuCourseGroupId] = useState("");
  const [stuClassName, setStuClassName] = useState("");
  const [stuCategory, setStuCategory] = useState<string>("");

  // To Staff filters
  const [staffTarget, setStaffTarget] = useState<"employees" | "departments">("employees");
  const [staffDeptId, setStaffDeptId] = useState("");

  // All Users selects
  const [allTypes, setAllTypes] = useState<string[]>(["Employees", "Guardians", "Students"]);

  // Events
  const [eventTemplateId, setEventTemplateId] = useState("");

  // Reports filter
  const [reportChannel, setReportChannel] = useState<MessageChannel | "all">("all");

  const insertMerge = (key: string) => {
    setBody((b) => b + `{{${key}}}`);
  };

  const toggleChannel = (c: MessageChannel) => {
    setChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const studentRecipients = useMemo(() => {
    let list = students;
    if (stuClassName) list = list.filter((s) => s.class_name === stuClassName);
    if (stuCourseGroupId) list = list.filter((s) => s.course_group_id === stuCourseGroupId);
    if (stuCategory) list = list.filter((s) => s.category === stuCategory);
    const recipients = new Set<string>();
    for (const s of list) {
      if (channels.includes("sms") || channels.includes("whatsapp")) {
        const fam = s.family_id ? families.find((f) => f.id === s.family_id) : null;
        if (fam?.primary_phone) recipients.add(fam.primary_phone);
        if (fam?.secondary_phone) recipients.add(fam.secondary_phone);
        if (!fam && s.parent_phone) recipients.add(s.parent_phone);
      }
      if (channels.includes("email")) {
        const fam = s.family_id ? families.find((f) => f.id === s.family_id) : null;
        if (fam?.primary_email) recipients.add(fam.primary_email);
        if (fam?.secondary_email) recipients.add(fam.secondary_email);
      }
    }
    return Array.from(recipients);
  }, [students, families, stuClassName, stuCourseGroupId, stuCategory, channels]);

  const staffRecipients = useMemo(() => {
    let list = employees;
    if (staffDeptId) list = list.filter((e) => e.department_id === staffDeptId);
    const recipients = new Set<string>();
    for (const e of list) {
      if ((channels.includes("sms") || channels.includes("whatsapp")) && e.phone) recipients.add(e.phone);
      if (channels.includes("email") && e.email) recipients.add(e.email);
    }
    return Array.from(recipients);
  }, [employees, staffDeptId, channels]);

  const allUsersRecipients = useMemo(() => {
    const recipients = new Set<string>();
    if (allTypes.includes("Students")) studentRecipients.forEach((r) => recipients.add(r));
    if (allTypes.includes("Employees")) staffRecipients.forEach((r) => recipients.add(r));
    if (allTypes.includes("Guardians")) {
      for (const g of guardians) {
        if ((channels.includes("sms") || channels.includes("whatsapp")) && g.phone) recipients.add(g.phone);
        if (channels.includes("email") && g.email) recipients.add(g.email);
      }
    }
    return Array.from(recipients);
  }, [allTypes, studentRecipients, staffRecipients, guardians, channels]);

  const quickRecipientsList = useMemo(() => {
    return quickRecipients.split(/[,\n;]/).map((s) => s.trim()).filter(Boolean);
  }, [quickRecipients]);

  const doSend = (kind: "individuals" | "students" | "staff" | "all_users" | "event", description: string, recipients: string[]) => {
    if (channels.length === 0) { toast.error("Pick at least one channel"); return; }
    if (!body.trim()) { toast.error("Message body required"); return; }
    if (recipients.length === 0) { toast.error("No recipients match your filters"); return; }
    sendMessage({
      channels,
      audience_kind: kind,
      audience_description: description,
      recipients,
      subject: channels.includes("email") ? subject : undefined,
      body: body.trim(),
    });
    toast.success(`📨 Sent to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"} via ${channels.map((c) => CHANNEL_META[c].label).join(" + ")}`);
    setBody("");
    setSubject("");
  };

  const useTemplate = (t: MessageTemplate) => {
    setBody(t.body);
    if (t.subject) setSubject(t.subject);
    setChannels(t.channels);
  };

  const filteredLogs = useMemo(() => reportChannel === "all" ? logs : logs.filter((l) => l.channel === reportChannel), [logs, reportChannel]);

  // Channel picker reused
  const channelToggle = () => (
    <div className="flex gap-1.5 flex-wrap">
      {(Object.keys(CHANNEL_META) as MessageChannel[]).map((c) => {
        const active = channels.includes(c);
        return (
          <button key={c} type="button" onClick={() => toggleChannel(c)}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: active ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
              color: active ? "white" : "#374151",
            }}>
            {active ? "✓ " : ""}{CHANNEL_META[c].emoji} {CHANNEL_META[c].label}
          </button>
        );
      })}
    </div>
  );

  const composeBlock = () => (
    <div className="glass rounded-2xl p-5 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</p>
      {channelToggle()}

      {channels.includes("email") && (
        <>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject (email)</label>
          <input className="input" placeholder="e.g. Fee reminder for term 2" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </>
      )}

      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message body</label>
      <textarea className="input" rows={5} placeholder="Type your message — use the merge tokens below to personalise" value={body} onChange={(e) => setBody(e.target.value)} />

      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Merge fields (click to insert)</p>
      <div className="flex flex-wrap gap-1.5">
        {MERGE_FIELDS.map((m) => (
          <button key={m.key} type="button" onClick={() => insertMerge(m.key)}
            className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
            {`{{${m.key}}}`} · {m.label}
          </button>
        ))}
      </div>
    </div>
  );

  const tabs: Array<{ key: Tab; label: string; emoji: string }> = [
    { key: "quick",    label: "Quick Message",   emoji: "⚡" },
    { key: "students", label: "To Students",     emoji: "🎒" },
    { key: "staff",    label: "To Staff",        emoji: "🧑‍💼" },
    { key: "all",      label: "All Users",       emoji: "👥" },
    { key: "events",   label: "Event Messages",  emoji: "🔔" },
    { key: "reports",  label: "Reports",         emoji: "📊" },
  ];

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📨 Messaging Service</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Multi-channel parent and staff comms — SMS via {settings.sms_provider === "none" ? "any provider once configured" : settings.sms_provider}, plus email and WhatsApp. Templates for repeat scenarios. Logs show every message sent.
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: tab === t.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {tab === "quick" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">📞 Recipients (manual)</h3>
              <textarea className="input" rows={6} placeholder="Enter phone numbers / emails — comma or line-separated. e.g. 0244000000, 0244111111" value={quickRecipients} onChange={(e) => setQuickRecipients(e.target.value)} />
              <p className="text-xs text-gray-500">{quickRecipientsList.length} recipient{quickRecipientsList.length === 1 ? "" : "s"} parsed</p>
              <button type="button" className="btn-gold w-full" onClick={() => doSend("individuals", `Manual list — ${quickRecipientsList.length} contacts`, quickRecipientsList)}>📨 Send to {quickRecipientsList.length} contact{quickRecipientsList.length === 1 ? "" : "s"}</button>
            </div>
            {composeBlock()}
          </div>
        )}

        {tab === "students" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">🎯 Target students / parents</h3>
              <div className="flex gap-1.5 flex-wrap">
                {(["students", "courses", "classes", "groups"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setStuTarget(k)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: stuTarget === k ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                      color: stuTarget === k ? "white" : "#374151",
                    }}>
                    To {k}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course group (optional)</label>
              <select className="input" value={stuCourseGroupId} onChange={(e) => setStuCourseGroupId(e.target.value)}>
                <option value="">All course groups</option>
                {courseGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class / batch (optional)</label>
              <select className="input" value={stuClassName} onChange={(e) => setStuClassName(e.target.value)}>
                <option value="">All classes</option>
                {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category / group (optional)</label>
              <select className="input" value={stuCategory} onChange={(e) => setStuCategory(e.target.value)}>
                <option value="">All</option>
                <option value="new">New students</option>
                <option value="continuing">Continuing students</option>
              </select>

              <p className="text-sm font-bold text-emerald-700">{studentRecipients.length} recipient{studentRecipients.length === 1 ? "" : "s"} match</p>
              <button type="button" className="btn-gold w-full" onClick={() => doSend("students", `Students filter (${stuClassName || "all classes"})`, studentRecipients)}>📨 Send to {studentRecipients.length}</button>
            </div>
            {composeBlock()}
          </div>
        )}

        {tab === "staff" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">🎯 Target staff</h3>
              <div className="flex gap-1.5">
                {(["employees", "departments"] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setStaffTarget(k)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: staffTarget === k ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                      color: staffTarget === k ? "white" : "#374151",
                    }}>
                    To {k}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department (optional)</label>
              <select className="input" value={staffDeptId} onChange={(e) => setStaffDeptId(e.target.value)}>
                <option value="">All departments</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <p className="text-sm font-bold text-emerald-700">{staffRecipients.length} recipient{staffRecipients.length === 1 ? "" : "s"} match</p>
              <button type="button" className="btn-gold w-full" onClick={() => doSend("staff", `Staff filter (${departments.find((d) => d.id === staffDeptId)?.name ?? "all departments"})`, staffRecipients)}>📨 Send to {staffRecipients.length}</button>
            </div>
            {composeBlock()}
          </div>
        )}

        {tab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">👥 Pick audience types</h3>
              <div className="flex flex-wrap gap-2">
                {["Employees", "Guardians", "Students"].map((t) => {
                  const active = allTypes.includes(t);
                  return (
                    <button key={t} type="button" onClick={() => setAllTypes((p) => active ? p.filter((x) => x !== t) : [...p, t])}
                      className="text-sm font-bold px-3 py-1.5 rounded-full"
                      style={{
                        background: active ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.05)",
                        color: active ? "#15803d" : "#6b7280",
                      }}>
                      {active ? "✓ " : "○ "}{t}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm font-bold text-emerald-700">{allUsersRecipients.length} unique recipient{allUsersRecipients.length === 1 ? "" : "s"}</p>
              <button type="button" className="btn-gold w-full" onClick={() => doSend("all_users", `All users (${allTypes.join(", ")})`, allUsersRecipients)}>📨 Send to {allUsersRecipients.length}</button>
            </div>
            {composeBlock()}
          </div>
        )}

        {tab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-gray-900">🔔 Event templates</h3>
              <p className="text-xs text-gray-500">Pick a template, then send it manually or wire it to the trigger (admission, payment_confirmed, etc.) so the system auto-sends.</p>
              <ul className="divide-y">
                {templates.length === 0 && <li className="text-sm text-gray-400 py-3 text-center">No templates.</li>}
                {templates.map((t) => (
                  <li key={t.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-500">
                          Trigger: <span className="font-mono">{t.trigger}</span> ·
                          Channels: {t.channels.map((c) => CHANNEL_META[c].emoji).join(" ")}
                          {!t.is_active && " · ⏸️ inactive"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => { setEventTemplateId(t.id); useTemplate(t); }}>Use</button>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => updateTemplate(t.id, { is_active: !t.is_active })}>{t.is_active ? "Pause" : "Activate"}</button>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (confirm(`Delete template ${t.name}?`)) deleteTemplate(t.id);
                        }}>×</button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{t.body}</p>
                  </li>
                ))}
              </ul>
              <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => {
                const name = prompt("Template name:");
                if (!name?.trim()) return;
                const triggerStr = prompt("Trigger (manual / admission / payment_confirmed / absent_today / birthday / fees_due / low_credit):", "manual") ?? "manual";
                const body = prompt("Message body (use {{tokens}}):") ?? "";
                addTemplate({
                  name: name.trim(),
                  trigger: triggerStr as MessageTemplate["trigger"],
                  channels: ["sms"],
                  body,
                  is_active: true,
                });
                toast.success("Template added");
              }}>+ New template</button>
            </div>
            <div className="space-y-4">
              {composeBlock()}
              <button type="button" className="btn-gold w-full" onClick={() => {
                if (!eventTemplateId) { toast.error("Pick a template first"); return; }
                doSend("event", `Event template — ${templates.find((t) => t.id === eventTemplateId)?.name ?? "template"}`, allUsersRecipients);
              }}>📨 Dispatch template to {allUsersRecipients.length} recipient{allUsersRecipients.length === 1 ? "" : "s"}</button>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <h3 className="font-black text-gray-900">📊 Message logs ({logs.length} total)</h3>
              <div className="flex gap-1.5 ml-auto">
                {(["all", ...Object.keys(CHANNEL_META)] as Array<MessageChannel | "all">).map((c) => (
                  <button key={c} type="button" onClick={() => setReportChannel(c)}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: reportChannel === c ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(0,0,0,0.05)",
                      color: reportChannel === c ? "white" : "#374151",
                    }}>
                    {c === "all" ? "All channels" : `${CHANNEL_META[c as MessageChannel].emoji} ${CHANNEL_META[c as MessageChannel].label}`}
                  </button>
                ))}
              </div>
            </div>
            {filteredLogs.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">
                <span className="block text-4xl mb-1">📭</span>
                No messages sent in this filter yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                  <tr>
                    <th className="text-left py-2">When</th>
                    <th className="text-left py-2">Channel</th>
                    <th className="text-left py-2">Audience</th>
                    <th className="text-right py-2">Recipients</th>
                    <th className="text-left py-2">Body</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 100).map((l) => (
                    <tr key={l.id} className="border-b border-gray-50">
                      <td className="py-2 text-xs text-gray-500 font-mono">{l.sent_at ? new Date(l.sent_at).toLocaleString() : "—"}</td>
                      <td className="py-2 text-xs">{CHANNEL_META[l.channel].emoji} {CHANNEL_META[l.channel].label}</td>
                      <td className="py-2 text-xs text-gray-600">{l.audience_description}</td>
                      <td className="py-2 text-right font-mono">{l.recipient_count}</td>
                      <td className="py-2 text-xs text-gray-600 max-w-xs truncate">{l.body}</td>
                      <td className="py-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                          background: l.status === "delivered" ? "rgba(34,197,94,0.1)" : l.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                          color: l.status === "delivered" ? "#16a34a" : l.status === "failed" ? "#b91c1c" : "#a16207",
                        }}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
