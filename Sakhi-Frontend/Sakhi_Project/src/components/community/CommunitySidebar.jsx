import React from 'react';
import { FiShield, FiHeart, FiTag, FiCheckCircle } from 'react-icons/fi';
import { COMMUNITY_RULES, POPULAR_TOPICS } from './dummyData';

export function CommunitySidebar({ onTopicClick, selectedCategory }) {
  return (
    <aside className="community-sidebar">
      {/* About Sakhi Box */}
      <div className="sidebar-card about-card">
        <div className="sidebar-header">
          <FiHeart className="sidebar-icon accent-pink" />
          <h3>About Sakhi Community</h3>
        </div>
        <p className="about-text">
          A safe, supportive space for women to connect, share experiences, ask career questions, explore government schemes, and grow together.
        </p>
        <div className="community-stats-row">
          <div className="stat-pill">
            <span className="stat-num">5.2k+</span>
            <span className="stat-label">Sakhis</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">1.4k+</span>
            <span className="stat-label">Discussions</span>
          </div>
        </div>
      </div>

      {/* Community Rules Box */}
      <div className="sidebar-card rules-card">
        <div className="sidebar-header">
          <FiShield className="sidebar-icon accent-purple" />
          <h3>Community Rules</h3>
        </div>
        <ol className="rules-list">
          {COMMUNITY_RULES.map((rule, idx) => (
            <li key={idx} className="rule-item">
              <span className="rule-num">{idx + 1}.</span>
              <span className="rule-text">{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Popular Topics Box */}
      <div className="sidebar-card topics-card">
        <div className="sidebar-header">
          <FiTag className="sidebar-icon accent-amber" />
          <h3>Popular Topics</h3>
        </div>
        <div className="popular-tags-wrapper">
          {POPULAR_TOPICS.map((topic) => {
            const isActive = selectedCategory === topic;
            return (
              <button
                key={topic}
                type="button"
                className={`popular-topic-tag ${isActive ? 'active' : ''}`}
                onClick={() => onTopicClick && onTopicClick(topic)}
              >
                #{topic}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
