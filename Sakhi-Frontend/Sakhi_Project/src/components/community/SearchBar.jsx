import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export function SearchBar({ value, onChange, onClear, placeholder = 'Search posts, categories, or keywords...' }) {
  return (
    <div className="community-search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="community-search-input"
        aria-label="Search community posts"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="search-clear-btn"
          aria-label="Clear search query"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}
