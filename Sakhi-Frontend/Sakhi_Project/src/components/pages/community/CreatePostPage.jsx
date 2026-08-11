import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommunityHeader } from '../../community/CommunityHeader';
import { CreatePost } from '../../community/CreatePost';
import { FiCheckCircle, FiHeart, FiShield, FiArrowLeft } from 'react-icons/fi';
import './CreatePostPage.css';

export function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div className="create-post-page-shell">
      <CommunityHeader
        searchQuery=""
        setSearchQuery={() => {}}
        onCreatePostClick={() => {}}
      />

      <div className="create-post-container">
        <button
          type="button"
          className="btn-back-to-community"
          onClick={() => navigate('/community')}
        >
          <FiArrowLeft className="btn-icon" /> Back to Feed
        </button>

        <div className="create-post-grid">
          {/* Main Form Column */}
          <div className="create-post-form-col">
            <CreatePost
              onPostSuccess={() => {
                navigate('/community');
              }}
              onCancel={() => navigate('/community')}
            />
          </div>

          {/* Guidelines Sidebar Column */}
          <div className="create-post-guidance-col">
            <div className="guidance-card">
              <div className="guidance-header">
                <FiHeart className="guidance-icon pink" />
                <h3>Posting on Sakhi</h3>
              </div>
              <p className="guidance-intro">
                Sakhi is a supportive, safe platform designed for women to grow, share experiences, and inspire each other.
              </p>
              <ul className="guidance-list">
                <li>
                  <FiCheckCircle className="check-icon" /> Choose the most relevant category to help members find your post.
                </li>
                <li>
                  <FiCheckCircle className="check-icon" /> Keep post titles concise and clear.
                </li>
                <li>
                  <FiCheckCircle className="check-icon" /> Add images to boost engagement when sharing projects or success stories.
                </li>
                <li>
                  <FiCheckCircle className="check-icon" /> Be kind, respectful, and constructive in all discussions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
