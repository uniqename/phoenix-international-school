"use client";
import type { LessonPlan } from "@/lib/types";

interface Props {
  lesson: LessonPlan | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublish?: () => void;
  onClose: () => void;
}

function youTubeEmbed(url: string): string | null {
  // Convert common YouTube URLs (watch?v=, youtu.be/, shorts/, embed/) to /embed/<id>.
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const m = u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch { /* not a url */ }
  return null;
}

export default function LessonDetailModal({ lesson, onEdit, onDelete, onTogglePublish, onClose }: Props) {
  if (!lesson) return null;
  const embed = lesson.primary_video_url ? youTubeEmbed(lesson.primary_video_url) : null;
  const isDraft = lesson.is_published === false;

  const images = (lesson.attachments ?? []).filter((a) => a.kind === "image");
  const videos = (lesson.attachments ?? []).filter((a) => a.kind === "video");
  const pdfs   = (lesson.attachments ?? []).filter((a) => a.kind === "pdf");
  const audios = (lesson.attachments ?? []).filter((a) => a.kind === "audio");
  const links  = (lesson.attachments ?? []).filter((a) => a.kind === "link");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,30,0.8)" }}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {lesson.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lesson.cover_image_url} alt={lesson.strand}
            className="w-full max-h-56 object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                📘 {lesson.subject}{lesson.week_number ? ` · Week ${lesson.week_number}` : ""}{lesson.class_name ? ` · ${lesson.class_name}` : ""}
              </p>
              <h3 className="font-black text-gray-900 text-xl mt-0.5 break-words">{lesson.strand}</h3>
              <p className="text-sm text-gray-600">{lesson.sub_strand}</p>
              {lesson.teacher_name && (
                <p className="text-xs text-gray-500 mt-1">By {lesson.teacher_name}</p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none flex-shrink-0">×</button>
          </div>

          {isDraft && onTogglePublish && (
            <div className="rounded-lg px-3 py-2 text-xs font-bold mb-4"
              style={{ background: "rgba(245,158,11,0.1)", color: "#92400e", border: "1px solid rgba(245,158,11,0.3)" }}>
              📝 Draft — students can&apos;t see this yet.
            </div>
          )}

          {embed && (
            <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black">
              <iframe src={embed} title={lesson.strand}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full" />
            </div>
          )}
          {lesson.primary_video_url && !embed && (
            <a href={lesson.primary_video_url} target="_blank" rel="noopener noreferrer"
              className="block mb-4 text-sm font-bold text-blue-700 underline break-all">
              🎥 Open video
            </a>
          )}

          {lesson.objectives && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">🎯 Learning objectives</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.objectives}</p>
            </section>
          )}

          {lesson.content && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">📖 Lesson content</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.content}</p>
            </section>
          )}

          {lesson.experiment && (
            <section className="mb-4 rounded-xl p-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">🧪 Experiment / Hands-on activity</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.experiment}</p>
            </section>
          )}

          {images.length > 0 && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">📷 Images ({images.length})</p>
              <div className="grid grid-cols-3 gap-1">
                {images.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={a.id} src={a.url} alt={a.name}
                    className="w-full aspect-square object-cover rounded-lg" />
                ))}
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">🎬 Videos ({videos.length})</p>
              <div className="space-y-1">
                {videos.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-blue-700 underline break-all">▶ {a.name}</a>
                ))}
              </div>
            </section>
          )}

          {audios.length > 0 && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">🎧 Audio ({audios.length})</p>
              <div className="space-y-2">
                {audios.map((a) => (
                  <div key={a.id}>
                    <p className="text-xs text-gray-600 mb-0.5">{a.name}</p>
                    <audio controls src={a.url} className="w-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {pdfs.length > 0 && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">📄 PDFs ({pdfs.length})</p>
              <div className="space-y-1">
                {pdfs.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-blue-700 underline break-all">📄 {a.name}</a>
                ))}
              </div>
            </section>
          )}

          {links.length > 0 && (
            <section className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">🔗 Resources</p>
              <div className="space-y-1">
                {links.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-blue-700 underline break-all">🔗 {a.name}</a>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {onTogglePublish && (
              <button type="button" onClick={onTogglePublish}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={isDraft
                  ? { background: "#10b981", color: "white" }
                  : { background: "rgba(245,158,11,0.12)", color: "#92400e", border: "1px solid rgba(245,158,11,0.3)" }}>
                {isDraft ? "✅ Publish to students" : "📝 Move to drafts"}
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
