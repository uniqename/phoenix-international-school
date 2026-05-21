"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

// Student-side chat: same engine as parent chat. Tabs for Class Teacher and
// Principal. Threads are tagged with the student id so the teacher portal
// sees who is writing.

const NAV = [
  { icon: "🏠", label: "Dashboard",    href: "/student" },
  { icon: "📊", label: "My Grades",    href: "/student#grades" },
  { icon: "📚", label: "Homework",     href: "/student#homework" },
  { icon: "💻", label: "Lessons",      href: "/student#lessons" },
  { icon: "🎓", label: "Practice",     href: "/bece" },
  { icon: "💬", label: "Messages",     href: "/student/chat" },
  { icon: "📸", label: "School Feed",  href: "/student#feed" },
  { icon: "📖", label: "Library",      href: "/library" },
];

export default function StudentChatPage() {
  const { user } = useAuth();
  const students = useAppStore((s) => s.students);
  const teachers = useAppStore((s) => s.teachers);
  const allMessages = useAppStore((s) => s.chatMessages);
  const getOrCreateChatThread = useAppStore((s) => s.getOrCreateChatThread);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const markChatThreadRead = useAppStore((s) => s.markChatThreadRead);

  const student = students.find((s) => s.full_name === user?.full_name) ?? students[0];
  const classTeacher = teachers.find((t) => t.class_name === student?.class_name);

  const [recipient, setRecipient] = useState<'teacher' | 'principal'>('teacher');
  // Stable thread key per student. Uses student.id so messages don't bleed
  // with their parent's chats (parent uses family_id).
  const studentKey = student ? `student-${student.id}` : `unknown-${user?.id ?? "x"}`;

  const teacherThread = useMemo(() => {
    if (!student || !classTeacher) return null;
    return getOrCreateChatThread({
      family_id: studentKey,
      parent_name: student.full_name,
      teacher_id: classTeacher.id,
      teacher_name: classTeacher.full_name,
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, classTeacher?.id]);

  const principalThread = useMemo(() => {
    if (!student) return null;
    return getOrCreateChatThread({
      family_id: studentKey,
      parent_name: student.full_name,
      teacher_id: 'principal',
      teacher_name: 'Principal',
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  const thread = recipient === 'teacher' ? teacherThread : principalThread;
  const recipientName = recipient === 'teacher' ? classTeacher?.full_name : 'Principal';

  const conversation = useMemo(
    () => allMessages.filter((m) => m.thread_id === thread?.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [allMessages, thread?.id],
  );

  useEffect(() => {
    if (thread && thread.unread_for_parent > 0) markChatThreadRead(thread.id, 'parent');
  }, [thread, markChatThreadRead]);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation.length, thread?.id]);

  const send = () => {
    if (!thread || !draft.trim()) return;
    sendChatMessage(thread.id, 'parent', user?.id, student?.full_name ?? user?.full_name, draft);
    setDraft("");
  };

  return (
    <DashboardShell role="student" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">💬 Messages</h2>
        <p className="text-xs text-gray-500 mt-0.5">Talk to your class teacher or the principal.</p>
      </div>

      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => setRecipient('teacher')}
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{
            background: recipient === 'teacher' ? "#1A0E4D" : "rgba(255,255,255,0.06)",
            color: recipient === 'teacher' ? "white" : "rgba(196,181,253,0.85)",
            border: `1px solid ${recipient === 'teacher' ? "#1A0E4D" : "rgba(255,255,255,0.12)"}`,
          }}>
          👩‍🏫 Class Teacher{classTeacher ? "" : " (unassigned)"}
        </button>
        <button type="button" onClick={() => setRecipient('principal')}
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{
            background: recipient === 'principal' ? "#1A0E4D" : "rgba(255,255,255,0.06)",
            color: recipient === 'principal' ? "white" : "rgba(196,181,253,0.85)",
            border: `1px solid ${recipient === 'principal' ? "#1A0E4D" : "rgba(255,255,255,0.12)"}`,
          }}>
          👔 Principal
        </button>
      </div>

      {recipient === 'teacher' && !classTeacher ? (
        <div className="glass rounded-2xl p-6 text-center text-sm text-gray-500">
          No class teacher assigned for {student?.class_name} yet — switch to Principal to send a message instead.
        </div>
      ) : (
        <div className="glass rounded-2xl flex flex-col max-h-[70vh]">
          <header className="p-3 border-b border-white/10">
            <p className="text-sm font-bold text-white">{recipientName ?? "School"}</p>
            <p className="text-[11px] text-gray-400">{student?.class_name}</p>
          </header>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[50vh]">
            {conversation.length === 0 ? (
              <p className="text-xs text-gray-500 text-center mt-8">Be polite — your message goes straight to {recipientName ?? "the school"}.</p>
            ) : conversation.map((m) => {
              const mine = m.sender_role === 'parent';
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                    style={{
                      background: mine ? "#1A0E4D" : "rgba(255,255,255,0.08)",
                      color: mine ? "white" : "#e5e7eb",
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
          <footer className="p-3 border-t border-white/10 flex gap-2">
            <input value={draft}
              aria-label="Message"
              placeholder="Type a message…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none" />
            <button type="button" onClick={send} className="btn-gold text-xs px-4">Send</button>
          </footer>
        </div>
      )}
    </DashboardShell>
  );
}
