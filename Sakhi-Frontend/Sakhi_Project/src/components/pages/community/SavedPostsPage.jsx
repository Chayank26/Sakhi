import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { CommunityHeader } from '../../community/CommunityHeader';
import { PostCard } from '../../community/PostCard';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { fetchSavedPosts, bookmarkPost, unbookmarkPost, likePost, unlikePost } from '../../../services/communityService';
import { FiBookmark, FiArrowLeft, FiLoader } from 'react-icons/fi';
import './SavedPostsPage.css';

export function SavedPostsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSavedPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedPosts();
      if (data && data.success && Array.isArray(data.posts)) {
        setSavedPosts(data.posts);
      }
    } catch (err) {
      console.warn('Backend saved posts fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const handleLikeToggle = async (postId) => {
    setSavedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          return { ...p, isLiked, likesCount };
        }
        return p;
      })
    );

    try {
      const target = savedPosts.find((p) => p.id === postId);
      if (target?.isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (err) {
      console.warn('Like toggle sync warning:', err.message);
    }
  };

  const handleBookmarkToggle = async (postId) => {
    // Remove from saved list optimistically
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post removed from your saved bookmarks.');

    try {
      await unbookmarkPost(postId);
    } catch (err) {
      console.warn('Bookmark toggle sync warning:', err.message);
    }
  };

  return (
    <div className="saved-posts-page-shell">
      {/* Toast Notification */}
      {notification && (
        <div className="community-toast">
          <FiBookmark className="toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      <CommunityHeader
        searchQuery=""
        setSearchQuery={() => {}}
        onCreatePostClick={() => navigate('/community/create')}
      />

      <div className="saved-posts-main-container">
        <button
          type="button"
          className="btn-back-to-community"
          onClick={() => navigate('/community')}
        >
          <FiArrowLeft className="btn-icon" /> Back to Feed
        </button>

        <div className="saved-posts-header-banner">
          <div className="saved-header-icon-circle">
            <FiBookmark />
          </div>
          <div>
            <h1>Your Saved Posts</h1>
            <p>Access all the community discussions, advice, and career resources you’ve bookmarked.</p>
          </div>
        </div>

        <div className="saved-posts-layout">
          <main className="saved-posts-feed-column">
            {loading ? (
              <div className="saved-loading-state">
                <FiLoader className="spin-icon" /> Loading your saved bookmarks...
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="saved-empty-state">
                <div className="empty-bookmark-circle">
                  <FiBookmark />
                </div>
                <h3>No saved posts yet</h3>
                <p>Click the bookmark icon (🔖 Save) on any post in the community feed to save it here for quick access later.</p>
                <button
                  type="button"
                  className="btn-explore-feed"
                  onClick={() => navigate('/community')}
                >
                  Explore Community Feed
                </button>
              </div>
            ) : (
              <div className="community-post-feed">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                    currentUserId={currentUser?.uid}
                  />
                ))}
              </div>
            )}
          </main>

          <div className="saved-posts-sidebar-column">
            <CommunitySidebar onTopicClick={() => navigate('/community')} />
          </div>
        </div>
      </div>
    </div>
  );
}
