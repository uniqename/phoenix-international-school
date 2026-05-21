"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { NACCA_STRANDS, SUBJECTS_BY_LEVEL, CLASSES } from "@/lib/utils";
import LessonDetailModal from "@/components/LessonDetailModal";
import type { LessonPlan, LessonAttachment } from "@/lib/types";
import toast from "react-hot-toast";

function levelFromClass(className: string): string {
  if (className.startsWith("Crèche")) return "creche";
  if (className.startsWith("Nursery")) return "nursery";
  if (className.startsWith("KG")) return "kg";
  if (className.startsWith("Primary")) return "primary";
  return "jhs";
}

const TEN_MB = 10 * 1024 * 1024;

const kindFromMime = (mime: string): LessonAttachment["kind"] => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return "link";
};

export default function LessonsPage() {
  const { user }      = useAuth();
  const lessonPlans   = useAppStore((s) => s.lessonPlans);
  const addLessonPlan = useAppStore((s) => s.addLessonPlan);
  const updateLessonPlan = useAppStore((s) => s.updateLessonPlan);
  const deleteLessonPlan = useAppStore((s) => s.deleteLessonPlan);
  const teachers      = useAppStore((s) => s.teachers);

  const teacher = teachers.find((t) => t.full_name === user?.full_name) ?? teachers[0];
  const [activeClass, setActiveClass] = useState(teacher?.class_name ?? "JHS 3A");

  const level    = levelFromClass(activeClass);
  const subjects = SUBJECTS_BY_LEVEL[level] ?? SUBJECTS_BY_LEVEL.jhs;

  // Authoring form state
  const [subject, setSubject]       = useState(subjects[0]);
  const [strand, setStrand]         = useState("");
  const [subStrand, setSubStrand]   = useState("");
  const [week, setWeek]             = useState(14);
  const [objectives, setObjectives] = useState("");
  const [content, setContent]       = useState("");
  const [experiment, setExperiment] = useState("");
  const [videoUrl, setVideoUrl]     = useState("");
  const [coverUrl, setCoverUrl]     = useState("");
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);
  const [linkName, setLinkName]     = useState("");
  const [linkUrl, setLinkUrl]       = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [detail, setDetail]         = useState<LessonPlan | null>(null);

  const strands   = NACCA_STRANDS[subject] ?? [];
  const strandObj = strands.find((s) => s.strand === strand);

  const myPlans = lessonPlans.filter(
    (lp) => lp.class_name === activeClass || lp.teacher_name === user?.full_name
  );

  const resetForm = () => {
    setSubject(subjects[0]); setStrand(""); setSubStrand(""); setWeek(14);
    setObjectives(""); setContent(""); setExperiment("");
    setVideoUrl(""); setCoverUrl(""); setAttachments([]);
    setLinkName(""); setLinkUrl(""); setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (lp: LessonPlan) => {
    setSubject(lp.subject);
    setStrand(lp.strand);
    setSubStrand(lp.sub_strand);
    setWeek(lp.week_number ?? 1);
    setObjectives(lp.objectives ?? "");
    setContent(lp.content ?? "");
    setExperiment(lp.experiment ?? "");
    setVideoUrl(lp.primary_video_url ?? "");
    setCoverUrl(lp.cover_image_url ?? "");
    setAttachments(lp.attachments ?? []);
    setEditingId(lp.id);
    setDetail(null);
    setShowForm(true);
  };

  const handleClassChange = (c: string) => {
    setActiveClass(c);
    const newSubjects = SUBJECTS_BY_LEVEL[levelFromClass(c)] ?? SUBJECTS_BY_LEVEL.jhs;
    setSubject(newSubjects[0]);
    setStrand(""); setSubStrand(""); setShowForm(false);
  };

  const handleFile = async (file: File) => {
    if (file.size > TEN_MB) {
      toast.error(`${file.name} is over 10 MB — paste a Drive/YouTube link instead.`);
      return;
    }
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(typeof r.result === "string" ? r.result : "");
      r.onerror = () => rej(r.error);
      r.readAsDataURL(file);
    });
    setAttachments((prev) => [...prev, {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      kind: kindFromMime(file.type),
      name: file.name,
      url: dataUrl,
      size: file.size,
    }]);
  };

  const handleSave = (publish: boolean) => {
    if (!strand || !subStrand) { toast.error("Select a strand and sub-strand"); return; }
    const payload = {
      class_name: activeClass,
      subject,
      strand,
      sub_strand: subStrand,
      week_number: week,
      content: content.trim() || undefined,
      objectives: objectives.trim() || undefined,
      experiment: experiment.trim() || undefined,
      primary_video_url: videoUrl.trim() || undefined,
      cover_image_url: coverUrl.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
      teacher_name: user?.full_name,
      is_published: publish,
    };
    if (editingId) {
      updateLessonPlan(editingId, payload);
      toast.success(publish ? "Lesson updated & published" : "Lesson updated as draft");
    } else {
      addLessonPlan(payload);
      toast.success(publish ? "Lesson published" : "Lesson saved as draft");
    }
    resetForm();
    setShowForm(false);
  };

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">📘 Lesson Planner</h2>
          <p className="text-xs text-gray-500">GES-aligned · supports objectives, experiments, video, images, PDFs, audio</p>
        </div>
        <button type="button" onClick={() => showForm ? setShowForm(false) : openCreate()} className="btn-gold text-xs py-2 px-5">
          {showForm ? "Cancel" : "+ New Lesson"}
        </button>
      </div>

      <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-black text-gray-600">Class:</span>
        <div className="flex gap-1.5 flex-wrap">
          {CLASSES.map((c) => (
            <button type="button" key={c} onClick={() => handleClassChange(c)}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={activeClass === c
                ? { background: "#003087", color: "white" }
                : { background: "rgba(0,48,135,0.07)", color: "#003087" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 space-y-4">
          <h3 className="font-black text-gray-900">{editingId ? "Edit lesson" : "New lesson"} — {activeClass}</h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-gray-600">Subject *</span>
              <select aria-label="Subject" value={subject}
                onChange={(e) => { setSubject(e.target.value); setStrand(""); setSubStrand(""); }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900">
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">Week</span>
              <input type="number" aria-label="Week" value={week}
                onChange={(e) => setWeek(Number(e.target.value))} min={1} max={40}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">Strand *</span>
              <select aria-label="Strand" value={strand}
                onChange={(e) => { setStrand(e.target.value); setSubStrand(""); }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900">
                <option value="">— Select strand —</option>
                {strands.map((s) => <option key={s.strand} value={s.strand}>{s.strand}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">Sub-strand *</span>
              <select aria-label="Sub-strand" value={subStrand}
                onChange={(e) => setSubStrand(e.target.value)}
                disabled={!strandObj}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 disabled:opacity-50">
                <option value="">— Select sub-strand —</option>
                {strandObj?.subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-gray-600">🎯 Learning objectives</span>
            <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)}
              aria-label="Objectives"
              rows={2}
              placeholder="By the end of this lesson, students will be able to…"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-gray-600">📖 Lesson content</span>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              aria-label="Lesson content"
              rows={4}
              placeholder="Starter activity, main lesson, group work, plenary…"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none" />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-gray-600">🧪 Experiment / hands-on activity</span>
            <textarea value={experiment} onChange={(e) => setExperiment(e.target.value)}
              aria-label="Experiment"
              rows={3}
              placeholder="Materials needed, step-by-step procedure, expected result…"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none" />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-gray-600">🎥 Primary video URL</span>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                aria-label="Video URL"
                placeholder="YouTube / Drive link"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-600">🖼 Cover image URL</span>
              <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                aria-label="Cover image URL"
                placeholder="https://…"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900" />
            </label>
          </div>

          {/* Attachments */}
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">📎 Attachments (images, PDFs, audio, video ≤ 10 MB each)</p>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <label className="cursor-pointer text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: "rgba(26,63,160,0.08)", color: "#1A3FA0", border: "1px solid rgba(26,63,160,0.25)" }}>
                + Add file
                <input type="file" className="hidden"
                  accept="image/*,application/pdf,audio/*,video/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              </label>
              <span className="text-[11px] text-gray-400">or paste a link:</span>
              <input value={linkName} onChange={(e) => setLinkName(e.target.value)}
                aria-label="Link name"
                placeholder="Label"
                className="flex-1 min-w-[80px] px-2 py-1 rounded-md border border-gray-200 text-xs text-gray-900" />
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                aria-label="Link URL"
                placeholder="https://…"
                className="flex-1 min-w-[120px] px-2 py-1 rounded-md border border-gray-200 text-xs text-gray-900" />
              <button type="button"
                onClick={() => {
                  if (!linkName.trim() || !linkUrl.trim()) return;
                  setAttachments((prev) => [...prev, {
                    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    kind: "link", name: linkName.trim(), url: linkUrl.trim(),
                  }]);
                  setLinkName(""); setLinkUrl("");
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-md"
                style={{ background: "#1A0E4D", color: "white" }}>Add link</button>
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1">
                {attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-gray-100">{a.kind}</span>
                    <span className="flex-1 truncate">{a.name}</span>
                    <button type="button" onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                      className="text-red-500 hover:text-red-700">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => handleSave(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(245,158,11,0.15)", color: "#92400e", border: "1px solid rgba(245,158,11,0.35)" }}>
              📝 Save as draft
            </button>
            <button type="button" onClick={() => handleSave(true)} className="btn-gold flex-1 py-2.5 text-sm">
              ✅ Save &amp; publish to students
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {myPlans.length === 0 ? (
          <div className="col-span-2 glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 text-sm">No lessons yet. Tap <span className="font-bold">+ New Lesson</span>.</p>
          </div>
        ) : myPlans.map((lp) => (
          <button type="button" key={lp.id}
            onClick={() => setDetail(lp)}
            className="glass rounded-2xl p-5 text-left transition-all hover:shadow-md hover:scale-[1.01]">
            {lp.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lp.cover_image_url} alt={lp.strand}
                className="w-full h-28 object-cover rounded-lg mb-2" />
            )}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-black text-gray-900">{lp.subject}</h3>
              {lp.is_published === false && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📝 Draft</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,48,135,0.08)", color: "#003087" }}>{lp.strand}</span>
              {lp.week_number && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Wk {lp.week_number}</span>
              )}
            </div>
            <p className="text-[11px] text-gray-600">{lp.sub_strand}</p>
            {lp.objectives && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lp.objectives}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
              {lp.primary_video_url && <span className="font-bold text-red-600">🎥 Video</span>}
              {lp.experiment && <span className="font-bold text-emerald-700">🧪 Experiment</span>}
              {(lp.attachments?.length ?? 0) > 0 && <span className="font-bold text-blue-700">📎 {lp.attachments!.length}</span>}
              <span className="text-blue-700 font-bold ml-auto">Tap to open →</span>
            </div>
          </button>
        ))}
      </div>

      <LessonDetailModal
        lesson={detail}
        onEdit={() => detail && openEdit(detail)}
        onDelete={() => {
          if (!detail) return;
          if (!window.confirm(`Delete "${detail.strand}"?`)) return;
          deleteLessonPlan(detail.id);
          setDetail(null);
          toast.success("Lesson deleted");
        }}
        onTogglePublish={() => {
          if (!detail) return;
          const next = detail.is_published === false ? true : false;
          updateLessonPlan(detail.id, { is_published: next });
          setDetail({ ...detail, is_published: next });
          toast.success(next ? "Published to students" : "Moved back to drafts");
        }}
        onClose={() => setDetail(null)}
      />
    </DashboardShell>
  );
}
