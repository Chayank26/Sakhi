import React, { useState } from 'react';
import { COMMUNITY_CATEGORIES } from './dummyData';
import { ImageUpload } from './ImageUpload';
import { updatePost } from '../../services/communityService';
import { FiX, FiSave, FiAlertCircle, FiLoader } from 'react-icons/fi';

const CATEGORY_OPTIONS = COMMUNITY_CATEGORIES.filter((cat) => cat !== 'All');

export function EditPostModal({ post, onClose, onPostUpdated }) {
  const [title, setTitle] = useState(post.title || '');
  const [category, setCategory] = useState(post.category || 'Career');
  const [content, setContent] = useState(post.content || '');
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const TITLE_MAX = 200;
  const CONTENT_MAX = 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    if (!content.trim()) {
      setError('Content body cannot be empty.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await updatePost(post.id, {
        title: title.trim(),
        category,
        content: content.trim(),
        imageUrl: imageUrl || null
      });

      if (response && response.success && response.post) {
        onPostUpdated(response.post);
        onClose();
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.message || 'Failed to save post changes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="community-modal-backdrop" onClick={onClose}>
      <div className="community-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Your Post</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {error && (
          <div className="create-post-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="edit-title">Title</label>
              <span className={`char-counter ${title.length > TITLE_MAX ? 'exceeded' : ''}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="edit-title"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input-title"
              disabled={submitting}
              required
            />
          </div>

          {/* Category Select */}
          <div className="form-group">
            <label htmlFor="edit-category">Category</label>
            <select
              id="edit-category"
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

          {/* Body Content */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="edit-content">Content</label>
              <span className={`char-counter ${content.length > CONTENT_MAX ? 'exceeded' : ''}`}>
                {content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="edit-content"
              rows={5}
              value={content}
              maxLength={CONTENT_MAX}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea-content"
              disabled={submitting}
              required
            />
          </div>

          {/* Image Attachment */}
          <div className="form-group">
            <ImageUpload
              imageUrl={imageUrl}
              onImageChange={(url) => setImageUrl(url)}
              onImageRemove={() => setImageUrl('')}
            />
          </div>

          {/* Actions */}
          <div className="form-actions-row">
            <button type="button" className="btn-cancel-post" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-post" disabled={submitting}>
              {submitting ? (
                <>
                  <FiLoader className="spin-icon" /> Saving...
                </>
              ) : (
                <>
                  <FiSave className="btn-icon" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
