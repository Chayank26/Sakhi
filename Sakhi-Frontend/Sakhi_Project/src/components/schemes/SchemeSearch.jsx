import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export function SchemeSearch({ value, onChange, onClear }) {
  return (
    <div className="scheme-search-box">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search government schemes by name, keyword, benefits, or ministry..."
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
  );
}
