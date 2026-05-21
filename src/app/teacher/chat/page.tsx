"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

// Phase 15c — parent-teacher 1:1 chat. Teacher side: list of threads on the
// left, conversation on the right. Threads filter to those involving this
// teacher (matched on teacher_id when present, else on teacher_name).

const MESSAGE_TEMPLATES = [
  "Thank you for reaching out. I will respond soon.",
  "Your child is doing great in class. Keep encouraging them at home.",
  "I noticed [child] needs extra support in [subject]. Please help them practice.",
  "Please ensure homework is submitted on time.",
  "We have an upcoming test. Please encourage your child to study.",
  "Your child showed great improvement. Well done!",
];

export default function TeacherChatPage() {
  const { user } = useAuth();
  const threads = useAppStore((s) => s.chatThreads);
  const allMessages = useAppStore((s) => s.chatMessages);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const markChatThreadRead = useAppStore((s) => s.markChatThreadRead);

  const myThreads = useMemo(() => {
    const mine = threads.filter((t) =>
      (user?.id && t.teacher_id === user.id) ||
      (user?.full_name && t.teacher_name === user.full_name)
    );
    return [...mine].sort((a, b) =>
      (b.last_message_at ?? b.created_at).localeCompare(a.last_message_at ?? a.created_at)
    );
  }, [threads, user]);

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId && myThreads[0]) setActiveId(myThreads[0].id);
  }, [activeId, myThreads]);

  const activeThread = myThreads.find((t) => t.id === activeId);
  const conversation = useMemo(
    () => allMessages.filter((m) => m.thread_id === activeId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [allMessages, activeId],
  );

  useEffect(() => {
    if (activeId && activeThread && activeThread.unread_for_teacher > 0) {
      markChatThreadRead(activeId, 'teacher');
    }
  }, [activeId, activeThread, markChatThreadRead]);

  const [draft, setDraft] = useState("");
  const [sendLater, setSendLater] = useState(false);
  const [sendTime, setSendTime] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation.length, activeId]);

  const send = () => {
    if (!activeId || !draft.trim()) return;
    if (sendLater && sendTime) {
      const delayMs = new Date(sendTime).getTime() - Date.now();
      if (delayMs > 0) {
        setTimeout(() => {
          sendChatMessage(activeId, 'teacher', user?.id, user?.full_name, draft);
        }, delayMs);
      }
    } else {
      sendChatMessage(activeId, 'teacher', user?.id, user?.full_name, draft);
    }
    setDraft("");
    setSendLater(false);
    setSendTime("");
    setShowTemplates(false);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">💬 Parent Chat</h2>
        <p className="text-xs text-gray-500 mt-0.5">Private 1:1 conversations with parents about their child.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <aside className="glass rounded-2xl p-3 md:col-span-1 max-h-[70vh] overflow-y-auto">
          {myThreads.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No conversations yet. Parents open chats from their portal.</p>
          ) : myThreads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <button key={t.id} type="button" onClick={() => setActiveId(t.id)}
                className="w-full text-left p-3 rounded-xl mb-1 transition-all"
                style={{
                  background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm text-white truncate">{t.parent_name ?? "Parent"}</span>
                  {t.unread_for_teacher > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{t.unread_for_teacher}</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 mb-1">{t.student_name}{t.class_name ? ` · ${t.class_name}` : ""}</div>
                <div className="text-xs text-gray-300 truncate">{t.last_message_preview ?? "— no messages yet —"}</div>
              </button>
            );
          })}
        </aside>

        <section className="glass rounded-2xl flex flex-col md:col-span-2 max-h-[70vh]">
          {activeThread ? (
            <>
              <header className="p-4 border-b border-white/10">
                <p className="font-bold text-white">{activeThread.parent_name ?? "Parent"}</p>
                <p className="text-[11px] text-gray-400">About {activeThread.student_name}{activeThread.class_name ? ` · ${activeThread.class_name}` : ""}</p>
              </header>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversation.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center mt-8">Start the conversation with a friendly hello 👋</p>
                ) : conversation.map((m) => {
                  const mine = m.sender_role === 'teacher';
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
              <footer className="p-3 border-t border-white/10 space-y-2">
                {showTemplates && (
                  <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                    {MESSAGE_TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDraft(t);
                          setShowTemplates(false);
                        }}
                        className="w-full text-left text-xs p-2 rounded-lg hover:bg-white/10 text-gray-300">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Type a message…"
                    className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none" />
                  <button type="button" onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white">
                    📋
                  </button>
                  <button type="button" onClick={send} className="btn-gold text-xs px-4">Send</button>
                </div>
                <button type="button" onClick={() => setSendLater(!sendLater)}
                  className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                  style={{ background: sendLater ? "rgba(168,85,247,0.2)" : "transparent", color: sendLater ? "#d8b4fe" : "#9ca3af" }}>
                  {sendLater ? "✓ Send later" : "⏰ Send later"}
                </button>
                {sendLater && (
                  <input type="datetime-local" aria-label="Send at" value={sendTime} onChange={(e) => setSendTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none" />
                )}
              </footer>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-gray-500">No conversations yet.</div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
