"use client";
import type { HomeworkAssignment, HomeworkSubmission } from "@/lib/types";

interface Props {
  homework: HomeworkAssignment | null;
  // Optional per-role extras
  mySubmission?: HomeworkSubmission;        // parent / student view
  onSubmitWork?: () => void;                // parent / student
  onEdit?: () => void;                      // teacher
  onDelete?: () => void;                    // teacher
  onClose: () => void;
}

// Single reusable modal used from student, parent, and teacher homework lists.
// Closes the loop on "I see a homework banner but can't tap it" — every entry
// now opens this with the full title, due date, instructions and teacher.

export default function HomeworkDetailModal({ homework, mySubmission, onSubmitWork, onEdit, onDelete, onClose }: Props) {
  if (!homework) return null;

  const dueDate = new Date(homework.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDayStart = new Date(homework.due_date);
  dueDayStart.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.round((dueDayStart.getTime() - today.getTime()) / msPerDay);
  const isOverdue = daysLeft < 0;
  const isToday = daysLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,30,0.7)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                📚 {homework.subject} · {homework.class_name}
              </p>
              <h3 className="font-black text-gray-900 text-lg mt-0.5 break-words">{homework.title}</h3>
              {homework.teacher_name && (
                <p className="text-xs text-gray-600 mt-0.5">Set by {homework.teacher_name}</p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none flex-shrink-0">×</button>
          </div>

          {/* Due banner */}
          <div className="rounded-xl px-3 py-2 text-xs font-bold mb-4"
            style={{
              background: isOverdue ? "rgba(239,68,68,0.1)" : isToday ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.1)",
              color: isOverdue ? "#b91c1c" : isToday ? "#92400e" : "#065f46",
              border: `1px solid ${isOverdue ? "rgba(239,68,68,0.3)" : isToday ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
            }}>
            {isOverdue
              ? `⏰ Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} · was due ${dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
              : isToday
                ? `⏳ Due TODAY (${dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })})`
                : `📅 Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"} · ${dueDate.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}`}
          </div>

          {/* Instructions */}
          {homework.description ? (
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Instructions</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{homework.description}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic mb-4">— No additional instructions given. Ask the teacher if you need clarification. —</p>
          )}

          {/* Optional video / link */}
          {homework.video_url && (
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Resources</p>
              <a href={homework.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 underline break-all">
                🎥 Watch / open resource
              </a>
            </div>
          )}

          {/* Submission status (parent / student) */}
          {mySubmission && (
            <div className="rounded-xl p-3 mb-4"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">✅ Submitted</p>
              <p className="text-xs text-gray-700">
                <span className="font-mono">{mySubmission.file_name}</span> on {new Date(mySubmission.submitted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              {mySubmission.score != null && (
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-0.5">📝 Teacher graded</p>
                  <p className="text-lg font-black text-emerald-700">{mySubmission.score} / 100</p>
                  {mySubmission.teacher_comment && (
                    <p className="text-xs text-gray-700 italic mt-1">&ldquo;{mySubmission.teacher_comment}&rdquo;</p>
                  )}
                  {mySubmission.graded_by && (
                    <p className="text-[10px] text-gray-400 mt-0.5">— {mySubmission.graded_by}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Teacher progress (when shown by teacher) */}
          {typeof homework.submission_count === "number" && (
            <div className="rounded-xl p-3 mb-4"
              style={{ background: "rgba(26,63,160,0.06)", border: "1px solid rgba(26,63,160,0.15)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1">📊 Submissions</p>
              <p className="text-sm font-bold text-gray-800">
                {homework.submission_count}
                {homework.total_students ? ` of ${homework.total_students}` : ""} student{homework.submission_count === 1 ? "" : "s"} have submitted
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {onSubmitWork && (
              <button type="button" onClick={onSubmitWork}
                className="btn-gold flex-1 py-2.5 text-sm">
                {mySubmission ? "📎 Replace submission" : "📎 Submit work"}
              </button>
            )}
            {onEdit && (
              <button type="button" onClick={onEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "rgba(26,63,160,0.1)", color: "#1A3FA0", border: "1px solid rgba(26,63,160,0.25)" }}>
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete}
                className="px-3 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "rgba(239,68,68,0.1)", color: "#b91c1c", border: "1px solid rgba(239,68,68,0.25)" }}>
                🗑️ Delete
              </button>
            )}
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
