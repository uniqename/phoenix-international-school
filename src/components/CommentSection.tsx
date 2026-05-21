"use client";
import { useState } from "react";
import type { FeedComment, UserRole } from "@/lib/types";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
  comments: FeedComment[];
  onAddComment: (body: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleReaction?: (commentId: string, emoji: string, userId: string) => void;
  currentUserId?: string;
  currentUserRole?: UserRole;
  currentUserName?: string;
}

export default function CommentSection({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onToggleReaction,
  currentUserId,
  currentUserRole,
  currentUserName,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (!currentUserName || !currentUserRole) {
      toast.error("Must be logged in to comment");
      return;
    }
    setLoading(true);
    try {
      onAddComment(newComment);
      setNewComment("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const postComments = comments.filter((c) => c.post_id === postId);

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={2}
          disabled={loading}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-3 py-1 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Posting..." : "Post"}
          </button>
          <button
            type="button"
            onClick={() => setNewComment("")}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {postComments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
        ) : (
          postComments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {comment.author_name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {comment.author_role && (
                        <>
                          •{" "}
                          {comment.author_role === "admin"
                            ? "👨‍💼 Admin"
                            : comment.author_role === "teacher"
                            ? "👨‍🏫 Teacher"
                            : comment.author_role === "parent"
                            ? "👨‍👩‍👧 Parent"
                            : "👤 Student"}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 break-words">
                    {comment.body}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(comment.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {/* Reactions */}
                  {(comment.reactions?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {comment.reactions!.map((reaction) => {
                        const isLiked = reaction.users.includes(currentUserId || '');
                        return (
                          <button
                            key={reaction.emoji}
                            type="button"
                            onClick={() => {
                              if (currentUserId && onToggleReaction) {
                                onToggleReaction(comment.id, reaction.emoji, currentUserId);
                              }
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-bold transition ${
                              isLiked
                                ? 'bg-purple-100 border-purple-300'
                                : 'bg-gray-100 border-gray-300'
                            } border hover:bg-purple-100`}
                          >
                            {reaction.emoji} {reaction.users.length}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {currentUserId && (
                  <div className="flex gap-1 flex-shrink-0 flex-col items-end">
                    <div className="flex gap-1">
                      {['👍', '❤️', '😂'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            if (onToggleReaction) {
                              onToggleReaction(comment.id, emoji, currentUserId);
                            }
                          }}
                          className="text-lg hover:scale-125 transition"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this comment? This cannot be undone."
                          )
                        ) {
                          onDeleteComment(comment.id);
                          toast.success("Comment deleted");
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
