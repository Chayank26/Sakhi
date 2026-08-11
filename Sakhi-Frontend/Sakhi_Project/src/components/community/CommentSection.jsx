import React, { useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment
} from '../../services/communityService';
import { FiMessageSquare, FiSend, FiLoader } from 'react-icons/fi';

export function CommentSection({ postId, currentUserId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadComments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchComments(postId);
      if (data && data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
        if (onCommentCountChange) {
          onCommentCountChange(data.comments.length);
        }
      }
    } catch (err) {
      console.warn('Backend comments fetch fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await createComment(postId, newComment.trim());
      if (response && response.success && response.comment) {
        setComments((prev) => [...prev, response.comment]);
        setNewComment('');
        if (onCommentCountChange) {
          onCommentCountChange(comments.length + 1);
        }
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      const response = await updateComment(commentId, updatedContent);
      if (response && response.success && response.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: response.comment.content } : c))
        );
      }
    } catch (err) {
      console.error('Failed to update comment:', err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await deleteComment(commentId);
      if (response && response.success) {
        setComments((prev) => {
          const updated = prev.filter((c) => c.id !== commentId);
          if (onCommentCountChange) {
            onCommentCountChange(updated.length);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <section className="community-comment-section">
      <div className="comment-section-header">
        <FiMessageSquare className="section-icon" />
        <h3>Comments ({comments.length})</h3>
      </div>

      {/* Add Comment Input Form */}
      <form className="add-comment-form" onSubmit={handleAddComment}>
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a supportive comment..."
          className="add-comment-textarea"
          disabled={submitting}
        />
        <div className="add-comment-footer">
          {error && <span className="comment-error-msg">{error}</span>}
          <button
            type="submit"
            className="btn-submit-comment"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <>
                <FiLoader className="spin-icon" /> Posting...
              </>
            ) : (
              <>
                <FiSend /> Post Comment
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="comments-loading">
          <FiLoader className="spin-icon" /> Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="comments-empty-box">
          <p>No comments yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}
