"use client";
import type { FeedPost } from "@/lib/types";

interface Props {
  post: FeedPost | null;
  onLike?: () => void;
  onClose: () => void;
}

// Read-only modal for parents / students / teachers to see the full feed post
// (title, full caption, all album images, author + date). Replaces the
// "I only see the title and a heart icon" experience.

export default function FeedPostModal({ post, onLike, onClose }: Props) {
  if (!post) return null;

  const images = [post.image_url, ...(post.image_urls ?? [])]
    .filter((u): u is string => !!u);
  const uniqueImages = [...new Set(images)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,30,0.8)" }}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Album */}
        {uniqueImages.length > 0 && (
          <div className="bg-black/5">
            {uniqueImages.length === 1 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uniqueImages[0]} alt={post.title}
                className="w-full max-h-80 object-cover" />
            ) : (
              <div className="grid grid-cols-2 gap-0.5 max-h-96 overflow-y-auto">
                {uniqueImages.map((u, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={u} alt={`${post.title} photo ${i + 1}`}
                    className="w-full aspect-square object-cover" />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-black text-gray-900 text-lg break-words">{post.title}</h3>
            <button type="button" onClick={onClose} aria-label="Close"
              className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none flex-shrink-0">×</button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            {post.author_name && <span className="font-bold">{post.author_name}</span>}
            {post.author_role && <span className="capitalize opacity-70">· {post.author_role}</span>}
            <span>· {new Date(post.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>

          {post.content && (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
              {post.content}
            </p>
          )}

          {uniqueImages.length > 1 && (
            <p className="text-[11px] text-gray-400 italic mb-3">📷 Album · {uniqueImages.length} photos</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            {onLike ? (
              <button type="button" onClick={onLike}
                className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-full"
                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                ❤️ {post.likes} {post.likes === 1 ? "like" : "likes"}
              </button>
            ) : (
              <span className="text-sm text-gray-500">❤️ {post.likes}</span>
            )}
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
