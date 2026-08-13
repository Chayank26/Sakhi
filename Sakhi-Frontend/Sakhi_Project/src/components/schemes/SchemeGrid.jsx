import React from 'react';
import { SchemeCard } from './SchemeCard';
import { FiSearch, FiLoader, FiLayers } from 'react-icons/fi';

export function SchemeGrid({
  schemes = [],
  loading = false,
  bookmarkedSchemeIds = [],
  onBookmarkToggle
}) {
  if (loading) {
    return (
      <div className="schemes-loading-container">
        <FiLoader className="spin-icon" />
        <p>Searching verified government schemes...</p>
      </div>
    );
  }

  if (!schemes || schemes.length === 0) {
    return (
      <div className="schemes-empty-container">
        <div className="empty-icon-circle">
          <FiLayers />
        </div>
        <h3>No Government Schemes Found</h3>
        <p>Try adjusting your search terms or filter selections to explore other opportunities.</p>
      </div>
    );
  }

  return (
    <div className="schemes-grid">
      {schemes.map((scheme) => {
        const id = scheme._id || scheme.id;
        const isBookmarked = bookmarkedSchemeIds.includes(id);
        return (
          <SchemeCard
            key={id}
            scheme={scheme}
            isBookmarked={isBookmarked}
            onBookmarkToggle={onBookmarkToggle}
          />
        );
      })}
    </div>
  );
}
