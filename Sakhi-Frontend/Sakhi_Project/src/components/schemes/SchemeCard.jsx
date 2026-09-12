import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiArrowRight, FiStar, FiFlag, FiMapPin } from 'react-icons/fi';

export function SchemeCard({ scheme, isBookmarked = false, onBookmarkToggle }) {
  const navigate = useNavigate();

  const {
    _id,
    id,
    name,
    category,
    shortDescription,
    governmentLevel = 'Central',
    state = 'All India',
    featured = false,
    targetAudience = []
  } = scheme;

  const schemeId = _id || id;

  return (
    <article className={`scheme-card ${featured ? 'featured-card' : ''}`}>
      {/* Top Meta Kicker */}
      <div className="scheme-card-top">
        <div className="scheme-kicker-left">
          {featured && (
            <span className="featured-star-label">
              <FiStar /> Featured •
            </span>
          )}
          <span className="scheme-kicker-cat">{category}</span>
        </div>

        <span className="scheme-kicker-state">
          <FiFlag className="badge-mini-icon" /> {governmentLevel}
          {state && state !== 'All India' && ` • ${state}`}
        </span>
      </div>

      {/* Title & Short Description */}
      <div className="scheme-card-body" onClick={() => navigate(`/schemes/${schemeId}`)}>
        <h3 className="scheme-title">{name}</h3>
        <p className="scheme-short-desc">{shortDescription}</p>
      </div>

      {/* Target Audience Summary */}
      {targetAudience.length > 0 && (
        <div className="scheme-audience-summary">
          <span className="audience-label">Target Group:</span>
          <span className="audience-values">
            {targetAudience.slice(0, 3).join(' • ')}
          </span>
        </div>
      )}

      {/* Footer CTA Buttons */}
      <div className="scheme-card-footer">
        <button
          type="button"
          className={`btn-scheme-bookmark ${isBookmarked ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onBookmarkToggle) onBookmarkToggle(schemeId);
          }}
          aria-label={isBookmarked ? 'Remove saved scheme' : 'Save scheme'}
        >
          <FiBookmark /> {isBookmarked ? 'Saved' : 'Save'}
        </button>

        <button
          type="button"
          className="btn-scheme-view"
          onClick={() => navigate(`/schemes/${schemeId}`)}
        >
          <span>View Benefits</span>
          <FiArrowRight />
        </button>
      </div>
    </article>
  );
}
