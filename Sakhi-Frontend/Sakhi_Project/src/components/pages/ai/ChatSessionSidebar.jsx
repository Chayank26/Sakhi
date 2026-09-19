import React from 'react';
import { FiPlus, FiMessageSquare } from 'react-icons/fi';

export function ChatSessionSidebar({ sessions = [], onNewChat, activeSessionId, onSelectSession }) {
  return (
    <aside className="chat-session-sidebar">
      <div className="chat-session-header">
        <h3>Recent chats</h3>
        <button type="button" className="new-chat-btn" onClick={onNewChat}>
          <FiPlus /> New chat
        </button>
      </div>

      <div className="chat-session-list">
        {sessions.length === 0 ? (
          <div className="chat-session-empty">No conversations yet</div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={`chat-session-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession?.(session.id)}
            >
              <span className="chat-session-icon"><FiMessageSquare /></span>
              <span className="chat-session-meta">
                <strong>{session.title}</strong>
                <small>{session.preview}</small>
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
