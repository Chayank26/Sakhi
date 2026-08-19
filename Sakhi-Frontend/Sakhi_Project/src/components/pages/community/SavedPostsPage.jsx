import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { HomeHeader } from '../home/HomeHeader';
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

  const handleLikeToggle = async (targetId) => {
    const targetPost = savedPosts.find((p) => p.id === targetId);
    if (!targetPost) return;

    const nextLiked = !targetPost.isLiked;

    setSavedPosts((prev) =>
      prev.map((post) => {
        if (post.id === targetId) {
          const likesCount = nextLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
          return { ...post, isLiked: nextLiked, likesCount };
        }
        return post;
      })
    );

    try {
      if (nextLiked) await likePost(targetId);
      else await unlikePost(targetId);
    } catch (err) {
      console.warn('Like toggle sync warning:', err.message);
    }
  };

  const handleBookmarkToggle = async (targetId) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== targetId));
    showToast('Post removed from saved bookmarks.');

    try {
      await unbookmarkPost(targetId);
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

      <HomeHeader pageTitle="Saved Discussions" />

      {/* Top Navigation Bar (Aligned with Navbar Sakhi Logo) */}
      <div className="details-top-nav-bar">
        <button
          type="button"
          className="btn-back-link-sleek"
          onClick={() => navigate('/community')}
        >
          <FiArrowLeft /> Back to Community
        </button>
      </div>

      <div className="saved-posts-main-container">

        <div className="saved-posts-header-banner">
          <div className="saved-header-icon-circle">
            <FiBookmark />
          </div>
          <div>
            <h1 className="saved-title">Your Saved Posts</h1>
            <p className="saved-subtitle">Access all the community discussions, advice, and career resources you’ve bookmarked.</p>
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
                <p>Click the bookmark icon (Save) on any post in the community feed to save it here for quick access later.</p>
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
