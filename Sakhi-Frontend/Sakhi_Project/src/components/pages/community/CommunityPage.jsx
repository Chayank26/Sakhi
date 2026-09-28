import { useAccount } from '../../account/accountContext';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { HomeHeader } from '../home/HomeHeader';
import { SortControls } from '../../community/SortControls';
import { PostFeed } from '../../community/PostFeed';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { fetchPosts, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '../../../services/communityService';
import { FiPlus, FiZap, FiBookmark } from 'react-icons/fi';
import './CommunityPage.css';

export function CommunityPage() {
  const navigate = useNavigate();
  const { requireLogin } = useAccount();
  const pending = useRef(new Set());
  const [loadError, setLoadError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const loadPostsFromBackend = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await fetchPosts({
          q: searchQuery,
          category: selectedCategory,
          sortBy
        });
        if (!active) return;
        if (data && data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch (err) {
        if (!active) return;
        setPosts([]);
        setLoadError(err.response?.data?.message || 'Could not load community posts.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPostsFromBackend();
    return () => { active = false; };
  }, [searchQuery, selectedCategory, sortBy, currentUser?.uid, retry]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const mutatePost = async (postId, kind) => {
    if (!requireLogin()) return;
    const key = `${postId}:${kind}`;
    if (pending.current.has(key)) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    pending.current.add(key);
    try {
      if (kind === 'like') {
        await (post.isLiked ? unlikePost(postId) : likePost(postId));
        setPosts(items => items.map(item => item.id === postId ? { ...item, isLiked: !post.isLiked, likesCount: Math.max(0, item.likesCount + (post.isLiked ? -1 : 1)) } : item));
      } else {
        await (post.isBookmarked ? unbookmarkPost(postId) : bookmarkPost(postId));
        setPosts(items => items.map(item => item.id === postId ? { ...item, isBookmarked: !post.isBookmarked } : item));
        showToast(post.isBookmarked ? 'Bookmark removed.' : 'Post saved.');
      }
    } catch (err) { showToast(err.response?.data?.message || 'Change was not saved. Please retry.'); }
    finally { pending.current.delete(key); }
  };
  const handleLikeToggle = id => mutatePost(id, 'like');
  const handleBookmarkToggle = id => mutatePost(id, 'bookmark');

  const handleCommentClick = (postId) => {
    navigate(`/community/post/${postId}`);
  };

  const handleCreatePost = () => {
    navigate('/community/create');
  };

  // Filter and Sort calculation
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Sort logic
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likesCount - a.likesCount;
      }
      if (sortBy === 'commented') {
        return b.commentsCount - a.commentsCount;
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // 'latest' default
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    showToast('Post updated successfully!');
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    showToast('Post deleted successfully.');
  };

  return (
    <div className="community-page-shell">
      {/* Toast Notification */}
      {notification && (
        <div className="community-toast">
          <FiZap className="toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <HomeHeader pageTitle="Community" />
      <label className="activity-page">Search discussions<input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></label>
      {loading && <p role="status">Loading discussions…</p>}
      {loadError && <p role="alert">{loadError} <button onClick={() => setRetry(r => r + 1)}>Retry</button></p>}

      {/* Hero Banner */}
      <div className="community-hero-banner">
        <div className="hero-content-wrapper">
          <h1 className="hero-title">A safe space to connect, share and learn together.</h1>
          <p className="hero-subtitle">
            Join thousands of women inspiring each other across career growth, skill building, entrepreneurship, and personal success.
          </p>
          <div className="community-hero-actions">
            <Link to="/community/create" className="btn-hero-action create">
              <FiPlus /> Create New Discussion
            </Link>
            <Link to="/community/saved" className="btn-hero-action saved">
              <FiBookmark /> Saved Discussions
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="community-main-container">
        {/* Sort & Filter Controls */}
        <SortControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* 2-Column Responsive Layout */}
        <div className="community-content-layout">
          {/* Main Feed Column */}
          <main className="community-feed-column">
            {searchQuery.trim() && (
              <div className="search-results-banner">
                <span className="results-count">
                  {filteredAndSortedPosts.length} post{filteredAndSortedPosts.length === 1 ? '' : 's'} found
                </span>{' '}
                for "<span className="search-term-highlight">{searchQuery}</span>"
                {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
              </div>
            )}

            <PostFeed
              posts={filteredAndSortedPosts}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle}
              onCommentClick={handleCommentClick}
              onCreatePostClick={handleCreatePost}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
              currentUserId={currentUser?.uid}
            />
          </main>

          {/* Sidebar Column */}
          <div className="community-sidebar-column">
            <CommunitySidebar
              selectedCategory={selectedCategory}
              onTopicClick={(topic) => setSelectedCategory(topic)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        type="button"
        className="mobile-fab-create"
        onClick={handleCreatePost}
        aria-label="Create Post"
      >
        <FiPlus className="fab-icon" />
        <span className="fab-text">Create</span>
      </button>
    </div>
  );
}
