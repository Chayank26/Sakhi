import React, { useState } from 'react';
import { FiImage, FiX, FiUploadCloud, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { uploadPostImage } from '../../services/communityService';

export function ImageUpload({ imageUrl, onImageChange, onImageRemove }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please select a valid image (JPEG, PNG, GIF, or WebP).');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Immediate client preview
      const previewUrl = URL.createObjectURL(file);

      // Attempt upload to backend API (Cloudinary / Local storage)
      try {
        const response = await uploadPostImage(file);
        if (response && response.success && response.imageUrl) {
          onImageChange(response.imageUrl);
        } else {
          // Fallback to local preview URL if server offline
          onImageChange(previewUrl);
        }
      } catch (err) {
        console.warn('Backend upload unavailable, using preview URL:', err.message);
        onImageChange(previewUrl);
      }
    } catch (err) {
      setError('Failed to process selected image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="community-image-upload-wrapper">
      <label className="upload-label">
        <FiImage className="label-icon" /> Optional Attachment
      </label>

      {error && (
        <div className="upload-error-msg">
          <FiAlertCircle className="error-icon" /> {error}
        </div>
      )}

      {imageUrl ? (
        <div className="upload-preview-container">
          <img src={imageUrl} alt="Post Attachment Preview" className="uploaded-preview-img" />
          <button
            type="button"
            className="btn-remove-image"
            onClick={onImageRemove}
            aria-label="Remove image"
          >
            <FiX />
          </button>
        </div>
      ) : (
        <div className="upload-dropzone">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="file-input-hidden"
            id="post-image-file-input"
            disabled={uploading}
          />
          <label htmlFor="post-image-file-input" className="dropzone-box">
            {uploading ? (
              <div className="upload-loading-spinner">
                <FiLoader className="spin-icon" />
                <span>Uploading image...</span>
              </div>
            ) : (
              <div className="dropzone-content">
                <FiUploadCloud className="cloud-icon" />
                <p className="dropzone-title">Click to upload or drag an image here</p>
                <span className="dropzone-subtitle">PNG, JPG, GIF or WebP (max 5MB)</span>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
