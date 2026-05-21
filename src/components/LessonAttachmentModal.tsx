"use client";
import { useState } from "react";
import type { LessonAttachment } from "@/lib/types";
import toast from "react-hot-toast";

interface LessonAttachmentModalProps {
  attachments: LessonAttachment[];
  onAddAttachment: (attachment: Omit<LessonAttachment, "id">) => void;
  onRemoveAttachment: (id: string) => void;
  onClose: () => void;
}

const ATTACHMENT_KINDS = ["image", "video", "pdf", "link", "audio"] as const;

export default function LessonAttachmentModal({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onClose,
}: LessonAttachmentModalProps) {
  const [form, setForm] = useState({
    kind: "image" as typeof ATTACHMENT_KINDS[number],
    name: "",
    url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      toast.error("Name and URL required");
      return;
    }
    onAddAttachment({
      kind: form.kind,
      name: form.name,
      url: form.url,
      size: 0,
    });
    setForm({ kind: "image", name: "", url: "" });
    toast.success("Attachment added");
  };

  const kindEmoji: Record<typeof ATTACHMENT_KINDS[number], string> = {
    image: "🖼️",
    video: "🎥",
    pdf: "📄",
    link: "🔗",
    audio: "🎵",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-black text-gray-900 mb-4">📎 Lesson Materials</h2>

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-purple-50 rounded-xl">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as typeof ATTACHMENT_KINDS[number] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ATTACHMENT_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {kindEmoji[k]} {k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Biology Chapter 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">URL *</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://example.com/file.pdf or data:..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Use direct URLs or paste data: URLs from file uploads
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition"
              >
                Add Material
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ kind: "image", name: "", url: "" });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Attachments List */}
        <div className="space-y-2 mb-4">
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No materials yet</p>
          ) : (
            attachments.map((att) => (
              <div key={att.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{kindEmoji[att.kind]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{att.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{att.url}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveAttachment(att.id);
                    toast.success("Material removed");
                  }}
                  className="ml-2 text-xs text-red-600 hover:text-red-700 font-bold flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
