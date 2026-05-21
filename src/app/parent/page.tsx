"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESColor, getGESLabel, formatGHS, todayISO } from "@/lib/utils";
import type { Fee, Payment, HomeworkAssignment, FeedPost, LessonPlan } from "@/lib/types";
import { hubtelInitiateCheckout } from "@/lib/hubtel";
import { paystackInlineCheckout } from "@/lib/paystack";
import HomeworkDetailModal from "@/components/HomeworkDetailModal";
import FeedPostModal from "@/components/FeedPostModal";
import LessonDetailModal from "@/components/LessonDetailModal";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
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
  { icon: "💬", label: "Chat Teacher", href: "/parent#chat" },
  { icon: "🚌", label: "Bus Tracking",  href: "/parent#bus" },
  { icon: "💻", label: "Lessons",       href: "/parent#lessons" },
  { icon: "📋", label: "Submit Excuse", href: "/parent#excuse" },
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
  const toggleLikePost        = useAppStore((s) => s.toggleLikePost);
  const announcements         = useAppStore((s) => s.announcements);
  const getOrCreatePickupCode = useAppStore((s) => s.getOrCreatePickupCode);
  const teachers              = useAppStore((s) => s.teachers);
  const busRoutes             = useAppStore((s) => s.busRoutes);
  const busStops              = useAppStore((s) => s.busStops);
  const busRuns               = useAppStore((s) => s.busRuns);
  const chatThreads           = useAppStore((s) => s.chatThreads);
  const chatMessages          = useAppStore((s) => s.chatMessages);
  const acknowledgeUrgentMessage = useAppStore((s) => s.acknowledgeUrgentMessage);
  const getOrCreateChatThread = useAppStore((s) => s.getOrCreateChatThread);
  const sendChatMessage       = useAppStore((s) => s.sendChatMessage);
  const markChatThreadRead    = useAppStore((s) => s.markChatThreadRead);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);
  const discountPolicy        = useAppStore((s) => s.discountPolicy);
  const settings              = useAppStore((s) => s.schoolSettings);
  const createPaymentRequest  = useAppStore((s) => s.createPaymentRequest);
  const markPaymentRequestStatus = useAppStore((s) => s.markPaymentRequestStatus);

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
  // Discount fallback: when no Family row exists yet, still honour the tiered
  // policy by counting siblings the parent_name / parent_phone matches.
  const familyDiscount = (() => {
    if (parentFamily) return computeFamilyDiscount(parentFamily.id);
    if (!discountPolicy.active || familyChildren.length < 1) return 0;
    const tiers = [...discountPolicy.tiers].sort((a, b) => b.sibling_count - a.sibling_count);
    const tier = tiers.find((t) => familyChildren.length >= t.sibling_count);
    return tier?.percent ?? 0;
  })();

  // Pickup code — generated once and stored in Zustand (teachers can verify it)
  const [todayCode, setTodayCode] = useState("------");
  useEffect(() => {
    if (child) setTodayCode(getOrCreatePickupCode(child.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id]);

  // Phase 15c — parent can chat with the child's class teacher AND with the
  // principal. We keep two separate threads so messages don't bleed across.
  const [chatRecipient, setChatRecipient] = useState<'teacher' | 'principal'>('teacher');

  const classTeacher = useMemo(
    () => teachers.find((t) => t.class_name === child?.class_name),
    [teachers, child?.class_name],
  );

  // Use a stable family identifier even when no Family row is linked yet
  // (otherwise the chat got stuck on "Loading…" forever for unmigrated demo
  // accounts). Falls back to the user's id / email so the thread is unique.
  const familyKey = parentFamily?.id ?? `solo-${user?.id ?? user?.email ?? "parent"}`;
  const parentDisplay = parentFamily?.family_name ?? user?.full_name ?? "Parent";

  const teacherThread = useMemo(() => {
    if (!child || !classTeacher) return null;
    return getOrCreateChatThread({
      family_id: familyKey,
      parent_name: parentDisplay,
      teacher_id: classTeacher.id,
      teacher_name: classTeacher.full_name,
      student_id: child.id,
      student_name: child.full_name,
      class_name: child.class_name,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, classTeacher?.id, familyKey]);

  const principalThread = useMemo(() => {
    if (!child) return null;
    return getOrCreateChatThread({
      family_id: familyKey,
      parent_name: parentDisplay,
      teacher_id: 'principal',           // sentinel id so principal threads dedupe
      teacher_name: 'Principal',
      student_id: child.id,
      student_name: child.full_name,
      class_name: child.class_name,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id, familyKey]);

  const chatThread = chatRecipient === 'teacher' ? teacherThread : principalThread;
  const recipientName = chatRecipient === 'teacher' ? classTeacher?.full_name : 'Principal';

  const conversation = useMemo(
    () => chatMessages
      .filter((m) => m.thread_id === chatThread?.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [chatMessages, chatThread?.id],
  );

  useEffect(() => {
    if (chatThread && chatThread.unread_for_parent > 0) {
      markChatThreadRead(chatThread.id, 'parent');
    }
  }, [chatThread, markChatThreadRead]);

  const [chatDraft, setChatDraft] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [conversation.length, chatThread?.id]);

  const sendChat = () => {
    if (!chatThread || !chatDraft.trim()) return;
    sendChatMessage(chatThread.id, 'parent', user?.id, parentDisplay, chatDraft);
    setChatDraft("");
  };

  // Phase 15f — live bus for the active child today. We match a route by the
  // child's family being assigned to it; until that link exists, fall back to
  // showing any active run so the parent can at least see the school bus.
  const today = todayISO();
  const liveBusRun = useMemo(
    () => busRuns.find((r) => r.date === today && r.status === "in_progress"),
    [busRuns, today],
  );
  const liveBusRoute = busRoutes.find((r) => r.id === liveBusRun?.route_id);
  const liveBusNextStop = busStops.find((s) => s.id === liveBusRun?.next_stop_id);
  const liveBusCurrentStop = busStops.find((s) => s.id === liveBusRun?.current_stop_id);

  // Pay modal — can be opened from any fee row or the global button
  const [payModal, setPayModal] = useState(false);
  const [targetFee, setTargetFee] = useState<Fee | null>(null);

  // Homework detail modal — opened by tapping a homework row.
  const [hwDetail, setHwDetail] = useState<HomeworkAssignment | null>(null);
  const [feedDetail, setFeedDetail] = useState<FeedPost | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonPlan | null>(null);
  const lessonPlans = useAppStore((s) => s.lessonPlans);
  const addFeedPost = useAppStore((s) => s.addFeedPost);
  const [feedSubmit, setFeedSubmit] = useState({ open: false, title: "", content: "", image: "" });
  const submitParentFeedPost = () => {
    if (!feedSubmit.title.trim()) { toast.error("Add a title"); return; }
    addFeedPost({
      title: feedSubmit.title.trim(),
      content: feedSubmit.content.trim() || undefined,
      image_url: feedSubmit.image.trim() || undefined,
      author_name: parentDisplay,
      author_role: 'parent',
    });
    setFeedSubmit({ open: false, title: "", content: "", image: "" });
    toast("📨 Sent to school admin for approval — you'll see it on the feed once they tap Approve.", { duration: 6000 });
  };

  // Excuse-from-school form state
  const submitExcuseRequest = useAppStore((s) => s.submitExcuseRequest);
  const excuseRequests      = useAppStore((s) => s.excuseRequests);
  const [excuseKind, setExcuseKind] = useState<'medical' | 'family' | 'religious' | 'bereavement' | 'travel' | 'other'>('medical');
  const [excuseStart, setExcuseStart] = useState(todayISO());
  const [excuseEnd, setExcuseEnd]     = useState(todayISO());
  const [excuseReason, setExcuseReason] = useState("");
  const [excuseFile, setExcuseFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const myExcuses = excuseRequests.filter((r) => r.student_id === child?.id).slice(0, 5);

  const handleExcuseFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) { toast.error("File too big — max 10 MB. Use a smaller PDF or photo."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setExcuseFile({ name: f.name, dataUrl: reader.result });
      }
    };
    reader.readAsDataURL(f);
  };
  const submitExcuse = () => {
    if (!child) return;
    if (!excuseReason.trim()) { toast.error("Add a short reason"); return; }
    if (new Date(excuseEnd) < new Date(excuseStart)) { toast.error("End date can't be before start date"); return; }
    submitExcuseRequest({
      student_id: child.id,
      student_name: child.full_name,
      class_name: child.class_name,
      family_id: parentFamily?.id,
      submitted_by_email: user?.email,
      kind: excuseKind,
      start_date: excuseStart,
      end_date: excuseEnd,
      reason: excuseReason.trim(),
      document_name: excuseFile?.name,
      document_data_url: excuseFile?.dataUrl,
    });
    toast.success("✅ Excuse sent — the school will review it shortly.");
    setExcuseReason("");
    setExcuseFile(null);
  };
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

  async function handlePay() {
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!child) return;

    const goesViaGateway = payForm.method === "mtn_momo"
      || payForm.method === "telecel"
      || payForm.method === "at_money"
      || payForm.method === "bank";

    // Paystack — primary gateway while Hubtel KYC is in progress.
    if (goesViaGateway && settings.payment_provider === "paystack") {
      if (!settings.paystack_public_key) {
        toast.error("Payments aren't configured yet — ask the school admin to add the Paystack public key in Settings.");
        return;
      }
      const req = createPaymentRequest({
        student_id: child.id,
        fee_id: targetFee?.id,
        family_id: parentFamily?.id,
        amount: amt,
        method: "paystack",
        channel: payForm.method,
        phone_or_ref: payForm.reference || undefined,
        status: "pending",
      });
      const result = await paystackInlineCheckout({
        publicKey: settings.paystack_public_key,
        amount: amt,
        currency: "GHS",
        email: user?.email ?? parentFamily?.primary_email ?? "parent@phoenixintl.school",
        reference: req.id,
        subaccount: settings.paystack_subaccount_code,
        metadata: {
          student_name: child.full_name,
          student_id: child.student_id,
          class_name: child.class_name,
          fee_type: targetFee?.fee_type ?? "Fees",
          term: targetFee?.term,
          academic_year: targetFee?.academic_year,
        },
      });
      if (!result.ok) {
        if (result.closed) {
          markPaymentRequestStatus(req.id, "cancelled");
          toast("Payment cancelled.", { icon: "ℹ️" });
        } else {
          markPaymentRequestStatus(req.id, "failed", { error: result.error });
          toast.error(result.error ?? "Payment failed");
        }
        return;
      }
      markPaymentRequestStatus(req.id, "paid", { paystack_reference: result.reference });
      recordPayment(child.id, amt, payForm.method, result.reference ?? req.id);
      toast.success(`✅ Payment of ${formatGHS(amt)} confirmed (ref ${result.reference?.slice(-8) ?? req.id.slice(-8)})`);
      setPayModal(false);
      return;
    }

    if (goesViaGateway && settings.payment_provider === "hubtel") {
      const reqMethod = (payForm.method === "mtn_momo" || payForm.method === "telecel" || payForm.method === "at_money") ? "hubtel_momo" : "hubtel_bank";
      const req = createPaymentRequest({
        student_id: child.id,
        fee_id: targetFee?.id,
        family_id: parentFamily?.id,
        amount: amt,
        method: reqMethod,
        channel: payForm.method,
        phone_or_ref: payForm.reference || undefined,
        status: "pending",
      });
      const result = await hubtelInitiateCheckout(
        {
          clientId: settings.hubtel_client_id ?? "",
          clientSecret: settings.hubtel_client_secret ?? "",
          merchantId: settings.hubtel_payments_merchant_id,
        },
        {
          amount: amt,
          description: `${targetFee?.fee_type ?? "Fees"} — ${child.full_name} (${child.class_name})`,
          clientReference: req.id,
          customer: {
            name: parentFamily?.family_name ?? user?.full_name ?? "Parent",
            email: user?.email,
            phone: parentFamily?.primary_phone ?? parentFamily?.secondary_phone ?? user?.phone,
          },
          callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/parent?paid=${req.id}` : "",
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/parent?ref=${req.id}` : "",
        },
      );
      if (!result.ok) {
        markPaymentRequestStatus(req.id, "failed", { error: result.error });
        toast.error(`Could not start payment: ${result.error ?? "Hubtel checkout unavailable"}`);
        return;
      }
      markPaymentRequestStatus(req.id, "pending", {
        hubtel_invoice_id: result.invoiceId,
        hubtel_checkout_url: result.checkoutUrl,
      });
      // For MoMo, Hubtel pushes a prompt to the customer's phone; for card/bank it opens a checkout page.
      if (result.checkoutUrl && typeof window !== "undefined") {
        window.open(result.checkoutUrl, "_blank", "noopener");
      }
      toast.success(`📲 Payment request sent. Approve the MoMo prompt on your phone, or complete checkout in the new tab. We'll confirm here when it clears.`, { duration: 8000 });
      setPayModal(false);
      return;
    }

    // Cash / fallback path — admin will reconcile and confirm.
    recordPayment(child.id, amt, payForm.method, payForm.reference || undefined);
    toast.success(`Payment of ${formatGHS(amt)} recorded — admin will confirm receipt.`);
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

  // Urgent-message nag: find any unacknowledged urgent chat messages in this
  // family's threads. Show a banner at the top of the dashboard until each one
  // is tapped "I've read it". Survives reload — acknowledgement is persisted.
  const familyChildIds = children.map((c) => c.id);
  const myThreadIds = chatThreads
    .filter((t) => familyChildIds.includes(t.student_id ?? ""))
    .map((t) => t.id);
  const urgentUnread = chatMessages.filter((m) =>
    myThreadIds.includes(m.thread_id) &&
    m.priority === "urgent" &&
    m.sender_role === "teacher" &&
    !m.acknowledged_at
  ).sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <DashboardShell role="parent" navItems={NAV}>

      {urgentUnread.length > 0 && (
        <div className="rounded-2xl p-4 mb-4 animate-pulse"
          style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", border: "2px solid rgba(252,165,165,0.7)" }}>
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚨</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm uppercase tracking-wider">Urgent message from the school</p>
              <p className="text-sm text-white/95 mt-1 whitespace-pre-wrap">{urgentUnread[0].body}</p>
              <p className="text-[11px] text-red-100 mt-1.5">
                {urgentUnread[0].sender_name ?? "School"} · {new Date(urgentUnread[0].created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <a href="/parent#chat"
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "white", color: "#7f1d1d" }}>
                  💬 Open chat &amp; reply
                </a>
                <button type="button"
                  onClick={() => acknowledgeUrgentMessage(urgentUnread[0].id)}
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}>
                  ✅ I&apos;ve read it
                </button>
              </div>
              {urgentUnread.length > 1 && (
                <p className="text-[10px] text-red-100 mt-2">+{urgentUnread.length - 1} more urgent message{urgentUnread.length - 1 === 1 ? "" : "s"} after this one.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
      {children.length === 1 && familyDiscount > 0 && (
        <div className="rounded-xl px-4 py-2 mb-4 text-xs font-bold text-emerald-800"
          style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)" }}>
          💰 Sibling discount: {familyDiscount}% applied to fees
        </div>
      )}

      {/* ── Child Hero ── */}
      <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        style={{ background: "linear-gradient(135deg, #0C0A1E, #1A3FA0)" }}>
        <ProfilePhotoUploader studentId={child.id}
          currentUrl={child.photo_url}
          fallbackEmoji={child.gender === "female" ? "👧" : "👦"}
          size={72} rounded="2xl" />

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
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#991b1b" }}>
                <span className="font-medium">⚠️ {formatGHS(totalBalance)} fee balance outstanding</span>
                <button type="button" onClick={() => openPay()}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{ background: "linear-gradient(135deg,#1A3FA0,#6B21A8)", color: "white" }}>
                  Pay
                </button>
              </div>
            )}
            {childAttendance.filter((a) => a.status === "absent").slice(0, 2).map((a) => (
              <div key={a.id} className="text-xs p-2.5 rounded-xl font-medium"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#991b1b" }}>
                ❌ Absent on {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            ))}
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="text-xs p-2.5 rounded-xl font-medium"
                style={{ background: "rgba(26,63,160,0.08)", border: "1px solid rgba(26,63,160,0.2)", color: "#1e3a8a" }}>
                📢 {a.title}
              </div>
            ))}
            {totalBalance <= 0 && childAttendance.filter((a) => a.status === "absent").length === 0 && announcements.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No new notifications.</p>
            )}
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
                <button type="button" key={hw.id}
                  onClick={() => setHwDetail(hw)}
                  className="w-full text-left rounded-xl p-3 transition-all hover:shadow-md hover:scale-[1.01]"
                  style={{ background: overdue ? "rgba(239,68,68,0.04)" : "rgba(26,63,160,0.04)", border: `1px solid ${overdue ? "rgba(239,68,68,0.12)" : "rgba(26,63,160,0.1)"}` }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-black text-gray-800">{hw.subject}</div>
                    <span className={`text-[10px] font-bold flex-shrink-0 ${overdue ? "text-red-500" : "text-orange-500"}`}>
                      {overdue ? "⏰ Overdue" : `Due ${hw.due_date}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">{hw.title}</div>
                  {hw.description && <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{hw.description}</div>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${submission ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
                      {submission ? `✅ Submitted` : "⏳ Not submitted"}
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold ml-auto">Tap for details →</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* What's being taught this week (parent view of teacher lesson plans) */}
      <div id="lessons" className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-black text-gray-900">💻 What {child.full_name.split(" ")[0]} is learning this week</h3>
          <span className="text-[10px] text-gray-500">Published by the class teacher</span>
        </div>
        {(() => {
          const myLessons = lessonPlans
            .filter((l) => l.class_name === child.class_name && l.is_published !== false)
            .slice(0, 6);
          if (myLessons.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-4">No lessons published yet — the teacher will add them here.</p>;
          }
          return (
            <div className="grid sm:grid-cols-2 gap-3">
              {myLessons.map((l) => (
                <button type="button" key={l.id} onClick={() => setLessonDetail(l)}
                  className="text-left p-3 rounded-xl transition-all hover:shadow-md hover:scale-[1.01]"
                  style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(107,33,168,0.15)" }}>
                  {l.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.cover_image_url} alt={l.strand}
                      className="w-full h-20 object-cover rounded-lg mb-2" />
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B21A8" }}>
                    📘 {l.subject}{l.week_number ? ` · Wk ${l.week_number}` : ""}
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{l.strand}</div>
                  <div className="text-xs text-gray-600">{l.sub_strand}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {l.primary_video_url && <span className="text-[10px] font-bold text-red-600">🎥 Video</span>}
                    {l.experiment && <span className="text-[10px] font-bold text-emerald-700">🧪 Try at home</span>}
                    <span className="text-[10px] text-blue-700 font-bold ml-auto">Tap to follow along →</span>
                  </div>
                </button>
              ))}
            </div>
          );
        })()}
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

      {/* Pickup history — past 30 days */}
      <PickupHistoryBlock studentId={child.id} />


      {/* School Feed */}
      <div id="feed" className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-black text-gray-900">📸 School Feed</h3>
          <button type="button" onClick={() => setFeedSubmit((s) => ({ ...s, open: !s.open }))}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: feedSubmit.open ? "rgba(239,68,68,0.1)" : "rgba(168,85,247,0.1)", color: feedSubmit.open ? "#b91c1c" : "#6B21A8" }}>
            {feedSubmit.open ? "✕ Cancel" : "+ Share a moment"}
          </button>
        </div>
        {feedSubmit.open && (
          <div className="rounded-xl p-3 mb-3"
            style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.18)" }}>
            <input value={feedSubmit.title}
              aria-label="Post title"
              placeholder="Title (e.g. Sports Day team photo)"
              onChange={(e) => setFeedSubmit((s) => ({ ...s, title: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded-lg text-sm text-gray-900 border border-gray-200" />
            <textarea value={feedSubmit.content} rows={2}
              aria-label="Caption"
              placeholder="Caption (optional)"
              onChange={(e) => setFeedSubmit((s) => ({ ...s, content: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded-lg text-sm text-gray-900 border border-gray-200 resize-none" />
            <input value={feedSubmit.image}
              aria-label="Image URL"
              placeholder="Image URL (optional)"
              onChange={(e) => setFeedSubmit((s) => ({ ...s, image: e.target.value }))}
              className="w-full mb-2 px-3 py-2 rounded-lg text-sm text-gray-900 border border-gray-200" />
            <p className="text-[10px] text-gray-500 mb-2">Your post goes to the admin for approval before parents and students can see it.</p>
            <button type="button" onClick={submitParentFeedPost} className="btn-gold text-xs px-4 py-2">
              📨 Send for approval
            </button>
          </div>
        )}
        <div className="space-y-3">
          {feedPosts.filter((p) => (p.status ?? "approved") === "approved").slice(0, 4).map((p) => {
            const firstImage = p.image_url || p.image_urls?.[0];
            const imageCount = [p.image_url, ...(p.image_urls ?? [])].filter(Boolean).length;
            return (
            <button type="button" key={p.id}
              onClick={() => setFeedDetail(p)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
              {firstImage ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={firstImage} alt={p.title} className="w-full h-full object-cover" />
                  {imageCount > 1 && (
                    <span className="absolute bottom-0 right-0 text-[9px] font-bold px-1 rounded-tl"
                      style={{ background: "rgba(0,0,0,0.65)", color: "white" }}>+{imageCount - 1}</span>
                  )}
                </div>
              ) : (
                <div className="text-2xl w-14 h-14 flex items-center justify-center bg-purple-50 rounded-lg flex-shrink-0">📸</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm">{p.title}</div>
                {p.content && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.content}</div>}
                <div className="text-[10px] text-gray-400 mt-1">{p.author_name} · Tap to read →</div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); user && toggleLikePost(p.id, user.id); }}
                className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full transition ${
                  p.liked_by?.includes(user?.id || '')
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}>
                {p.liked_by?.includes(user?.id || '') ? '❤️' : '🤍'} {p.likes}
              </button>
            </button>
            );
          })}
        </div>
      </div>

      {/* Bus tracking */}
      <div id="bus" className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-black text-gray-900">🚌 Bus Tracking</h3>
          {liveBusRun && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">🟢 LIVE</span>}
        </div>
        {!liveBusRun ? (
          <p className="text-xs text-gray-500">No bus run in progress right now. You&apos;ll see live status here when the driver starts the run.</p>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl p-3"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-800">{liveBusRoute?.name ?? "Bus run"}</span>
                <span className="text-[10px] text-emerald-700">
                  {liveBusRun.direction === "pickup" ? "🌅 Morning pickup" : "🌇 Afternoon drop-off"}
                </span>
              </div>
              {liveBusCurrentStop && !liveBusNextStop ? (
                <p className="text-sm text-gray-700">
                  Currently at <span className="font-bold">{liveBusCurrentStop.name}</span>
                </p>
              ) : liveBusNextStop ? (
                <p className="text-sm text-gray-700">
                  Next stop: <span className="font-bold">{liveBusNextStop.name}</span>
                  {liveBusNextStop.scheduled_pickup && liveBusRun.direction === "pickup" && (
                    <span className="text-xs text-gray-500"> · scheduled {liveBusNextStop.scheduled_pickup}</span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-700">All stops complete — bus heading back to school 🏫</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Last update {liveBusRun.current_ping_at ? new Date(liveBusRun.current_ping_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "just now"}
                {liveBusRoute?.driver_name && ` · Driver ${liveBusRoute.driver_name}`}
                {liveBusRoute?.bus_label && ` · ${liveBusRoute.bus_label}`}
              </p>
            </div>
            {liveBusRoute?.driver_phone && (
              <a href={`tel:${liveBusRoute.driver_phone}`}
                className="block w-full text-center text-xs font-bold py-2 rounded-xl"
                style={{ background: "rgba(26,14,77,0.06)", color: "#1A0E4D", border: "1px solid rgba(26,14,77,0.15)" }}>
                📞 Call driver — {liveBusRoute.driver_phone}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Submit excuse note */}
      <div id="excuse" className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-1">📋 Submit an excuse note</h3>
        <p className="text-xs text-gray-500 mb-3">
          For absences (sickness, family matters, etc.). Attach a doctor&apos;s note, police report or any supporting document. The school will review and update {child.full_name}&apos;s attendance.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-600">Type *</span>
            <select aria-label="Excuse type" value={excuseKind}
              onChange={(e) => setExcuseKind(e.target.value as typeof excuseKind)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900">
              <option value="medical">🩺 Medical / doctor&apos;s note</option>
              <option value="family">👨‍👩‍👧 Family matter</option>
              <option value="religious">🕊 Religious observance</option>
              <option value="bereavement">🕯 Bereavement</option>
              <option value="travel">✈️ Travel</option>
              <option value="other">📄 Other</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-bold text-gray-600">From *</span>
              <input type="date" aria-label="Start date" value={excuseStart}
                onChange={(e) => setExcuseStart(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">To *</span>
              <input type="date" aria-label="End date" value={excuseEnd}
                onChange={(e) => setExcuseEnd(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900" />
            </label>
          </div>
        </div>
        <label className="block mb-3">
          <span className="text-xs font-bold text-gray-600">Reason *</span>
          <textarea aria-label="Reason" rows={3}
            value={excuseReason}
            onChange={(e) => setExcuseReason(e.target.value)}
            placeholder="e.g. Kwame is unwell with malaria, doctor recommends 2 days bed rest."
            className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none" />
        </label>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="cursor-pointer text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: "rgba(26,63,160,0.08)", color: "#1A3FA0", border: "1px solid rgba(26,63,160,0.25)" }}>
            📎 Attach document (PDF or photo, ≤ 10 MB)
            <input type="file" className="hidden" accept="image/*,application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExcuseFile(f); e.target.value = ""; }} />
          </label>
          {excuseFile && (
            <span className="text-xs text-emerald-700 font-bold">✅ {excuseFile.name}
              <button type="button" onClick={() => setExcuseFile(null)} className="ml-2 text-red-500">✕</button>
            </span>
          )}
        </div>
        <button type="button" onClick={submitExcuse} className="btn-gold text-sm py-2.5 px-6">
          Submit excuse for review
        </button>

        {myExcuses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-2">Recent excuses</p>
            <ul className="space-y-1.5">
              {myExcuses.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: r.status === 'pending' ? "rgba(245,158,11,0.15)" : r.status === 'approved' ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: r.status === 'pending' ? "#92400e" : r.status === 'approved' ? "#065f46" : "#b91c1c",
                    }}>
                    {r.status}
                  </span>
                  <span className="text-gray-700">{r.start_date}{r.end_date !== r.start_date ? `–${r.end_date}` : ""}</span>
                  <span className="text-gray-500 truncate">{r.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chat with class teacher */}
      <div id="chat" className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-black text-gray-900">💬 Messages</h3>
          {classTeacher && chatRecipient === 'teacher' && (
            <span className="text-xs text-gray-500">{classTeacher.full_name} · {child.class_name}</span>
          )}
        </div>

        {/* Recipient tabs */}
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setChatRecipient('teacher')}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: chatRecipient === 'teacher' ? "#1A0E4D" : "rgba(26,14,77,0.06)",
              color: chatRecipient === 'teacher' ? "white" : "#1A0E4D",
              border: `1px solid ${chatRecipient === 'teacher' ? "#1A0E4D" : "rgba(26,14,77,0.18)"}`,
            }}>
            👩‍🏫 Class Teacher{classTeacher ? "" : " (unassigned)"}
          </button>
          <button type="button" onClick={() => setChatRecipient('principal')}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: chatRecipient === 'principal' ? "#1A0E4D" : "rgba(26,14,77,0.06)",
              color: chatRecipient === 'principal' ? "white" : "#1A0E4D",
              border: `1px solid ${chatRecipient === 'principal' ? "#1A0E4D" : "rgba(26,14,77,0.18)"}`,
            }}>
            👔 Principal
          </button>
        </div>

        {chatRecipient === 'teacher' && !classTeacher ? (
          <p className="text-xs text-gray-500">No class teacher assigned for {child.class_name} yet — switch to <span className="font-bold">Principal</span> to send a message instead.</p>
        ) : (
          <>
            <div ref={chatScrollRef}
              className="max-h-72 overflow-y-auto rounded-xl p-3 mb-3 space-y-2"
              style={{ background: "rgba(26,14,77,0.03)", border: "1px solid rgba(26,14,77,0.08)" }}>
              {conversation.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Start the conversation — {recipientName ?? "they"} will see this on their portal.</p>
              ) : conversation.map((m) => {
                const mine = m.sender_role === 'parent';
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                      style={{
                        background: mine ? "#1A0E4D" : "#ffffff",
                        color: mine ? "white" : "#1f2937",
                        border: mine ? "none" : "1px solid #e5e7eb",
                      }}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={`text-[9px] mt-0.5 ${mine ? "text-purple-200" : "text-gray-400"}`}>
                        {m.sender_name ?? m.sender_role} · {new Date(m.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder={`Message ${recipientName ?? "school"}…`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none" />
              <button type="button" onClick={sendChat} className="btn-gold text-xs px-4">Send</button>
            </div>
          </>
        )}
      </div>

      {/* Homework detail modal — opens when any homework row is tapped */}
      <HomeworkDetailModal
        homework={hwDetail}
        mySubmission={hwDetail ? homeworkSubmissions.find((s) => s.homework_id === hwDetail.id && s.student_id === child.id) : undefined}
        onSubmitWork={() => {
          if (!hwDetail) return;
          toast("📎 Upload coming next phase — for now, send to your teacher directly.", { duration: 5000 });
          setHwDetail(null);
        }}
        onClose={() => setHwDetail(null)}
      />

      <FeedPostModal
        post={feedDetail}
        onLike={() => feedDetail && user && toggleLikePost(feedDetail.id, user.id)}
        onClose={() => setFeedDetail(null)}
      />

      <LessonDetailModal
        lesson={lessonDetail}
        onClose={() => setLessonDetail(null)}
      />

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
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#1A3FA0" } as React.CSSProperties} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Method</label>
                <select aria-label="Payment method" value={payForm.method}
                  onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value as Payment["method"] }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none">
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
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none" />
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

function PickupHistoryBlock({ studentId }: { studentId: string }) {
  const codes = useAppStore((s) => s.pickupCodes);
  const cutoffMs = Date.now() - 30 * 86400000;
  const history = codes
    .filter((c) => c.student_id === studentId && c.used)
    .filter((c) => c.used_at ? new Date(c.used_at).getTime() >= cutoffMs : true)
    .sort((a, b) => (b.used_at ?? "").localeCompare(a.used_at ?? ""));
  if (history.length === 0) return null;
  return (
    <div className="glass rounded-2xl p-4 mt-3">
      <h4 className="font-bold text-gray-900 text-sm mb-2">🕒 Recent pickups (last 30 days)</h4>
      <ul className="space-y-1.5">
        {history.slice(0, 10).map((c) => (
          <li key={c.id} className="flex items-center justify-between text-xs">
            <span className="text-gray-700">
              {c.used_at ? new Date(c.used_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : c.valid_date}
              {c.picked_up_by_name && <> · <span className="font-bold">{c.picked_up_by_name}</span>{c.picked_up_by_relationship ? ` (${c.picked_up_by_relationship})` : ""}</>}
            </span>
            {c.verified_by && <span className="text-[10px] text-gray-400">by {c.verified_by}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
