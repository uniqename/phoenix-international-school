"use client";
import { useEffect, useRef } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

// Bridges in-app urgent chat messages to real device notifications using
// Capacitor's free LocalNotifications plugin. When the app detects an
// unacknowledged urgent message:
//   1. Asks the user once for notification permission (iOS / Android).
//   2. Schedules a notification 5 seconds out. If the parent leaves the app
//      open the toast/banner already covers it; if they background the app,
//      the OS surfaces the notification on the lock screen and home screen.
//   3. Reschedules every minute while unread so parents keep being reminded
//      until they tap "I've read it" in the app banner.
//
// Web browsers (no Capacitor native bridge) get a no-op — the in-app banner
// is still visible.

const NOTIFY_INTERVAL_MS = 60_000;

export default function UrgentNotificationBridge() {
  const { user } = useAuth();
  const chatThreads = useAppStore((s) => s.chatThreads);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const families = useAppStore((s) => s.families);
  const students = useAppStore((s) => s.students);
  const permissionAsked = useRef(false);
  const lastFireRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Only parents and students benefit; admin/teachers already live in the app.
    if (!user || (user.role !== "parent" && user.role !== "student")) return;

    // Find this user's child thread ids.
    let kidIds: string[] = [];
    if (user.role === "parent") {
      const fam = families.find((f) =>
        (user.email && (f.primary_email === user.email || f.secondary_email === user.email)) ||
        (user.phone && (f.primary_phone === user.phone || f.secondary_phone === user.phone))
      );
      kidIds = fam
        ? students.filter((s) => s.family_id === fam.id).map((s) => s.id)
        : students.filter((s) => s.parent_name === user.full_name).map((s) => s.id);
    } else if (user.role === "student") {
      const me = students.find((s) => s.full_name === user.full_name);
      if (me) kidIds = [me.id];
    }
    const myThreadIds = chatThreads
      .filter((t) => kidIds.includes(t.student_id ?? ""))
      .map((t) => t.id);
    const unreadUrgent = chatMessages.filter((m) =>
      myThreadIds.includes(m.thread_id) &&
      m.priority === "urgent" &&
      m.sender_role === "teacher" &&
      !m.acknowledged_at
    );

    if (unreadUrgent.length === 0) {
      // Nothing pending — cancel any scheduled reminders.
      LocalNotifications.cancel({ notifications: [{ id: 9001 }] }).catch(() => {});
      lastFireRef.current.clear();
      return;
    }

    // Ask for permission once per session.
    const ensurePerm = async () => {
      if (permissionAsked.current) return true;
      permissionAsked.current = true;
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== "granted") {
          const req = await LocalNotifications.requestPermissions();
          return req.display === "granted";
        }
        return true;
      } catch { return false; }
    };

    const fire = async () => {
      const ok = await ensurePerm();
      if (!ok) return;
      const latest = unreadUrgent[0];
      const last = lastFireRef.current.get(latest.id) ?? 0;
      if (Date.now() - last < NOTIFY_INTERVAL_MS - 2000) return;
      lastFireRef.current.set(latest.id, Date.now());
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: 9001,
            title: "🚨 Urgent message from the school",
            body: latest.body.slice(0, 200),
            schedule: { at: new Date(Date.now() + 5_000) },
            sound: undefined,
            ongoing: false,
            autoCancel: true,
          }],
        });
      } catch { /* web fallback or denied */ }
    };

    fire();
    const t = window.setInterval(fire, NOTIFY_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [user, chatThreads, chatMessages, families, students]);

  return null;
}
