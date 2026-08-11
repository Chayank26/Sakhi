import React from 'react';
import { FiTrendingUp, FiClock, FiMessageSquare, FiSliders, FiFilter } from 'react-icons/fi';
import { COMMUNITY_CATEGORIES } from './dummyData';

export function SortControls({
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory
}) {
  const sortOptions = [
    { id: 'latest', label: 'Latest', icon: FiClock },
    { id: 'popular', label: 'Popular', icon: FiTrendingUp },
    { id: 'commented', label: 'Most Commented', icon: FiMessageSquare },
    { id: 'oldest', label: 'Oldest', icon: FiSliders },
  ];

  return (
    <div className="community-sort-controls">
      {/* Category Pills Bar */}
      <div className="category-scroll-container">
        <span className="category-label">
          <FiFilter className="filter-icon" /> Category:
        </span>
        <div className="category-pills">
          {COMMUNITY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Buttons Bar */}
      <div className="sort-buttons-row">
        <div className="sort-buttons-group">
          {sortOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`sort-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSortBy(opt.id)}
              >
                <Icon className="tab-icon" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="category-dropdown-mobile">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-mobile-select"
            aria-label="Filter posts by category"
          >
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
