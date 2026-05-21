"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

interface Item {
  href: string;
  label: string;
  detail?: string;
  badge?: string;
  emoji: string;
}

// Role-aware notification bell. Aggregates unread chats, pending excuses,
// pending feed posts, low fee balances, today's bus run, etc. — wherever the
// user actually has authority to act, we surface it here so nothing hides.

export default function NotificationBell({ role }: { role: UserRole }) {
  const { user } = useAuth();
  const chatThreads     = useAppStore((s) => s.chatThreads);
  const excuseRequests  = useAppStore((s) => s.excuseRequests);
  const feedPosts       = useAppStore((s) => s.feedPosts);
  const fees            = useAppStore((s) => s.fees);
  const students        = useAppStore((s) => s.students);
  const families        = useAppStore((s) => s.families);
  const busRuns         = useAppStore((s) => s.busRuns);
  const homework        = useAppStore((s) => s.homework);
  const homeworkSubs    = useAppStore((s) => s.homeworkSubmissions);
  const announcements   = useAppStore((s) => s.announcements);

  const [open, setOpen] = useState(false);

  const items: Item[] = useMemo(() => {
    const list: Item[] = [];
    const today = new Date().toISOString().slice(0, 10);

    if (role === "admin" || role === "principal") {
      const pendingExcuses = excuseRequests.filter((r) => r.status === "pending").length;
      if (pendingExcuses) list.push({ href: "/admin/excuses", emoji: "📋", label: "Excuse requests waiting", detail: `${pendingExcuses} pending review`, badge: String(pendingExcuses) });

      const pendingFeed = feedPosts.filter((p) => p.status === "pending").length;
      if (pendingFeed) list.push({ href: "/admin/feed", emoji: "📸", label: "Feed posts pending approval", detail: `${pendingFeed} waiting`, badge: String(pendingFeed) });

      const unreadChats = chatThreads.reduce((s, t) => s + (t.unread_for_teacher ?? 0), 0);
      if (unreadChats) list.push({ href: "/admin/chats", emoji: "💬", label: "Parent / student messages", detail: `${unreadChats} unread`, badge: String(unreadChats) });

      const liveBus = busRuns.filter((r) => r.status === "in_progress").length;
      if (liveBus) list.push({ href: "/admin/transport", emoji: "🚌", label: "Bus run in progress", detail: "Driver is live now", badge: "LIVE" });
    }

    if (role === "teacher") {
      const me = user?.full_name;
      const unreadChats = chatThreads
        .filter((t) => t.teacher_name === me && t.teacher_id !== 'principal')
        .reduce((s, t) => s + (t.unread_for_teacher ?? 0), 0);
      if (unreadChats) list.push({ href: "/teacher/chat", emoji: "💬", label: "Parent / student messages", detail: `${unreadChats} unread`, badge: String(unreadChats) });

      // New homework submissions since teacher last opened the page would
      // need a server side timestamp; for now flag any homework with
      // submissions > 0 that the teacher set themselves.
      const myHw = homework.filter((h) => h.teacher_name === me);
      const totalSubs = myHw.reduce((s, h) => s + homeworkSubs.filter((x) => x.homework_id === h.id).length, 0);
      if (totalSubs > 0) list.push({ href: "/teacher/homework", emoji: "📝", label: "Homework submissions", detail: `${totalSubs} to review`, badge: String(totalSubs) });
    }

    if (role === "parent") {
      const myFamily = families.find((f) =>
        (user?.email && (f.primary_email === user.email || f.secondary_email === user.email)) ||
        (user?.phone && (f.primary_phone === user.phone || f.secondary_phone === user.phone))
      );
      const myKids = myFamily
        ? students.filter((s) => s.family_id === myFamily.id)
        : students.filter((s) => s.parent_name === user?.full_name);
      const kidIds = myKids.map((k) => k.id);

      const unreadChats = chatThreads
        .filter((t) => kidIds.includes(t.student_id ?? ""))
        .reduce((s, t) => s + (t.unread_for_parent ?? 0), 0);
      if (unreadChats) list.push({ href: "/parent#chat", emoji: "💬", label: "School messages", detail: `${unreadChats} unread`, badge: String(unreadChats) });

      const outstanding = fees.filter((f) => kidIds.includes(f.student_id) && f.status !== "cleared")
        .reduce((s, f) => s + (f.amount - f.paid_amount), 0);
      if (outstanding > 0) list.push({ href: "/parent#fees", emoji: "💳", label: "Outstanding fees", detail: `GH₵ ${outstanding.toFixed(2)}`, badge: outstanding > 0 ? "!" : undefined });

      // Today's bus
      const liveBus = busRuns.find((r) => r.status === "in_progress" && r.date === today);
      if (liveBus) list.push({ href: "/parent#bus", emoji: "🚌", label: "Bus is on the move", detail: "Track live on the dashboard", badge: "LIVE" });

      // Recent announcements (last 3 days)
      const cutoff = Date.now() - 3 * 86400000;
      const recentAnn = announcements.filter((a) => new Date(a.created_at).getTime() > cutoff).length;
      if (recentAnn) list.push({ href: "/parent", emoji: "📢", label: "Recent announcements", detail: `${recentAnn} this week`, badge: String(recentAnn) });

      // Excuse status changes
      const myExcuses = excuseRequests.filter((r) => kidIds.includes(r.student_id ?? "") && r.status !== "pending").length;
      if (myExcuses) list.push({ href: "/parent#excuse", emoji: "📋", label: "Excuse decisions", detail: "Tap to see status", badge: String(myExcuses) });
    }

    if (role === "student") {
      const me = students.find((s) => s.full_name === user?.full_name);
      if (me) {
        const unread = chatThreads
          .filter((t) => t.student_id === me.id)
          .reduce((s, t) => s + (t.unread_for_parent ?? 0), 0);
        if (unread) list.push({ href: "/student/chat", emoji: "💬", label: "New messages", detail: `${unread} unread`, badge: String(unread) });

        const dueSoon = homework.filter((h) => h.class_name === me.class_name).filter((h) => {
          const d = new Date(h.due_date);
          d.setHours(0, 0, 0, 0);
          const t = new Date(); t.setHours(0, 0, 0, 0);
          const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
          return diff >= 0 && diff <= 2 && !homeworkSubs.some((s) => s.homework_id === h.id && s.student_id === me.id);
        }).length;
        if (dueSoon) list.push({ href: "/student#homework", emoji: "📚", label: "Homework due soon", detail: `${dueSoon} not yet submitted`, badge: String(dueSoon) });
      }
    }

    return list;
  }, [role, user, chatThreads, excuseRequests, feedPosts, fees, students, families, busRuns, homework, homeworkSubs, announcements]);

  const totalBadge = items.length;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${totalBadge})`}
        className="relative px-2.5 py-1.5 rounded-lg"
        style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}>
        <span className="text-base leading-none">🔔</span>
        {totalBadge > 0 && (
          <span className="absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "#ef4444", color: "white" }}>
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Overlay to close on outside-tap */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="fixed right-3 top-[calc(env(safe-area-inset-top,0px)+3.5rem)] md:absolute md:right-0 md:top-full md:mt-2 z-40 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "#0C0A1E", border: "1px solid rgba(255,255,255,0.12)", maxHeight: "calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 5rem)" }}>
            <div className="p-3 border-b border-white/10">
              <p className="font-bold text-white text-sm">Notifications</p>
              <p className="text-[11px] text-gray-400">{totalBadge === 0 ? "You're all caught up 🎉" : `${totalBadge} item${totalBadge === 1 ? "" : "s"} need your attention`}</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 9rem)" }}>
              {items.length === 0 ? (
                <p className="p-4 text-xs text-gray-500 text-center">Nothing new right now.</p>
              ) : items.map((it, i) => (
                <Link key={i} href={it.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all">
                  <span className="text-xl">{it.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{it.label}</p>
                    {it.detail && <p className="text-[11px] text-gray-400 truncate">{it.detail}</p>}
                  </div>
                  {it.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: it.badge === "LIVE" ? "#10b981" : "#ef4444", color: "white" }}>
                      {it.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
