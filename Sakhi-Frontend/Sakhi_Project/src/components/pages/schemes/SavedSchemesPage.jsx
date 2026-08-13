import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSchemes } from '../../../services/schemeApi';
import { getSavedSchemeIds, toggleSavedScheme } from '../../../utils/schemeStorage';
import { SchemeHeader } from '../../schemes/SchemeHeader';
import { SchemeGrid } from '../../schemes/SchemeGrid';
import { FiArrowLeft, FiBookmark, FiZap, FiLoader } from 'react-icons/fi';
import './SavedSchemesPage.css';

export function SavedSchemesPage() {
  const navigate = useNavigate();
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSavedSchemes = async () => {
    setLoading(true);
    try {
      const ids = getSavedSchemeIds();
      setBookmarkedIds(ids);

      if (ids.length === 0) {
        setSavedSchemes([]);
        setLoading(false);
        return;
      }

      // Fetch all schemes from backend API to filter saved schemes
      const data = await fetchSchemes({ limit: 50 });
      if (data && data.success && Array.isArray(data.schemes)) {
        const filtered = data.schemes.filter((scheme) => {
          const schemeId = scheme._id || scheme.id;
          return ids.includes(schemeId);
        });
        setSavedSchemes(filtered);
      }
    } catch (err) {
      console.error('Error loading saved schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedSchemes();
  }, []);

  const handleBookmarkToggle = (schemeId) => {
    const { updatedIds, isSaved } = toggleSavedScheme(schemeId);
    setBookmarkedIds(updatedIds);
    setSavedSchemes((prev) => prev.filter((s) => (s._id || s.id) !== schemeId));
    showToast('Scheme removed from saved bookmarks.');
  };

  return (
    <div className="saved-schemes-shell">
      {/* Toast Notification */}
      {notification && (
        <div className="saved-schemes-toast">
          <FiZap className="toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <SchemeHeader onSavedClick={() => navigate('/saved-schemes')} />

      <div className="saved-schemes-container">
        {/* Back Button */}
        <button
          type="button"
          className="btn-back-schemes"
          onClick={() => navigate('/schemes')}
        >
          <FiArrowLeft className="btn-icon" /> Back to All Schemes
        </button>

        {/* Hero Title Banner */}
        <div className="saved-schemes-header-box">
          <div className="header-icon-circle">
            <FiBookmark />
          </div>
          <div>
            <h1 className="saved-page-title">Saved Government Schemes</h1>
            <p className="saved-page-subtitle">
              Quick access to your bookmarked welfare schemes, eligibility guidelines, and application links.
            </p>
          </div>
        </div>

        {/* Saved Schemes Grid */}
        {loading ? (
          <div className="saved-loading-card">
            <FiLoader className="spin-icon" />
            <p>Loading your saved schemes...</p>
          </div>
        ) : savedSchemes.length === 0 ? (
          <div className="saved-empty-card">
            <div className="empty-bookmark-icon">
              <FiBookmark />
            </div>
            <h2>No Saved Schemes Yet</h2>
            <p>You haven't saved any government schemes to your bookmarks.</p>
            <button
              type="button"
              className="btn-explore-schemes"
              onClick={() => navigate('/schemes')}
            >
              Explore Schemes Directory
            </button>
          </div>
        ) : (
          <div>
            <div className="saved-count-bar">
              <span>Showing <strong>{savedSchemes.length}</strong> saved scheme{savedSchemes.length === 1 ? '' : 's'}</span>
            </div>
            <SchemeGrid
              schemes={savedSchemes}
              loading={false}
              bookmarkedSchemeIds={bookmarkedIds}
              onBookmarkToggle={handleBookmarkToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
