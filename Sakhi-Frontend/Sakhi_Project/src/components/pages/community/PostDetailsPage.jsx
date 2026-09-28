import { useAccount } from '../../account/accountContext';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { HomeHeader } from '../home/HomeHeader';
import { PostCard } from '../../community/PostCard';
import { CommentSection } from '../../community/CommentSection';
import { CommunitySidebar } from '../../community/CommunitySidebar';
import { fetchPostById, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '../../../services/communityService';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import './PostDetailsPage.css';

export function PostDetailsPage() {
    const { postId } = useParams();
    return <RecordDetails key={postId} />;
}

function RecordDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { requireLogin } = useAccount();
  const [mutationError, setMutationError] = useState('');
  const [busy, setBusy] = useState(false);
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


  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const loadPostDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPostById(postId);
        if (!active) return;
        if (data && data.success && data.post) {
          setPost(data.post);
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        if (!active) return;
        setPost(null);
        setError(err.response?.data?.message || 'Post not found or unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPostDetails();
    return () => { active = false; };
  }, [postId, currentUser?.uid, retry]);

  const mutatePost = async (id, kind) => {
    if (!requireLogin() || !post || busy) return;
    setBusy(true); setMutationError('');
    try {
      if (kind === 'like') {
        await (post.isLiked ? unlikePost(id) : likePost(id));
        setPost(previous => ({ ...previous, isLiked: !post.isLiked, likesCount: Math.max(0, previous.likesCount + (post.isLiked ? -1 : 1)) }));
      } else {
        await (post.isBookmarked ? unbookmarkPost(id) : bookmarkPost(id));
        setPost(previous => ({ ...previous, isBookmarked: !post.isBookmarked }));
      }
    } catch (err) { setMutationError(err.response?.data?.message || 'Change was not saved. Please retry.'); }
    finally { setBusy(false); }
  };
  const handleLikeToggle = id => mutatePost(id, 'like');
  const handleBookmarkToggle = id => mutatePost(id, 'bookmark');

  const handleCommentCountChange = (newCount) => {
    setPost((prev) => (prev ? { ...prev, commentsCount: newCount } : prev));
  };

  return (
    <div className="post-details-page-shell">
      <HomeHeader pageTitle="Discussion Details" />
      {mutationError && <p role="alert">{mutationError}</p>}

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
            <h3>Discussion unavailable</h3>
            <p role="alert">{error}</p>
            <button onClick={() => setRetry(r => r + 1)}>Retry</button>
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
