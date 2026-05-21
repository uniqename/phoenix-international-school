"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { getGESColor, getGESLabel, calculateAggregate, aggregateRating } from "@/lib/utils";
import HomeworkDetailModal from "@/components/HomeworkDetailModal";
import FeedPostModal from "@/components/FeedPostModal";
import LessonDetailModal from "@/components/LessonDetailModal";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import type { HomeworkAssignment, FeedPost, LessonPlan } from "@/lib/types";
import toast from "react-hot-toast";

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const NAV = [
  { icon: "🏠", label: "Dashboard",    href: "/student" },
  { icon: "📊", label: "My Grades",    href: "/student#grades" },
  { icon: "📚", label: "Homework",     href: "/student#homework" },
  { icon: "📝", label: "Assignments",  href: "/student/assignments" },
  { icon: "💻", label: "Lessons",      href: "/student#lessons" },
  { icon: "🎓", label: "Practice",     href: "/bece" },
  { icon: "💬", label: "Messages",     href: "/student/chat" },
  { icon: "📸", label: "School Feed",  href: "/student#feed" },
  { icon: "📖", label: "Library",      href: "/library" },
];

export default function StudentPortal() {
  const { user }   = useAuth();
  const students   = useAppStore((s) => s.students);
  const grades     = useAppStore((s) => s.grades);
  const homework   = useAppStore((s) => s.homework);
  const beceAttempts = useAppStore((s) => s.beceAttempts);
  const feedPosts  = useAppStore((s) => s.feedPosts);
  const toggleLikePost = useAppStore((s) => s.toggleLikePost);
  const feedComments = useAppStore((s) => s.feedComments);
  const addComment = useAppStore((s) => s.addComment);
  const deleteComment = useAppStore((s) => s.deleteComment);
  const homeworkSubmissions = useAppStore((s) => s.homeworkSubmissions);
  const submitHomeworkFn    = useAppStore((s) => s.submitHomework);
  const studentEngagements = useAppStore((s) => s.studentEngagements);
  const getOrCreateStudentEngagement = useAppStore((s) => s.getOrCreateStudentEngagement);
  const toggleCommentReaction = useAppStore((s) => s.toggleCommentReaction);

  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [hwDetail, setHwDetail] = useState<HomeworkAssignment | null>(null);
  const [feedDetail, setFeedDetail] = useState<FeedPost | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonPlan | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const lessons = useAppStore((s) => s.lessonPlans);

  const student    = students.find((s) => s.full_name === user?.full_name) ?? students[0];
  const myGrades   = grades.filter((g) => g.student_id === student?.id);
  const myHW       = homework.filter((h) => h.class_name === student?.class_name);
  const myAttempts = beceAttempts.filter((a) => a.student_id === student?.id);

  const mySubmissions = Object.fromEntries(
    homeworkSubmissions.filter((s) => s.student_id === student?.id).map((s) => [s.homework_id, s])
  );

  const handleSubmit = (hwId: string) => {
    const file = pendingFiles[hwId];
    if (!file || !student) return;
    // Cap files at ~10 MB so we don't blow up localStorage. Anything bigger
    // should be shared via WhatsApp/email — we save the metadata only.
    const TEN_MB = 10 * 1024 * 1024;
    if (file.size > TEN_MB) {
      submitHomeworkFn(hwId, student.id, student.full_name, file.name, file.type, file.size);
      setPendingFiles((p) => ({ ...p, [hwId]: null }));
      toast("File saved as note only — too large to attach. Send via WhatsApp to your teacher.", { duration: 6000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : undefined;
      submitHomeworkFn(hwId, student.id, student.full_name, file.name, file.type, file.size, dataUrl);
      setPendingFiles((p) => ({ ...p, [hwId]: null }));
      toast.success("Homework submitted! Your teacher can now download it.");
    };
    reader.onerror = () => toast.error("Couldn't read the file. Try a smaller one.");
    reader.readAsDataURL(file);
  };

  const aggregate = myGrades.length ? calculateAggregate(myGrades) : null;
  const avgScore  = myGrades.length ? Math.round(myGrades.reduce((s, g) => s + g.raw_score, 0) / myGrades.length) : null;

  const subjectScores = myGrades.map((g) => ({ subject: g.subject, score: g.raw_score, ges: g.ges_grade }));
  const weakSubjects  = subjectScores.filter((s) => s.score < 60).sort((a, b) => a.score - b.score);

  return (
    <DashboardShell role="student" navItems={NAV}>
      {/* Hero */}
      <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        style={{ background: "linear-gradient(135deg, #E5B800, #FFD700)" }}>
        {student && (
          <ProfilePhotoUploader studentId={student.id}
            currentUrl={student.photo_url}
            fallbackEmoji={student.gender === "female" ? "👧" : "👦"}
            size={72} rounded="2xl" />
        )}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-black text-black mb-0.5">{student?.full_name ?? user?.full_name}</h2>
          <p className="text-yellow-800 text-sm mb-2">{student?.class_name} · {student?.student_id}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {avgScore !== null && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">Avg: {avgScore}%</span>}
            {aggregate !== null && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">Aggregate: {aggregate}</span>}
            {myAttempts.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-black/10">BECE Attempts: {myAttempts.length}</span>}
          </div>
        </div>
        <Link href="/bece"
          className="whitespace-nowrap text-sm px-5 py-2.5 rounded-full font-black flex-shrink-0"
          style={{ background: "#0A1628", color: "#FFD700" }}>
          {student?.level === "jhs" ? "BECE Practice →"
            : student?.level === "primary" ? "Practice Quiz →"
            : student?.level === "kg" ? "Fun Activities →"
            : student?.level === "creche" || student?.level === "nursery" ? "Story Time →"
            : "Practice →"}
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Grades */}
        <div id="grades" className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">My Grades — Term {myGrades[0]?.term ?? 2}</h3>
          {myGrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No grades available yet.</p>
          ) : (
            <>
              <div className="space-y-2.5 mb-3">
                {myGrades.map((g) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-28 text-xs font-semibold text-gray-600 truncate">{g.subject}</div>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${g.raw_score}%`, background: getGESColor(g.ges_grade) }} />
                    </div>
                    <div className="w-8 text-xs font-black text-gray-900">{g.raw_score}</div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: getGESColor(g.ges_grade) + "20", color: getGESColor(g.ges_grade) }}>
                      {getGESLabel(g.ges_grade)}
                    </span>
                  </div>
                ))}
              </div>
              {aggregate !== null && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black" style={{ color: "#E5B800" }}>{aggregate}</div>
                    <div className="text-xs text-gray-600">{aggregateRating(aggregate)}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Homework */}
        <div id="homework" className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">Homework Due</h3>
          {myHW.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No homework assigned.</p>
          ) : (
            <div className="space-y-3">
              {myHW.map((hw) => {
                const overdue    = new Date(hw.due_date) < new Date();
                const submission = mySubmissions[hw.id];
                const pending    = pendingFiles[hw.id];
                return (
                  <div key={hw.id} className="p-3 rounded-xl"
                    style={{ background: overdue ? "rgba(239,68,68,0.05)" : "rgba(0,48,135,0.05)" }}>
                    <button type="button" onClick={() => setHwDetail(hw)}
                      className="w-full text-left">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-gray-800">{hw.subject}</span>
                        <span className={`text-[10px] font-bold ${overdue ? "text-red-500" : "text-orange-500"}`}>
                          {overdue ? "Overdue" : `Due ${hw.due_date}`}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700 mb-0.5 underline decoration-dotted">{hw.title}</div>
                      {hw.description && (
                        <div className="text-[11px] text-gray-500 mb-1 line-clamp-2">{hw.description}</div>
                      )}
                      <div className="text-[10px] text-blue-700 font-bold mb-1">Tap for full instructions →</div>
                    </button>
                    {hw.video_url && (
                      <a href={hw.video_url} target="_blank" rel="noreferrer"
                        className="text-[11px] text-blue-600 font-bold hover:underline mb-1 block">
                        📹 Watch explanation
                      </a>
                    )}

                    {/* Submission status / upload */}
                    {submission ? (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg"
                        style={{ background: "rgba(34,197,94,0.1)" }}>
                        <span className="text-xs font-black text-green-600">✅ Submitted</span>
                        <span className="text-[11px] text-gray-600 truncate flex-1">{submission.file_name}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtSize(submission.file_size)}</span>
                        <label className="cursor-pointer text-[10px] text-blue-500 font-bold flex-shrink-0 hover:underline">
                          Replace
                          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFiles((p) => ({ ...p, [hw.id]: f })); e.target.value = ""; }} />
                        </label>
                      </div>
                    ) : pending ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 min-w-0 text-[11px] text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 truncate">
                          📄 {pending.name} <span className="text-gray-400">({fmtSize(pending.size)})</span>
                        </div>
                        <button type="button" onClick={() => handleSubmit(hw.id)}
                          className="text-xs font-black px-3 py-1.5 rounded-lg flex-shrink-0"
                          style={{ background: "#22c55e", color: "white" }}>Submit →</button>
                        <button type="button" onClick={() => setPendingFiles((p) => ({ ...p, [hw.id]: null }))}
                          className="text-xs text-gray-400 hover:text-red-400 flex-shrink-0">✕</button>
                      </div>
                    ) : (
                      <label className="mt-2 cursor-pointer inline-block">
                        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFiles((p) => ({ ...p, [hw.id]: f })); e.target.value = ""; }} />
                        <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg inline-block"
                          style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>
                          📎 Attach & Submit Work
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BECE Weak Areas */}
      {weakSubjects.length > 0 && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(135deg, #0A1628, #003087)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white">🎯 BECE — Weak Areas to Focus On</h3>
            <Link href="/bece" className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: "#FFD700", color: "#0A1628" }}>Practice Now →</Link>
          </div>
          <div className="space-y-2">
            {weakSubjects.map((s) => (
              <div key={s.subject} className="flex items-center gap-3">
                <div className="w-24 text-xs text-blue-300 font-semibold">{s.subject}</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: getGESColor(s.ges) }} />
                </div>
                <span className="text-xs font-black text-white w-8">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BECE Practice History */}
      {myAttempts.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-3">BECE Practice History</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {myAttempts.slice(-8).map((a) => (
              <div key={a.id} className="p-3 rounded-xl text-center"
                style={{ background: a.percentage >= 70 ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)" }}>
                <div className="text-xs font-bold text-gray-700">{a.subject}</div>
                <div className="text-xl font-black mt-1" style={{ color: a.percentage >= 70 ? "#22c55e" : "#f59e0b" }}>
                  {a.percentage}%
                </div>
                <div className="text-[10px] text-gray-400">{a.score}/{a.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement & Achievements */}
      {student && (() => {
        const engagement = getOrCreateStudentEngagement(student.id);
        return (
          <div className="glass rounded-2xl p-5 mb-5">
            <h3 className="font-black text-gray-900 mb-4">🎮 Your Learning Streak</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {/* Streak Counter */}
              <div className="p-4 rounded-xl text-center" style={{ background: "rgba(234,179,8,0.08)" }}>
                <div className="text-3xl font-black text-amber-600 mb-1">{engagement.practice_streak}</div>
                <div className="text-xs font-bold text-gray-600">Day Streak</div>
                <div className="text-[10px] text-gray-500 mt-1">Keep it up!</div>
              </div>
              {/* Total Points */}
              <div className="p-4 rounded-xl text-center" style={{ background: "rgba(168,85,247,0.08)" }}>
                <div className="text-3xl font-black text-purple-600 mb-1">{engagement.total_points}</div>
                <div className="text-xs font-bold text-gray-600">Points Earned</div>
                <div className="text-[10px] text-gray-500 mt-1">Practice & achieve</div>
              </div>
              {/* Homework Stats */}
              <div className="p-4 rounded-xl text-center" style={{ background: "rgba(59,130,246,0.08)" }}>
                <div className="text-3xl font-black text-blue-600 mb-1">{engagement.homework_submitted_count}</div>
                <div className="text-xs font-bold text-gray-600">Homework Done</div>
                <div className="text-[10px] text-gray-500 mt-1">{engagement.homework_on_time_count} on time</div>
              </div>
            </div>
            {/* Badges */}
            {engagement.achievements.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Unlocked Badges</p>
                <div className="flex flex-wrap gap-2">
                  {engagement.achievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}>
                      <span className="text-lg">{a.emoji}</span>
                      <div className="text-[10px]">
                        <div className="font-bold text-gray-900">{a.badge_name}</div>
                        <div className="text-gray-600">{a.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* My gate check-in code — show this at the school gate every morning */}
      {student && (
        <div className="glass rounded-2xl p-5 mb-5 flex items-center gap-4 flex-wrap">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">My check-in code</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(student.student_id)}`}
              alt="Gate QR code"
              className="rounded-lg bg-white p-1"
              width={140} height={140} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-mono font-black text-gray-900 break-all">{student.student_id}</p>
            <p className="text-xs text-gray-600 mt-2">
              Show this code (or the number above) at the school gate every morning. The kiosk will mark you present and stamp your arrival time.
            </p>
          </div>
        </div>
      )}

      {/* Lessons — pulls from teacher Lesson Planner */}
      <div id="lessons" className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-black text-gray-900">💻 My Lessons</h3>
          <span className="text-[10px] text-gray-500">Recorded + planned by your teachers</span>
        </div>
        {(() => {
          // Students only see published lessons (teacher draft mode hides them).
          const myLessons = lessons.filter((l) =>
            l.class_name === student?.class_name && l.is_published !== false);
          if (myLessons.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-4">No lessons added yet — your teacher will publish them here.</p>;
          }
          return (
            <div className="grid sm:grid-cols-2 gap-3">
              {myLessons.slice(0, 8).map((l) => (
                <button type="button" key={l.id}
                  onClick={() => setLessonDetail(l)}
                  className="w-full text-left p-3 rounded-xl transition-all hover:shadow-md hover:scale-[1.01]"
                  style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(107,33,168,0.15)" }}>
                  {l.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.cover_image_url} alt={l.strand}
                      className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B21A8" }}>
                    📘 {l.subject}{l.week_number ? ` · Wk ${l.week_number}` : ""}
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{l.strand}</div>
                  <div className="text-xs text-gray-600">{l.sub_strand}</div>
                  {l.objectives && <div className="text-[11px] text-gray-500 mt-1 line-clamp-2 whitespace-pre-wrap">{l.objectives}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {l.primary_video_url && <span className="text-[10px] font-bold text-red-600">🎥 Video</span>}
                    {l.experiment && <span className="text-[10px] font-bold text-emerald-700">🧪 Experiment</span>}
                    {(l.attachments?.length ?? 0) > 0 && <span className="text-[10px] font-bold text-blue-700">📎 {l.attachments!.length}</span>}
                    <span className="text-[10px] text-blue-700 font-bold ml-auto">Tap to open →</span>
                  </div>
                  {l.teacher_name && <div className="text-[10px] text-gray-400 mt-1.5">— {l.teacher_name}</div>}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Feed */}
      <div id="feed" className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-3">📸 School Feed</h3>
        <div className="space-y-2">
          {feedPosts.filter((p) => (p.status ?? "approved") === "approved").slice(0, 5).map((p) => {
            const isExpanded = expandedPostId === p.id;
            const postCommentCount = feedComments.filter((c) => c.post_id === p.id).length;
            return (
            <div key={p.id} className={`rounded-xl bg-gray-50 overflow-hidden transition ${isExpanded ? 'ring-2 ring-purple-500' : ''}`}>
              <button type="button"
                onClick={() => setFeedDetail(p)}
                className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-100 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-sm truncate">{p.title}</div>
                  {p.content && <div className="text-[11px] text-gray-600 line-clamp-1">{p.content}</div>}
                  <div className="text-[10px] text-gray-400 mt-0.5">{p.author_name} · Tap to read →</div>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
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
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setExpandedPostId(isExpanded ? null : p.id); }}
                    className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    💬 {postCommentCount}
                  </button>
                </div>
              </button>
              {isExpanded && (
                <CommentSection
                  postId={p.id}
                  comments={feedComments}
                  onAddComment={(body) => {
                    if (user) {
                      addComment(p.id, {
                        author_name: user.full_name,
                        author_role: 'student',
                        body,
                      });
                    }
                  }}
                  onDeleteComment={deleteComment}
                  onToggleReaction={toggleCommentReaction}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                  currentUserName={user?.full_name}
                />
              )}
            </div>
            );
          })}
        </div>
      </div>

      <HomeworkDetailModal
        homework={hwDetail}
        mySubmission={hwDetail && student ? Object.values(mySubmissions).find((s) => s.homework_id === hwDetail.id) : undefined}
        onSubmitWork={() => {
          if (!hwDetail) return;
          // Scroll the matching homework card into view; the user picks a file there.
          setHwDetail(null);
          setTimeout(() => {
            const el = document.getElementById("homework");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
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
    </DashboardShell>
  );
}
