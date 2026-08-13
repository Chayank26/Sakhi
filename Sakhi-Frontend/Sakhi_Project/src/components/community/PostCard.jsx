import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditPostModal } from './EditPostModal';
import { ReportModal } from './ReportModal';
import { deletePost } from '../../services/communityService';
import {
  FiArrowUp,
  FiMessageSquare,
  FiBookmark,
  FiMoreHorizontal,
  FiShare2,
  FiCheck,
  FiFlag,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';

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

export function PostCard({
  post,
  onLikeToggle,
  onBookmarkToggle,
  onCommentClick,
  onAuthorClick,
  onPostUpdated,
  onPostDeleted,
  onReportClick,
  currentUserId
}) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    id,
    author,
    title,
    content,
    imageUrl,
    category,
    likesCount = 0,
    commentsCount = 0,
    isLiked = false,
    isBookmarked = false,
    createdAt
  } = post;

  const isOwner = currentUserId && (author?.uid === currentUserId || author?.id === currentUserId);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deletePost(id);
      if (onPostDeleted) {
        onPostDeleted(id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={(updated) => {
            if (onPostUpdated) onPostUpdated(updated);
          }}
        />
      )}

      {showReportModal && (
        <ReportModal
          targetType="post"
          targetId={id}
          itemTitle={title}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <article className="community-post-card">
        {/* Card Top Header */}
        <div className="post-card-header">
          <div className="post-author-meta" onClick={() => onAuthorClick && onAuthorClick(author)}>
            {author?.avatar ? (
              <img src={author.avatar} alt={author.name} className="post-author-avatar" />
            ) : (
              <div className="post-author-placeholder">
                {author?.name ? author.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <div className="author-info-text">
              <div className="author-name-row">
                <span className="author-name">{author?.name || 'Anonymous Sakhi'}</span>
                {author?.role && <span className="author-role">• {author.role}</span>}
              </div>
              <div className="post-sub-meta">
                <span className="post-time">{formatRelativeTime(createdAt)}</span>
                {category && <span className="post-category-tag">{category}</span>}
              </div>
            </div>
          </div>

          {/* Options Menu Button */}
          <div className="post-options-container">
            <button
              type="button"
              className="post-menu-trigger"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Post options"
            >
              <FiMoreHorizontal />
            </button>

            {showMenu && (
              <div className="post-context-menu">
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={() => {
                    setShowMenu(false);
                    handleCopyShare();
                  }}
                >
                  {copied ? <FiCheck className="menu-icon text-success" /> : <FiShare2 className="menu-icon" />}
                  {copied ? 'Link Copied!' : 'Share Post'}
                </button>

                {isOwner ? (
                  <>
                    <button
                      type="button"
                      className="context-menu-item"
                      onClick={() => {
                        setShowMenu(false);
                        setShowEditModal(true);
                      }}
                    >
                      <FiEdit className="menu-icon" /> Edit Post
                    </button>
                    <button
                      type="button"
                      className="context-menu-item danger"
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      disabled={deleting}
                    >
                      <FiTrash2 className="menu-icon" /> Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="context-menu-item danger"
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportModal(true);
                      if (onReportClick) onReportClick(post);
                    }}
                  >
                    <FiFlag className="menu-icon" /> Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Card Content Body */}
      <div className="post-card-body" onClick={() => navigate(`/community/post/${id}`)}>
        <h2 className="post-title clickable-title">{title}</h2>
        <p className="post-text-content">{content}</p>

        {imageUrl && (
          <div className="post-image-wrapper">
            <img src={imageUrl} alt={title} className="post-attached-image" loading="lazy" />
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="post-card-actions">
        <button
          type="button"
          className={`action-btn vote-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLikeToggle && onLikeToggle(id)}
          aria-label="Upvote post"
        >
          <FiArrowUp className="action-icon" />
          <span className="vote-count">{likesCount}</span>
        </button>

        <button
          type="button"
          className="action-btn comment-btn"
          onClick={() => {
            if (onCommentClick) onCommentClick(id);
            else navigate(`/community/post/${id}`);
          }}
          aria-label="Comments"
        >
          <FiMessageSquare className="action-icon" />
          <span>{commentsCount}</span>
        </button>

        <button
          type="button"
          className={`action-btn save-btn ${isBookmarked ? 'saved' : ''}`}
          onClick={() => onBookmarkToggle && onBookmarkToggle(id)}
          aria-label="Save post"
        >
          <FiBookmark className="action-icon" />
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </article>
    </>
  );
}
