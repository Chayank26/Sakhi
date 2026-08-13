const SAVED_SCHEMES_KEY = 'sakhi_saved_schemes';

/**
 * Get array of bookmarked scheme IDs from localStorage
 */
export const getSavedSchemeIds = () => {
  try {
    const saved = localStorage.getItem(SAVED_SCHEMES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved schemes from localStorage:', error);
    return [];
  }
};

/**
 * Toggle bookmark status for a scheme ID
 * Returns updated array of saved scheme IDs and boolean isSaved
 */
export const toggleSavedScheme = (schemeId) => {
  try {
    const current = getSavedSchemeIds();
    const isSaved = current.includes(schemeId);
    let updated;
    if (isSaved) {
      updated = current.filter((id) => id !== schemeId);
    } else {
      updated = [...current, schemeId];
    }
    localStorage.setItem(SAVED_SCHEMES_KEY, JSON.stringify(updated));
    return { updatedIds: updated, isSaved: !isSaved };
  } catch (error) {
    console.error('Error toggling saved scheme in localStorage:', error);
    return { updatedIds: getSavedSchemeIds(), isSaved: false };
  }
};

/**
 * Check if a scheme ID is saved
 */
export const isSchemeSaved = (schemeId) => {
  const current = getSavedSchemeIds();
  return current.includes(schemeId);
};
