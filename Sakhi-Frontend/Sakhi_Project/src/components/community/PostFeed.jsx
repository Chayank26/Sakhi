import React from 'react';
import { PostCard } from './PostCard';
import { FiMessageSquare, FiPlusCircle } from 'react-icons/fi';

export function PostFeed({
  posts,
  onLikeToggle,
  onBookmarkToggle,
  onCommentClick,
  onAuthorClick,
  onCreatePostClick,
  currentUserId
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="community-empty-feed">
        <div className="empty-icon-circle">
          <FiMessageSquare />
        </div>
        <h3>No community posts found</h3>
        <p>Be the first to share an idea, ask a question, or inspire fellow Sakhi members!</p>
        <button
          type="button"
          className="btn-create-post-empty"
          onClick={onCreatePostClick}
        >
          <FiPlusCircle className="btn-icon" /> Create First Post
        </button>
      </div>
    );
  }

  return (
    <div className="community-post-feed">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={onLikeToggle}
          onBookmarkToggle={onBookmarkToggle}
          onCommentClick={onCommentClick}
          onAuthorClick={onAuthorClick}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
