import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { CommunityHeader } from '../../community/CommunityHeader';
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

  const handleLikeToggle = async () => {
    if (!post) return;
    const nextLiked = !post.isLiked;

    // Optimistic UI update
    setPost((prev) => {
      const likesCount = nextLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1);
      return { ...prev, isLiked: nextLiked, likesCount };
    });

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

  const handleBookmarkToggle = async () => {
    if (!post) return;
    const nextBookmarked = !post.isBookmarked;

    // Optimistic UI update
    setPost((prev) => ({ ...prev, isBookmarked: nextBookmarked }));

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

  const handleCommentCountChange = (newCount) => {
    setPost((prev) => (prev ? { ...prev, commentsCount: newCount } : prev));
  };

  return (
    <div className="post-details-page-shell">
      <CommunityHeader
        searchQuery=""
        setSearchQuery={() => {}}
        onCreatePostClick={() => navigate('/community/create')}
      />

      <div className="post-details-main-container">
        <button
          type="button"
          className="btn-back-feed"
          onClick={() => navigate('/community')}
        >
          <FiArrowLeft className="btn-icon" /> Back to Feed
        </button>

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
