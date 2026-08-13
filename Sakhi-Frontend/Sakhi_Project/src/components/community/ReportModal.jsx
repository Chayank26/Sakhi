import React, { useState } from 'react';
import { submitReport } from '../../services/communityService';
import { FiX, FiFlag, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate/abusive content',
  'Inappropriate content',
  'Misinformation',
  'Other'
];

export function ReportModal({ targetType = 'post', targetId, itemTitle = '', onClose }) {
  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitReport({
        targetType,
        targetId,
        reason,
        description: description.trim()
      });

      if (response && response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Report submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="community-modal-backdrop" onClick={onClose}>
      <div className="community-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <FiFlag className="modal-title-icon text-danger" />
            <h3>Report {targetType === 'post' ? 'Post' : 'Comment'}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {itemTitle && (
          <p className="report-target-preview">
            Reporting: <strong>"{itemTitle.length > 50 ? itemTitle.substring(0, 50) + '...' : itemTitle}"</strong>
          </p>
        )}

        {success ? (
          <div className="report-success-state">
            <FiCheckCircle className="success-icon" />
            <h4>Report Submitted</h4>
            <p>Thank you for helping keep the Sakhi community safe and supportive for everyone.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="create-post-alert error">
                <FiAlertCircle className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label-bold">Why are you reporting this content?</label>
              <div className="report-reasons-list">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className={`report-reason-item ${reason === r ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      disabled={submitting}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="report-description">Additional Details (Optional)</label>
              <textarea
                id="report-description"
                rows={3}
                placeholder="Provide any context to help our moderation team understand the issue..."
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea-content"
                disabled={submitting}
              />
            </div>

            <div className="form-actions-row">
              <button type="button" className="btn-cancel-post" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-submit-post danger-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader className="spin-icon" /> Submitting...
                  </>
                ) : (
                  <>
                    <FiFlag className="btn-icon" /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
