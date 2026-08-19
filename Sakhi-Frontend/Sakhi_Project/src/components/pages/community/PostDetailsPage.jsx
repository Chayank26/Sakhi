import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { HomeHeader } from '../home/HomeHeader';
import { PostCard } from '../../community/PostCard';
import { CommentSection } from '../../community/CommentSection';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { fetchPostById, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '../../../services/communityService';
import { INITIAL_DUMMY_POSTS } from '../../community/dummyData';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import './PostDetailsPage.css';

export function PostDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loadPostDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPostById(postId);
      if (data && data.success && data.post) {
        setPost(data.post);
      } else {
        // Fallback to local dummy posts matching ID
        const found = INITIAL_DUMMY_POSTS.find((p) => p.id === postId);
        if (found) setPost(found);
      }
    } catch (err) {
      console.warn('Backend post details fetch fallback:', err.message);
      const found = INITIAL_DUMMY_POSTS.find((p) => p.id === postId);
      if (found) setPost(found);
      else setError('Post not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadPostDetails();
    }
  }, [postId]);

  const handleLikeToggle = async (targetId) => {
    if (!post) return;
    const nextLiked = !post.isLiked;
    const likesCount = nextLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
    setPost({ ...post, isLiked: nextLiked, likesCount });

    try {
      if (nextLiked) await likePost(targetId);
      else await unlikePost(targetId);
    } catch (err) {
      console.warn('Backend upvote sync warning:', err.message);
    }
  };

  const handleBookmarkToggle = async (targetId) => {
    if (!post) return;
    const nextBookmarked = !post.isBookmarked;
    setPost({ ...post, isBookmarked: nextBookmarked });

    try {
      if (nextBookmarked) await bookmarkPost(targetId);
      else await unbookmarkPost(targetId);
    } catch (err) {
      console.warn('Backend bookmark sync warning:', err.message);
    }
  };

  const handleCommentCountChange = (newCount) => {
    setPost((prev) => (prev ? { ...prev, commentsCount: newCount } : prev));
  };

  return (
    <div className="post-details-page-shell">
      <HomeHeader pageTitle="Discussion Details" />

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

      <div className="post-details-main-container">

        {loading ? (
          <div className="details-loading-state">
            <FiLoader className="spin-icon" /> Loading post discussion...
          </div>
        ) : error || !post ? (
          <div className="details-error-state">
            <h3>Post Not Found</h3>
            <p>The community discussion you are looking for does not exist or was removed.</p>
            <button
              type="button"
              className="btn-return-home"
              onClick={() => navigate('/community')}
            >
              Return to Community Feed
            </button>
          </div>
        ) : (
          <div className="post-details-layout">
            <main className="post-details-content-column">
              {/* Full Post Card */}
              <PostCard
                post={post}
                onLikeToggle={handleLikeToggle}
                onBookmarkToggle={handleBookmarkToggle}
                onPostUpdated={(updated) => setPost(updated)}
                onPostDeleted={() => navigate('/community')}
                currentUserId={currentUser?.uid}
              />

              {/* Comments System Thread */}
              <CommentSection
                postId={post.id}
                currentUserId={currentUser?.uid}
                onCommentCountChange={handleCommentCountChange}
              />
            </main>

            <div className="post-details-sidebar-column">
              <CommunitySidebar
                selectedCategory={post.category}
                onTopicClick={() => navigate('/community')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
