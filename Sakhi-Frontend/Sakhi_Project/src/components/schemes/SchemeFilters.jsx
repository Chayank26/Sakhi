import React from 'react';
import { FiFilter, FiMapPin, FiUsers, FiFlag, FiSliders, FiRefreshCw } from 'react-icons/fi';

export const SCHEME_CATEGORIES = [
  'All',
  'Women Empowerment',
  'Education',
  'Employment',
  'Entrepreneurship',
  'Financial Assistance',
  'Skill Development',
  'Maternity',
  'Health & Nutrition',
  'Safety',
  'Housing',
  'Agriculture',
  'Other'
];

export const GOVERNMENT_LEVELS = ['All', 'Central', 'State'];

export const TARGET_AUDIENCES = [
  'All Audiences',
  'Students',
  'Women entrepreneurs',
  'Working women',
  'Pregnant women',
  'Lactating mothers',
  'Girls',
  'Farmers',
  'Low-income families',
  'Job seekers'
];

export const STATES_LIST = [
  'All',
  'All India',
  'Uttar Pradesh',
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Madhya Pradesh'
];

export const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'createdAt' },
  { label: 'Recently Updated', value: 'updatedAt' },
  { label: 'Featured First', value: 'featured' },
  { label: 'Name (A-Z)', value: 'name' }
];

export function SchemeFilters({
  selectedCategory,
  setSelectedCategory,
  governmentLevel,
  setGovernmentLevel,
  selectedState,
  setSelectedState,
  targetAudience,
  setTargetAudience,
  sortBy,
  setSortBy,
  onResetFilters
}) {
  const isFiltered =
    selectedCategory !== 'All' ||
    governmentLevel !== 'All' ||
    selectedState !== 'All' ||
    targetAudience !== 'All' ||
    sortBy !== 'createdAt';

  return (
    <div className="scheme-sidebar-filters-box">
      <div className="filters-header">
        <h3><FiFilter /> Categories & Filters</h3>
        {isFiltered && (
          <button onClick={onResetFilters} className="btn-reset-filters">Reset All</button>
        )}
      </div>

      {/* Category Selection */}
      <div className="filter-group">
        <h4 className="filter-title">Category</h4>
        <div className="filter-options-vertical">
          {SCHEME_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-category-item ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              {selectedCategory === cat && <span className="active-dot">•</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Government Level Filter */}
      <div className="filter-group">
        <h4 className="filter-title"><FiFlag className="sec-icon" /> Govt Level</h4>
        <select
          value={governmentLevel}
          onChange={(e) => setGovernmentLevel(e.target.value)}
          className="sidebar-filter-select"
        >
          <option value="All">All Govt Levels</option>
          <option value="Central">Central Govt</option>
          <option value="State">State Govt</option>
        </select>
      </div>

      {/* State Filter */}
      <div className="filter-group">
        <h4 className="filter-title"><FiMapPin className="sec-icon" /> State / Region</h4>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="sidebar-filter-select"
        >
          {STATES_LIST.map((st) => (
            <option key={st} value={st}>
              {st === 'All' ? 'All States & UTs' : st}
            </option>
          ))}
        </select>
      </div>

      {/* Target Audience Filter */}
      <div className="filter-group">
        <h4 className="filter-title"><FiUsers className="sec-icon" /> Target Audience</h4>
        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="sidebar-filter-select"
        >
          {TARGET_AUDIENCES.map((aud) => (
            <option key={aud} value={aud === 'All Audiences' ? 'All' : aud}>
              {aud}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By Dropdown */}
      <div className="filter-group">
        <h4 className="filter-title"><FiSliders className="sec-icon" /> Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sidebar-filter-select"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
