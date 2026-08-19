import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSchemes, searchSchemes } from '../../../services/schemeApi';
import { HomeHeader } from '../home/HomeHeader';
import { SchemeSearch } from '../../schemes/SchemeSearch';
import { SchemeFilters } from '../../schemes/SchemeFilters';
import { SchemeGrid } from '../../schemes/SchemeGrid';
import { useDebounce } from '../../../hooks/useDebounce';
import { getSavedSchemeIds, toggleSavedScheme } from '../../../utils/schemeStorage';
import { FiCheckCircle, FiZap, FiBookOpen, FiBookmark } from 'react-icons/fi';
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [bookmarkedSchemeIds, setBookmarkedSchemeIds] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setBookmarkedSchemeIds(getSavedSchemeIds());
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setGovernmentLevel('All');
    setSelectedState('All');
    setTargetAudience('All');
    setSortBy('createdAt');
    setSearchQuery('');
    showToast('Filters reset to default.');
  };

  const loadSchemesData = async () => {
    setLoading(true);
    try {
      let data;
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        governmentLevel: governmentLevel !== 'All' ? governmentLevel : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        targetAudience: targetAudience !== 'All' ? targetAudience : undefined,
        sortBy
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
  }, [debouncedSearchQuery, selectedCategory, governmentLevel, selectedState, targetAudience, sortBy]);

  const handleBookmarkToggle = (schemeId) => {
    const { updatedIds, isSaved } = toggleSavedScheme(schemeId);
    setBookmarkedSchemeIds(updatedIds);
    showToast(isSaved ? 'Scheme saved to your bookmarks!' : 'Scheme removed from saved bookmarks.');
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
      <HomeHeader pageTitle="Government Schemes" />

      {/* Top Bar with Right Aligned Saved Schemes Button */}
      <div className="schemes-top-nav-bar">
        <Link to="/saved-schemes" className="btn-saved-schemes-top">
          <FiBookmark /> Saved Schemes ({bookmarkedSchemeIds.length})
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="schemes-hero-banner">
        <div className="schemes-hero-content">
          <h1 className="hero-title">Find government support and opportunities you may be eligible for.</h1>
          <p className="hero-subtitle">
            Explore authentic central & state government welfare schemes for women, education, entrepreneurship, maternity benefits, and financial assistance.
          </p>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="schemes-main-container">
        <div className="schemes-portal-layout">
          {/* Left Sidebar Filters */}
          <aside className="schemes-sidebar-filters">
            <SchemeFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              governmentLevel={governmentLevel}
              setGovernmentLevel={setGovernmentLevel}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Right Feed Container */}
          <main className="schemes-main-feed">
            {/* Search Input Bar */}
            <SchemeSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
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
          </main>
        </div>
      </div>
    </div>
  );
}
