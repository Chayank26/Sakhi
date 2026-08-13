import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiBookmark } from 'react-icons/fi';

export function SchemeHeader({ onSavedClick }) {
  return (
    <header className="scheme-header">
      <div className="scheme-header-inner">
        <div className="scheme-header-left">
          <Link to="/home" className="scheme-brand-link" title="Return to Sakhi Home">
            <span className="brand-logo-badge">🌸</span>
            <span className="brand-title">Sakhi</span>
          </Link>
          <span className="brand-divider">/</span>
          <span className="scheme-header-badge">Government Schemes</span>
        </div>

        <div className="scheme-header-right">
          <Link to="/home" className="header-nav-link">
            <FiHome className="nav-icon" /> Portal Home
          </Link>
          <button
            type="button"
            className="btn-header-saved"
            onClick={onSavedClick}
          >
            <FiBookmark className="nav-icon" /> Saved Schemes
          </button>
        </div>
      </div>
    </header>
  );
}
