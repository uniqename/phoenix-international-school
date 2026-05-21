"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

// Admin / Principal chat inbox. Shows every parent thread (both teacher and
// principal threads), lets them reply when they need to step in. Threads
// addressed to "Principal" (teacher_id === 'principal') are highlighted.

export default function AdminChatsPage() {
  const { user } = useAuth();
  const threads = useAppStore((s) => s.chatThreads);
  const allMessages = useAppStore((s) => s.chatMessages);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const markChatThreadRead = useAppStore((s) => s.markChatThreadRead);

  const [filter, setFilter] = useState<'all' | 'principal' | 'teacher'>('all');

  const sortedThreads = useMemo(() => {
    const list = threads.filter((t) => {
      if (filter === 'principal') return t.teacher_id === 'principal';
      if (filter === 'teacher')   return t.teacher_id !== 'principal';
      return true;
    });
    return [...list].sort((a, b) =>
      (b.last_message_at ?? b.created_at).localeCompare(a.last_message_at ?? a.created_at)
    );
  }, [threads, filter]);

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeId && sortedThreads[0]) setActiveId(sortedThreads[0].id);
  }, [activeId, sortedThreads]);

  const activeThread = sortedThreads.find((t) => t.id === activeId);
  const conversation = useMemo(
    () => allMessages.filter((m) => m.thread_id === activeId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [allMessages, activeId],
  );

  useEffect(() => {
    if (activeId && activeThread && activeThread.unread_for_teacher > 0) {
      markChatThreadRead(activeId, 'teacher');
    }
  }, [activeId, activeThread, markChatThreadRead]);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation.length, activeId]);

  const [urgent, setUrgent] = useState(false);
  const send = () => {
    if (!activeId || !draft.trim()) return;
    sendChatMessage(activeId, 'teacher', user?.id, user?.full_name ?? 'Principal', draft, urgent ? 'urgent' : 'normal');
    setDraft("");
    setUrgent(false);
  };

  const totalUnread = threads.reduce((s, t) => s + (t.unread_for_teacher ?? 0), 0);

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">💬 Parent Chats</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every parent thread, including direct-to-principal messages. {totalUnread > 0 && <span className="font-bold text-amber-300">{totalUnread} unread</span>}
          </p>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'principal', 'teacher'] as const).map((f) => (
            <button type="button" key={f} onClick={() => { setFilter(f); setActiveId(null); }}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: filter === f ? "#1A0E4D" : "rgba(255,255,255,0.06)",
                color: filter === f ? "white" : "rgba(196,181,253,0.85)",
                border: `1px solid ${filter === f ? "#1A0E4D" : "rgba(255,255,255,0.12)"}`,
              }}>
              {f === 'all' ? 'All' : f === 'principal' ? '👔 To Principal' : '👩‍🏫 To Teachers'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <aside className="glass rounded-2xl p-3 md:col-span-1 max-h-[70vh] overflow-y-auto">
          {sortedThreads.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No conversations yet.</p>
          ) : sortedThreads.map((t) => {
            const isActive = t.id === activeId;
            const isPrincipal = t.teacher_id === 'principal';
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
                <div className="text-[11px] text-gray-400 mb-1">
                  {isPrincipal ? "👔 To Principal" : `👩‍🏫 ${t.teacher_name ?? "Teacher"}`} · {t.student_name}{t.class_name ? ` · ${t.class_name}` : ""}
                </div>
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
                <p className="text-[11px] text-gray-400">
                  About {activeThread.student_name}{activeThread.class_name ? ` · ${activeThread.class_name}` : ""}
                  {activeThread.teacher_id === 'principal' ? " · 👔 To Principal" : ` · 👩‍🏫 ${activeThread.teacher_name}`}
                </p>
              </header>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversation.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center mt-8">No messages yet. Start with a warm hello 👋</p>
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
                <label className="flex items-center gap-2 text-[11px] cursor-pointer select-none"
                  style={{ color: urgent ? "#fca5a5" : "rgba(255,255,255,0.5)" }}>
                  <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
                  <span>🚨 Send as <strong>urgent</strong> — keeps nagging the parent until they tap &ldquo;I&apos;ve read it&rdquo;</span>
                </label>
                <div className="flex gap-2">
                  <input value={draft}
                    aria-label="Reply"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={urgent ? "Urgent message…" : "Type a reply…"}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none"
                    style={{ border: urgent ? "1px solid rgba(239,68,68,0.6)" : undefined }} />
                  <button type="button" onClick={send} className="btn-gold text-xs px-4">{urgent ? "🚨 Send urgent" : "Send"}</button>
                </div>
              </footer>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-gray-500">Pick a conversation on the left.</div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
