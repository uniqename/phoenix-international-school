"use client";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESColor, getGESLabel, formatGHS, todayISO } from "@/lib/utils";
import type { Fee, Payment } from "@/lib/types";
import toast from "react-hot-toast";

const NAV = [
  { icon: "🏠", label: "Dashboard",   href: "/parent" },
  { icon: "💳", label: "Fees",         href: "/parent#fees" },
  { icon: "📡", label: "Attendance",   href: "/parent#attendance" },
  { icon: "📄", label: "Report Card",  href: "/parent#report" },
  { icon: "📚", label: "Homework",     href: "/parent#homework" },
  { icon: "🍼", label: "Daily Log",    href: "/parent#dailylog" },
  { icon: "🔐", label: "Pick-up Code", href: "/parent#pickup" },
  { icon: "📸", label: "School Feed",  href: "/parent#feed" },
];

export default function ParentPortal() {
  const { user }              = useAuth();
  const students              = useAppStore((s) => s.students);
  const families              = useAppStore((s) => s.families);
  const fees                  = useAppStore((s) => s.fees);
  const payments              = useAppStore((s) => s.payments);
  const recordPayment         = useAppStore((s) => s.recordPayment);
  const attendance            = useAppStore((s) => s.attendance);
  const grades                = useAppStore((s) => s.grades);
  const homework              = useAppStore((s) => s.homework);
  const homeworkSubmissions   = useAppStore((s) => s.homeworkSubmissions);
  const crecheLogs            = useAppStore((s) => s.crecheLogs);
  const feedPosts             = useAppStore((s) => s.feedPosts);
  const likePost              = useAppStore((s) => s.likePost);
  const announcements         = useAppStore((s) => s.announcements);
  const getOrCreatePickupCode = useAppStore((s) => s.getOrCreatePickupCode);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);

  // Find the parent's family by email or phone (either primary or secondary parent)
  const parentFamily = families.find((f) =>
    (user?.email && (f.primary_email === user.email || f.secondary_email === user.email)) ||
    (user?.phone && (f.primary_phone === user.phone || f.secondary_phone === user.phone))
  );
  // All children belonging to that family; fall back to legacy parent_name match for un-migrated accounts
  const familyChildren = parentFamily
    ? students.filter((s) => s.family_id === parentFamily.id)
    : students.filter((s) => s.parent_name === user?.full_name);
  const children = familyChildren.length > 0 ? familyChildren : students.slice(0, 1);
  const [activeChildIdx, setActiveChildIdx] = useState(0);
  const child = children[Math.min(activeChildIdx, children.length - 1)];
  const familyDiscount = parentFamily ? computeFamilyDiscount(parentFamily.id) : 0;

  // Pickup code — generated once and stored in Zustand (teachers can verify it)
  const [todayCode, setTodayCode] = useState("------");
  useEffect(() => {
    if (child) setTodayCode(getOrCreatePickupCode(child.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id]);

  // Pay modal — can be opened from any fee row or the global button
  const [payModal, setPayModal] = useState(false);
  const [targetFee, setTargetFee] = useState<Fee | null>(null);
  const [payForm, setPayForm] = useState<{
    amount: string; method: Payment["method"]; reference: string;
  }>({ amount: "", method: "mtn_momo", reference: "" });

  const childFees       = fees.filter((f) => f.student_id === child?.id);
  const childPayments   = payments.filter((p) => p.student_id === child?.id)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  const childAttendance = attendance.filter((a) => a.student_id === child?.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const childGrades     = grades.filter((g) => g.student_id === child?.id);
  const childHW         = homework.filter((h) => h.class_name === child?.class_name);
  const childLog        = crecheLogs.find((l) => l.student_id === child?.id && l.log_date === todayISO());

  const totalDue     = childFees.reduce((s, f) => s + f.amount, 0);
  const totalPaid    = childFees.reduce((s, f) => s + f.paid_amount, 0);
  const totalBalance = totalDue - totalPaid;

  const presentDays    = childAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendancePct  = childAttendance.length ? Math.round((presentDays / childAttendance.length) * 100) : 0;
  const aggregate      = childGrades.reduce((s, g) => s + g.ges_grade, 0);

  function openPay(fee?: Fee) {
    setTargetFee(fee ?? null);
    const suggested = fee
      ? (fee.amount - fee.paid_amount).toFixed(2)
      : totalBalance > 0 ? totalBalance.toFixed(2) : "";
    setPayForm({ amount: suggested, method: "mtn_momo", reference: "" });
    setPayModal(true);
  }

  function handlePay() {
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!child) return;
    recordPayment(child.id, amt, payForm.method, payForm.reference || undefined);
    toast.success(`Payment of ${formatGHS(amt)} recorded!`);
    setPayModal(false);
  }

  if (!child) {
    return (
      <DashboardShell role="parent" navItems={NAV}>
        <p style={{ color: "rgba(196,181,253,0.7)" }}>No child linked to this account. Contact school admin.</p>
      </DashboardShell>
    );
  }

  const feeStatusColor = totalBalance <= 0 ? "#22c55e" : totalBalance < totalDue * 0.5 ? "#f59e0b" : "#ef4444";

  return (
    <DashboardShell role="parent" navItems={NAV}>

      {/* ── Family banner + child selector ── */}
      {children.length > 1 && (
        <div className="rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3"
          style={{ background: "rgba(26,63,160,0.08)", border: "1px solid rgba(26,63,160,0.15)" }}>
          <div className="flex-1 min-w-[180px]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Family</p>
            <p className="font-bold text-gray-900">{parentFamily?.family_name ?? "Your family"} · {children.length} children</p>
            {familyDiscount > 0 && (
              <p className="text-xs text-emerald-700 font-bold mt-0.5">💰 Sibling discount: {familyDiscount}% applied to fees</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {children.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChildIdx(idx)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${idx === activeChildIdx ? "bg-indigo-700 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
              >
                {c.full_name.split(" ")[0]} · {c.class_name}
              </button>
            ))}
          </div>
        </div>
      )}
      {children.length === 1 && parentFamily && familyDiscount > 0 && (
        <div className="rounded-xl px-4 py-2 mb-4 text-xs font-bold text-emerald-800"
          style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)" }}>
          💰 Sibling discount: {familyDiscount}% applied to fees
        </div>
      )}

      {/* ── Child Hero ── */}
      <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        style={{ background: "linear-gradient(135deg, #0C0A1E, #1A3FA0)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          {child.gender === "female" ? "👧" : "👦"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-black text-white mb-0.5">{child.full_name}</h2>
          <p className="text-sm mb-2" style={{ color: "rgba(196,181,253,0.8)" }}>{child.class_name} · {child.student_id}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: feeStatusColor + "25", color: feeStatusColor }}>
              {totalBalance <= 0 ? "✅ Fees Cleared" : `⚠️ ${formatGHS(totalBalance)} Outstanding`}
            </span>
            {childGrades.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: "rgba(255,215,0,0.2)", color: "#FFD700" }}>
                Aggregate: {aggregate}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
              Attendance: {attendancePct}%
            </span>
          </div>
        </div>
        <button type="button" onClick={() => openPay()} className="btn-gold text-xs py-2 px-5 flex-shrink-0">
          💳 Make Payment
        </button>
      </div>

      {/* ── Announcement ── */}
      {announcements.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex gap-3 items-start"
          style={{ background: "rgba(26,63,160,0.35)", border: "1px solid rgba(77,120,240,0.4)" }}>
          <span className="text-xl">📢</span>
          <div>
            <div className="font-black text-white text-sm">{announcements[0].title}</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(196,181,253,0.8)" }}>{announcements[0].content}</div>
          </div>
        </div>
      )}

      {/* ── Fees & Payments ── */}
      <div id="fees" className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">💳 Fees &amp; Payments</h3>
          <button type="button" onClick={() => openPay()}
            className="text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
            + Make Payment
          </button>
        </div>

        {/* Summary totals */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Total Billed", amount: totalDue, color: "#374151" },
            { label: "Amount Paid",  amount: totalPaid, color: "#22c55e" },
            { label: "Balance Due",  amount: totalBalance, color: totalBalance > 0 ? "#ef4444" : "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center"
              style={{ background: s.color === "#22c55e" && s.label === "Amount Paid" ? "rgba(34,197,94,0.07)" : "rgba(0,0,0,0.03)", border: `1px solid ${s.color}18` }}>
              <div className="text-lg font-black" style={{ color: s.color }}>{formatGHS(s.amount)}</div>
              <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Fee rows */}
        {childFees.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">No fees set yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {childFees.map((f) => {
              const bal = f.amount - f.paid_amount;
              return (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: f.status === "cleared" ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.04)", border: `1px solid ${f.status === "cleared" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)"}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{f.fee_type}</div>
                    <div className="text-xs text-gray-500">
                      Term {f.term} · {f.academic_year}
                      {f.due_date && ` · Due ${f.due_date}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500">{formatGHS(f.paid_amount)} / {formatGHS(f.amount)}</div>
                    {bal > 0 && (
                      <div className="text-xs font-black" style={{ color: "#ef4444" }}>
                        {formatGHS(bal)} left
                      </div>
                    )}
                  </div>
                  <span className="text-base shrink-0">
                    {f.status === "cleared" ? "✅" : f.status === "partial" ? "⏳" : "🔴"}
                  </span>
                  {f.status !== "cleared" && (
                    <button type="button" onClick={() => openPay(f)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0"
                      style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                      Pay
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment history */}
        {childPayments.length > 0 && (
          <>
            <div className="text-xs font-black text-gray-500 mb-2 uppercase tracking-wide">Payment History</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
              {childPayments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-xs p-2.5 rounded-lg bg-gray-50">
                  <span className="text-green-600 font-black shrink-0">{formatGHS(p.amount)}</span>
                  <span className="text-gray-500 capitalize">{p.method.replace(/_/g, " ")}</span>
                  {p.reference && <span className="text-gray-400 truncate">· {p.reference}</span>}
                  <span className="ml-auto text-gray-400 shrink-0 font-mono">{p.receipt_number}</span>
                  <span className="text-gray-400 shrink-0">
                    {new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Attendance */}
        <div className="glass rounded-2xl p-5" id="attendance">
          <h3 className="font-black text-gray-900 mb-3">📡 Attendance</h3>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-4xl font-black" style={{ color: attendancePct >= 90 ? "#22c55e" : attendancePct >= 75 ? "#f59e0b" : "#ef4444" }}>
              {attendancePct}%
            </div>
            <div className="text-xs text-gray-400 pb-1">{presentDays} of {childAttendance.length} days present</div>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide">
            {childAttendance.slice(0, 10).map((a) => (
              <div key={a.id} className="flex justify-between items-center text-xs px-1">
                <span className="text-gray-500">
                  {new Date(a.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <div className="flex items-center gap-1.5">
                  {a.context === "bus" && <span className="text-[10px] text-gray-400">🚌</span>}
                  <span className="font-bold capitalize"
                    style={{ color: a.status === "present" ? "#22c55e" : a.status === "late" ? "#f59e0b" : "#ef4444" }}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-3">🔔 Notifications</h3>
          <div className="space-y-2">
            {totalBalance > 0 && (
              <div className="text-xs p-2.5 rounded-xl flex items-center justify-between gap-2"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <span>⚠️ {formatGHS(totalBalance)} fee balance outstanding</span>
                <button type="button" onClick={() => openPay()}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                  Pay
                </button>
              </div>
            )}
            {childAttendance.filter((a) => a.status === "absent").slice(0, 2).map((a) => (
              <div key={a.id} className="text-xs p-2.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.04)" }}>
                ❌ Absent on {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            ))}
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="text-xs p-2.5 rounded-xl"
                style={{ background: "rgba(26,63,160,0.05)" }}>
                📢 {a.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Card */}
      {childGrades.length > 0 && (
        <div id="report" className="glass rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">📄 Report Card — Term {childGrades[0].term}</h3>
            {totalBalance > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                🔒 Locked — fees outstanding
              </span>
            )}
          </div>
          {totalBalance <= 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {childGrades.map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: getGESColor(g.ges_grade) + "08", border: `1px solid ${getGESColor(g.ges_grade)}20` }}>
                  <div className="text-center w-12">
                    <div className="text-lg font-black" style={{ color: getGESColor(g.ges_grade) }}>{g.raw_score}</div>
                    <div className="text-[10px] text-gray-400">score</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{g.subject}</div>
                    <span className="text-[11px] font-bold" style={{ color: getGESColor(g.ges_grade) }}>
                      Grade {g.ges_grade} — {getGESLabel(g.ges_grade)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-gray-500 text-sm mb-3">Pay all outstanding fees to unlock your child&apos;s report card.</p>
              <button type="button" onClick={() => openPay()} className="btn-gold text-sm py-2 px-6">
                Pay {formatGHS(totalBalance)} Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Homework */}
      <div id="homework" className="glass rounded-2xl p-5 mb-5">
        <h3 className="font-black text-gray-900 mb-3">📚 Homework</h3>
        {childHW.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No homework assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {childHW.map((hw) => {
              const overdue    = new Date(hw.due_date) < new Date();
              const submission = homeworkSubmissions.find((s) => s.homework_id === hw.id && s.student_id === child.id);
              return (
                <div key={hw.id} className="rounded-xl p-3"
                  style={{ background: overdue ? "rgba(239,68,68,0.04)" : "rgba(26,63,160,0.04)", border: `1px solid ${overdue ? "rgba(239,68,68,0.12)" : "rgba(26,63,160,0.1)"}` }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-black text-gray-800">{hw.subject}</div>
                    <span className={`text-[10px] font-bold flex-shrink-0 ${overdue ? "text-red-500" : "text-orange-500"}`}>
                      {overdue ? "⏰ Overdue" : `Due ${hw.due_date}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">{hw.title}</div>
                  {hw.description && <div className="text-[11px] text-gray-500 mt-0.5">{hw.description}</div>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {hw.video_url && (
                      <a href={hw.video_url} target="_blank" rel="noreferrer"
                        className="text-[11px] text-blue-600 font-bold hover:underline">📹 Watch</a>
                    )}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${submission ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
                      {submission ? `✅ Submitted · ${submission.file_name}` : "⏳ Not submitted"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crèche Daily Log */}
      {child.level === "creche" && (
        <div id="dailylog" className="glass rounded-2xl p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-3">🍼 Today&apos;s Crèche Daily Log</h3>
          {childLog ? (
            <div className="space-y-2">
              {([
                ["🌟 Arrival", childLog.arrival_time],
                ["🍳 Breakfast", childLog.breakfast_note],
                ["🍽️ Lunch", childLog.lunch_note],
                ["😴 Nap", childLog.nap_duration],
                ["🎨 Activity", childLog.activity_notes],
                ["💊 Health", childLog.health_notes],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="w-28 text-gray-500 flex-shrink-0 font-medium">{label}</span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}
              <div className="mt-2 text-xs text-gray-400">Mood: {childLog.mood} · Updated by {childLog.created_by}</div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Daily log not yet updated for today.</p>
          )}
        </div>
      )}

      {/* Pick-up Code */}
      <div id="pickup" className="rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-center gap-5"
        style={{ background: "linear-gradient(135deg, #0C0A1E, #2D1060)" }}>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className="text-xl">🔐</span>
            <h3 className="font-black text-white">Today&apos;s Pick-up Code</h3>
          </div>
          <p className="text-sm" style={{ color: "rgba(196,181,253,0.75)" }}>
            Show this to the teacher or gate when collecting {child.full_name.split(" ")[0]}.
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(196,181,253,0.5)" }}>
            Teachers verify this code in their portal before releasing your child. Resets daily.
          </p>
        </div>
        <div className="text-center shrink-0">
          <div className="text-4xl font-black tracking-widest px-8 py-4 rounded-2xl font-mono"
            style={{ background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.5)", color: "#E9D5FF" }}>
            {todayCode}
          </div>
          <div className="text-xs mt-1.5" style={{ color: "rgba(196,181,253,0.5)" }}>Valid today only</div>
        </div>
      </div>

      {/* School Feed */}
      <div id="feed" className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-4">📸 School Feed</h3>
        <div className="space-y-3">
          {feedPosts.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="text-2xl">📸</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm">{p.title}</div>
                {p.content && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.content}</div>}
                <div className="text-[10px] text-gray-400 mt-1">{p.author_name}</div>
              </div>
              <button type="button" onClick={() => likePost(p.id)}
                className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                ❤️ {p.likes}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(12,10,30,0.7)" }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-gray-900 text-lg mb-0.5">
              {targetFee ? `Pay — ${targetFee.fee_type}` : "Make a Payment"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {child.full_name}
              {targetFee
                ? ` · Balance: ${formatGHS(targetFee.amount - targetFee.paid_amount)}`
                : totalBalance > 0 ? ` · Total outstanding: ${formatGHS(totalBalance)}` : ""}
            </p>

            {/* Quick-pay shortcuts */}
            {totalBalance > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-500 font-bold self-center">Quick:</span>
                {[totalBalance, 500, 200, 100].filter((v, i, a) => a.indexOf(v) === i && v > 0).slice(0, 4).map((v) => (
                  <button key={v} type="button"
                    onClick={() => setPayForm((p) => ({ ...p, amount: v.toFixed(2) }))}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(26,63,160,0.08)", color: "#1A3FA0", border: "1px solid rgba(26,63,160,0.2)" }}>
                    {v === totalBalance ? `Full ${formatGHS(v)}` : formatGHS(v)}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amount (GH₵)</label>
                <input type="number" value={payForm.amount}
                  onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#1A3FA0" } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Method</label>
                <select aria-label="Payment method" value={payForm.method}
                  onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value as Payment["method"] }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                  <option value="mtn_momo">📱 MTN MoMo</option>
                  <option value="telecel">📱 Telecel Cash</option>
                  <option value="at_money">📱 AT Money</option>
                  <option value="cash">💵 Cash at School</option>
                  <option value="bank">🏦 Bank Transfer</option>
                </select>
              </div>
              {payForm.method === "bank" && (
                <div className="rounded-xl p-3 text-xs space-y-1"
                  style={{ background: "rgba(26,63,160,0.05)", border: "1px solid rgba(26,63,160,0.12)" }}>
                  <div className="font-black text-gray-700 mb-1.5">🏦 Bank Transfer Details</div>
                  <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-bold">GCB Bank Ghana</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account Name</span><span className="font-bold">Phoenix Intl. School</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account No.</span><span className="font-bold font-mono">1024567890</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Branch</span><span className="font-bold">Accra Central</span></div>
                  <div className="text-orange-600 font-bold mt-1">Use your child&apos;s name as transfer reference.</div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Transaction Reference (optional)</label>
                <input value={payForm.reference}
                  onChange={(e) => setPayForm((p) => ({ ...p, reference: e.target.value }))}
                  placeholder={payForm.method === "bank" ? "Bank transaction ID" : "MoMo reference / optional"}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setPayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handlePay} className="btn-gold flex-1 py-2.5 text-sm">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
