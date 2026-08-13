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
      {/* Top Meta Badges */}
      <div className="scheme-card-top">
        <div className="badge-group-left">
          {featured && (
            <span className="badge-featured">
              <FiStar className="badge-icon" /> Featured
            </span>
          )}
          <span className="badge-category">{category}</span>
        </div>

        <span className="badge-level-state">
          <FiFlag className="badge-mini-icon" /> {governmentLevel}
          {state && state !== 'All India' && ` • ${state}`}
        </span>
      </div>

      {/* Title & Short Description */}
      <div className="scheme-card-body" onClick={() => navigate(`/schemes/${schemeId}`)}>
        <h3 className="scheme-title">{name}</h3>
        <p className="scheme-short-desc">{shortDescription}</p>
      </div>

      {/* Target Audience Tags */}
      {targetAudience.length > 0 && (
        <div className="scheme-audience-tags">
          {targetAudience.slice(0, 3).map((aud) => (
            <span key={aud} className="audience-tag">
              {aud}
            </span>
          ))}
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
          aria-label="Save scheme"
        >
          <FiBookmark className="action-icon" />
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="btn-scheme-details"
          onClick={() => navigate(`/schemes/${schemeId}`)}
        >
          <span>View Details</span>
          <FiArrowRight className="btn-icon" />
        </button>
      </div>
    </article>
  );
}
