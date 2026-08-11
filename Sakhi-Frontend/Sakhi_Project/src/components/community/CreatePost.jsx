import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMMUNITY_CATEGORIES } from './dummyData';
import { ImageUpload } from './ImageUpload';
import { createPost } from '../../services/communityService';
import { FiSend, FiX, FiAlertCircle, FiLoader, FiCheckCircle } from 'react-icons/fi';

const CATEGORY_OPTIONS = COMMUNITY_CATEGORIES.filter((cat) => cat !== 'All');

export function CreatePost({ onPostSuccess, onCancel }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const TITLE_MAX = 200;
  const CONTENT_MAX = 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!title.trim()) {
      setError('Please enter a post title.');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter what is on your mind.');
      return;
    }

    if (content.trim().length < 10) {
      setError('Content body should be at least 10 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createPost({
        title: title.trim(),
        category,
        content: content.trim(),
        imageUrl: imageUrl || null
      });

      if (response && response.success) {
        setSuccess('Your post has been published to Sakhi Community!');
        if (onPostSuccess) {
          onPostSuccess(response.post);
        } else {
          setTimeout(() => navigate('/community'), 1200);
        }
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      setError(
        err.response?.data?.message ||
          'Failed to publish post. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-post-form-card" onSubmit={handleSubmit}>
      <div className="create-post-header-title">
        <h2>Create a Post</h2>
        <p>Share your ideas, ask questions, or inspire fellow Sakhi members.</p>
      </div>

      {error && (
        <div className="create-post-alert error">
          <FiAlertCircle className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="create-post-alert success">
          <FiCheckCircle className="alert-icon" />
          <span>{success}</span>
        </div>
      )}

      {/* Title Field */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="post-title-input">
            Title <span className="required-star">*</span>
          </label>
          <span className={`char-counter ${title.length > TITLE_MAX ? 'exceeded' : ''}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <input
          id="post-title-input"
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is your post about?"
          className="form-input-title"
          disabled={submitting}
          required
        />
      </div>

      {/* Category Selection */}
      <div className="form-group">
        <label htmlFor="post-category-select">
          Category / Topic <span className="required-star">*</span>
        </label>
        <select
          id="post-category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-select-category"
          disabled={submitting}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Body / Content Textarea */}
      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="post-content-textarea">
            What's on your mind? <span className="required-star">*</span>
          </label>
          <span className={`char-counter ${content.length > CONTENT_MAX ? 'exceeded' : ''}`}>
            {content.length}/{CONTENT_MAX}
          </span>
        </div>
        <textarea
          id="post-content-textarea"
          rows={6}
          value={content}
          maxLength={CONTENT_MAX}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience, ask a question, or start a discussion..."
          className="form-textarea-content"
          disabled={submitting}
          required
        />
      </div>

      {/* Optional Image Attachment */}
      <div className="form-group">
        <ImageUpload
          imageUrl={imageUrl}
          onImageChange={(url) => setImageUrl(url)}
          onImageRemove={() => setImageUrl('')}
        />
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions-row">
        <button
          type="button"
          className="btn-cancel-post"
          onClick={onCancel || (() => navigate('/community'))}
          disabled={submitting}
        >
          Cancel
        </button>

        <button type="submit" className="btn-submit-post" disabled={submitting}>
          {submitting ? (
            <>
              <FiLoader className="spin-icon" /> Publishing...
            </>
          ) : (
            <>
              <FiSend className="btn-icon" /> Publish Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
