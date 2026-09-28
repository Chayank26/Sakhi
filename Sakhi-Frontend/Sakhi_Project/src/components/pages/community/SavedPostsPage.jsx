import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { HomeHeader } from '../home/HomeHeader';
import { PostCard } from '../../community/PostCard';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { fetchSavedPosts, unbookmarkPost, likePost, unlikePost } from '../../../services/communityService';
import { FiBookmark, FiArrowLeft, FiLoader } from 'react-icons/fi';
import './SavedPostsPage.css';

export function SavedPostsPage() {
  const navigate = useNavigate();
  const pending = useRef(new Set());
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
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

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchSavedPosts();
        if (active) { setSavedPosts(data.posts || []); setError(''); }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load saved discussions.');
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [retry]);

  const mutate = async (id, kind) => {
    if (pending.current.has(id)) return;
    const post = savedPosts.find(item => item.id === id);
    if (!post) return;
    pending.current.add(id);
    try {
      if (kind === 'like') {
        await (post.isLiked ? unlikePost(id) : likePost(id));
        setSavedPosts(items => items.map(item => item.id === id ? { ...item, isLiked: !post.isLiked, likesCount: Math.max(0, item.likesCount + (post.isLiked ? -1 : 1)) } : item));
      } else {
        await unbookmarkPost(id);
        setSavedPosts(items => items.filter(item => item.id !== id));
        showToast('Bookmark removed.');
      }
    } catch (err) { showToast(err.response?.data?.message || 'Change was not saved. Please retry.'); }
    finally { pending.current.delete(id); }
  };
  const handleLikeToggle = id => mutate(id, 'like');
  const handleBookmarkToggle = id => mutate(id, 'bookmark');

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
      {error && <p role="alert">{error} <button onClick={() => setRetry(r => r + 1)}>Retry</button></p>}

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
