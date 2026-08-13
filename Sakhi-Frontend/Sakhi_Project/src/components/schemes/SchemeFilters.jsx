import React from 'react';
import { FiFilter, FiMapPin, FiUsers, FiFlag } from 'react-icons/fi';

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

export function SchemeFilters({
  selectedCategory,
  setSelectedCategory,
  governmentLevel,
  setGovernmentLevel,
  selectedState,
  setSelectedState,
  targetAudience,
  setTargetAudience
}) {
  return (
    <div className="scheme-filters-wrapper">
      {/* Category Pills Header */}
      <div className="category-pills-row">
        {SCHEME_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Dropdown Filter Bar */}
      <div className="secondary-filters-bar">
        {/* Government Level Filter */}
        <div className="filter-dropdown-group">
          <FiFlag className="filter-icon" />
          <select
            value={governmentLevel}
            onChange={(e) => setGovernmentLevel(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Govt Levels</option>
            <option value="Central">Central Govt</option>
            <option value="State">State Govt</option>
          </select>
        </div>

        {/* State Filter */}
        <div className="filter-dropdown-group">
          <FiMapPin className="filter-icon" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="filter-select"
          >
            {STATES_LIST.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All States & UTs' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Target Audience Filter */}
        <div className="filter-dropdown-group">
          <FiUsers className="filter-icon" />
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="filter-select"
          >
            {TARGET_AUDIENCES.map((aud) => (
              <option key={aud} value={aud === 'All Audiences' ? 'All' : aud}>
                {aud}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
