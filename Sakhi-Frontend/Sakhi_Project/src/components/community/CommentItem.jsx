import React, { useState } from 'react';
import { ReportModal } from './ReportModal';
import { FiEdit, FiTrash2, FiHeart, FiCheck, FiX, FiMoreHorizontal, FiFlag } from 'react-icons/fi';

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const postDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CommentItem({ comment, currentUserId, onUpdate, onDelete }) {
  const { id, author, content, likesCount = 0, isLiked = false, createdAt } = comment;
  const isOwner = currentUserId && author?.uid === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [submitting, setSubmitting] = useState(false);
  const [likedState, setLikedState] = useState(isLiked);
  const [likeCountState, setLikeCountState] = useState(likesCount);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await onUpdate(id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save edited comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = () => {
    setLikedState((prev) => !prev);
    setLikeCountState((prev) => (likedState ? prev - 1 : prev + 1));
  };

  return (
    <>
      {showReportModal && (
        <ReportModal
          targetType="comment"
          targetId={id}
          itemTitle={content}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <div className="community-comment-item">
        {/* Comment Author Avatar */}
        <div className="comment-avatar-wrapper">
          {author?.avatar ? (
            <img src={author.avatar} alt={author.name} className="comment-avatar-img" />
          ) : (
            <div className="comment-avatar-placeholder">
              {author?.name ? author.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
        </div>

        {/* Comment Body & Content */}
        <div className="comment-main-box">
          <div className="comment-header-row">
            <div className="comment-meta-info">
              <span className="comment-author-name">{author?.name || 'Sakhi Member'}</span>
              {author?.role && <span className="comment-author-role">• {author.role}</span>}
              <span className="comment-time">• {formatRelativeTime(createdAt)}</span>
            </div>

            <div className="comment-owner-actions">
              {isOwner ? (
                !isEditing && (
                  <>
                    <button
                      type="button"
                      className="comment-icon-btn"
                      onClick={() => setIsEditing(true)}
                      title="Edit Comment"
                    >
                      <FiEdit />
                    </button>
                    <button
                      type="button"
                      className="comment-icon-btn danger"
                      onClick={() => onDelete(id)}
                      title="Delete Comment"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )
              ) : (
                <button
                  type="button"
                  className="comment-icon-btn danger"
                  onClick={() => setShowReportModal(true)}
                  title="Report Comment"
                >
                  <FiFlag />
                </button>
              )}
            </div>
          </div>

        {isEditing ? (
          <div className="comment-edit-box">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-edit-textarea"
              rows={2}
            />
            <div className="comment-edit-actions">
              <button
                type="button"
                className="btn-edit-cancel"
                onClick={() => {
                  setEditContent(content);
                  setIsEditing(false);
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-edit-save"
                onClick={handleSaveEdit}
                disabled={submitting || !editContent.trim()}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-text-body">{content}</p>
        )}

        {/* Comment Footer Like Button */}
        <div className="comment-footer-row">
          <button
            type="button"
            className={`comment-like-btn ${likedState ? 'liked' : ''}`}
            onClick={handleToggleLike}
          >
            <FiHeart className="heart-icon" />
            {likeCountState > 0 && <span className="like-count">{likeCountState}</span>}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
