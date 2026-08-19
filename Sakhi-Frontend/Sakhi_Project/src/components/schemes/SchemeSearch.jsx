import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export function SchemeSearch({ value, onChange, onClear }) {
  return (
    <div className="scheme-search-box">
      <div className="search-input-group">
        <span className="search-icon-pill">
          <FiSearch />
        </span>
        <input
          type="text"
          placeholder="Search government schemes by title, skill, benefit, or ministry..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="scheme-search-input"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="search-clear-btn"
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>
      <button type="button" className="btn-search-schemes">
        Search
      </button>
    </div>
  );
}
