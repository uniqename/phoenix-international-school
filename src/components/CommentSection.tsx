"use client";
import { useState } from "react";
import type { FeedComment, UserRole } from "@/lib/types";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
  comments: FeedComment[];
  onAddComment: (body: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
  currentUserRole?: UserRole;
  currentUserName?: string;
}

export default function CommentSection({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
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
                </div>
                {currentUserId && (
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
                    className="text-xs text-red-500 hover:text-red-700 transition flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
