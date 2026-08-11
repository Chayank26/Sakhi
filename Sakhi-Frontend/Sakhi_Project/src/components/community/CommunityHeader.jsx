import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiUser, FiBookmark, FiLogOut, FiHeart, FiShield, FiGrid } from 'react-icons/fi';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../pages/firebase/firebase';
import { SearchBar } from './SearchBar';

export function CommunityHeader({ searchQuery, setSearchQuery, onCreatePostClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Sakhi Member';
  const avatarUrl = user?.photoURL || null;

  return (
    <header className="community-header">
      <div className="community-header-inner">
        {/* Left: Brand logo & return link */}
        <div className="community-header-left">
          <Link to="/home" className="community-back-brand" title="Return to Sakhi Home">
            <span className="brand-logo-badge">🌸</span>
            <span className="brand-title">Sakhi</span>
          </Link>
          <span className="brand-divider">/</span>
          <Link to="/community" className="community-badge-link">
            Community
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="community-header-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search community posts, topics, advice..."
          />
        </div>

        {/* Right: Actions (Create Post + Profile) */}
        <div className="community-header-right">
          <button
            type="button"
            className="btn-create-post"
            onClick={onCreatePostClick || (() => navigate('/community/create'))}
          >
            <FiPlus className="btn-icon" />
            <span>Create Post</span>
          </button>

          <div className="community-user-menu-wrapper">
            <button
              type="button"
              className="community-avatar-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="community-avatar-img" />
              ) : (
                <div className="community-avatar-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="community-dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-name">{displayName}</p>
                  <p className="user-email">{user?.email || 'Authenticated User'}</p>
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/community/profile');
                  }}
                >
                  <FiUser className="item-icon" /> My Posts & Profile
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/community/saved');
                  }}
                >
                  <FiBookmark className="item-icon" /> Saved Posts
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/home');
                  }}
                >
                  <FiGrid className="item-icon" /> Sakhi Portal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
