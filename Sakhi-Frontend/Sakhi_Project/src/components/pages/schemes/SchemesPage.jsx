import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchemeHeader } from '../../schemes/SchemeHeader';
import { SchemeSearch } from '../../schemes/SchemeSearch';
import { SchemeFilters } from '../../schemes/SchemeFilters';
import { SchemeGrid } from '../../schemes/SchemeGrid';
import { fetchSchemes, searchSchemes } from '../../../services/schemeApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { FiCheckCircle, FiZap, FiBookOpen } from 'react-icons/fi';
import './SchemesPage.css';

export function SchemesPage() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [governmentLevel, setGovernmentLevel] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [targetAudience, setTargetAudience] = useState('All');
  const [bookmarkedSchemeIds, setBookmarkedSchemeIds] = useState([]);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSchemesData = async () => {
    setLoading(true);
    try {
      let data;
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        governmentLevel: governmentLevel !== 'All' ? governmentLevel : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        targetAudience: targetAudience !== 'All' ? targetAudience : undefined
      };

      if (debouncedSearchQuery.trim()) {
        data = await searchSchemes(debouncedSearchQuery.trim(), params);
      } else {
        data = await fetchSchemes(params);
      }

      if (data && data.success && Array.isArray(data.schemes)) {
        setSchemes(data.schemes);
      }
    } catch (err) {
      console.warn('Error loading government schemes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemesData();
  }, [debouncedSearchQuery, selectedCategory, governmentLevel, selectedState, targetAudience]);

  const handleBookmarkToggle = (schemeId) => {
    setBookmarkedSchemeIds((prev) => {
      const isSaved = prev.includes(schemeId);
      const updated = isSaved ? prev.filter((id) => id !== schemeId) : [...prev, schemeId];
      showToast(isSaved ? 'Scheme removed from saved bookmarks.' : 'Scheme saved to your bookmarks!');
      return updated;
    });
  };

  return (
    <div className="schemes-page-shell">
      {/* Toast Notification */}
      {notification && (
        <div className="schemes-toast">
          <FiZap className="toast-icon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <SchemeHeader onSavedClick={() => navigate('/saved-schemes')} />

      {/* Hero Banner */}
      <div className="schemes-hero-banner">
        <div className="schemes-hero-content">
          <div className="hero-badge">
            <span className="sparkle-emoji">🇮🇳</span> Government Schemes & Welfare
          </div>
          <h1 className="hero-title">Find government support and opportunities you may be eligible for.</h1>
          <p className="hero-subtitle">
            Explore authentic central & state government welfare schemes for women, education, entrepreneurship, maternity benefits, and financial assistance.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="schemes-main-container">
        {/* Search Input Bar */}
        <SchemeSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Bar */}
        <SchemeFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          governmentLevel={governmentLevel}
          setGovernmentLevel={setGovernmentLevel}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
        />

        {/* Results Header Summary */}
        <div className="schemes-results-summary">
          <span className="results-count">
            {schemes.length} scheme{schemes.length === 1 ? '' : 's'} available
          </span>
          {searchQuery && <span> for "<strong className="highlight">{searchQuery}</strong>"</span>}
          {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
        </div>

        {/* Schemes Cards Grid */}
        <SchemeGrid
          schemes={schemes}
          loading={loading}
          bookmarkedSchemeIds={bookmarkedSchemeIds}
          onBookmarkToggle={handleBookmarkToggle}
        />
      </div>
    </div>
  );
}
