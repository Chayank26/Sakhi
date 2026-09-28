import { useAccount } from '../../account/accountContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSchemes, searchSchemes } from '../../../services/schemeApi';
import { HomeHeader } from '../home/HomeHeader';
import { SchemeSearch } from '../../schemes/SchemeSearch';
import { SchemeFilters } from '../../schemes/SchemeFilters';
import { SchemeGrid } from '../../schemes/SchemeGrid';
import { useDebounce } from '../../../hooks/useDebounce';
import { FiZap, FiBookmark } from 'react-icons/fi';
import './SchemesPage.css';

export function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [governmentLevel, setGovernmentLevel] = useState('All');
  const [selectedState, setSelectedState] = useState(() => new URLSearchParams(window.location.search).get('state') || 'All');
  const [targetAudience, setTargetAudience] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const { data: activity, toggleSaved } = useAccount();
  const bookmarkedSchemeIds = activity.saved.schemes.map(s => s._id);
  const [loadError, setLoadError] = useState('');
  const [notification, setNotification] = useState(null);

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


  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const loadSchemesData = async () => {
      setLoading(true);
      setLoadError('');
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

        if (!active) return;
        if (data && data.success && Array.isArray(data.schemes)) {
          setSchemes(data.schemes);
        }
      } catch (err) {
        if (!active) return;
        setSchemes([]);
        setLoadError(err.response?.data?.message || 'Could not load schemes. Please retry.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSchemesData();
    return () => { active = false; };
  }, [debouncedSearchQuery, selectedCategory, governmentLevel, selectedState, targetAudience, sortBy, retry]);

  const handleBookmarkToggle = id => toggleSaved('schemes', id);

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
      {loadError && <p role="alert">{loadError} <button onClick={() => setRetry(r => r + 1)}>Retry</button></p>}

      {/* Hero Banner */}
      <div className="schemes-hero-banner">
        <div className="schemes-hero-content">
          <h1 className="hero-title">Find government support and opportunities you may be eligible for.</h1>
          <p className="hero-subtitle">
            Explore authentic central & state government welfare schemes for women, education, entrepreneurship, maternity benefits, and financial assistance.
          </p>
        </div>
        <div className="schemes-hero-actions">
          <Link to="/saved-schemes" className="btn-hero-action saved">
            <FiBookmark /> Saved Schemes ({bookmarkedSchemeIds.length})
          </Link>
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