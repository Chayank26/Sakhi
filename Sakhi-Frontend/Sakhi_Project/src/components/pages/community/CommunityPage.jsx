import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { CommunityHeader } from '../../community/CommunityHeader';
import { SortControls } from '../../community/SortControls';
import { PostFeed } from '../../community/PostFeed';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { INITIAL_DUMMY_POSTS } from '../../community/dummyData';
import { fetchPosts, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '../../../services/communityService';
import { FiPlus, FiZap } from 'react-icons/fi';
import './CommunityPage.css';

export function CommunityPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState(INITIAL_DUMMY_POSTS);
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

  const loadPostsFromBackend = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts({
        q: searchQuery,
        category: selectedCategory,
        sortBy
      });
      if (data && data.success && Array.isArray(data.posts) && data.posts.length > 0) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.warn('Using local dummy posts (backend API unavailable or starting up):', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostsFromBackend();
  }, [searchQuery, selectedCategory, sortBy]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Upvote / Like Handler
  const handleLikeToggle = async (postId) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const nextLiked = !targetPost.isLiked;

    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const likesCount = nextLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
          return { ...post, isLiked: nextLiked, likesCount };
        }
        return post;
      })
    );

    try {
      if (nextLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      console.warn('Backend upvote sync warning:', err.message);
    }
  };

  // Bookmark / Save Handler
  const handleBookmarkToggle = async (postId) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const nextBookmarked = !targetPost.isBookmarked;

    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, isBookmarked: nextBookmarked };
        }
        return post;
      })
    );

    showToast(nextBookmarked ? 'Post saved to your bookmarks!' : 'Post removed from saved bookmarks.');

    try {
      if (nextBookmarked) {
        await bookmarkPost(postId);
      } else {
        await unbookmarkPost(postId);
      }
    } catch (err) {
      console.warn('Backend bookmark sync warning:', err.message);
    }
  };

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

      {/* Header with Search and Create CTA */}
      <CommunityHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreatePostClick={handleCreatePost}
      />

      {/* Hero Banner */}
      <div className="community-hero-banner">
        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <span className="sparkle-emoji">🌸</span> Sakhi Community Forum
          </div>
          <h1 className="hero-title">A safe space to connect, share and learn together.</h1>
          <p className="hero-subtitle">
            Join thousands of women inspiring each other across career growth, skill building, entrepreneurship, and personal success.
          </p>
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
