import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMessageSquare, FiSearch, FiX } from 'react-icons/fi';

export function ChatSessionSidebar({ sessions = [], onNewChat, activeSessionId, onSelectSession, onClose, signedIn, ready }) {
  const [query, setQuery] = useState('');
  const filtered = sessions.filter(session => `${session.title} ${session.preview}`.toLowerCase().includes(query.toLowerCase()));
  return <aside className="chat-session-sidebar" aria-label="Chat history">
    <div className="ai-sidebar-brand-row">
      <button type="button" className="ai-icon-button ai-history-close" onClick={onClose} aria-label="Close chat history"><FiX /></button></div>
    <button type="button" className="ai-new-chat" onClick={onNewChat} disabled={!ready}><FiPlus /> New conversation</button>
    <label className="ai-history-search"><FiSearch aria-hidden="true" /><span className="ai-sr-only">Search conversations</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" /></label>
    <h2 className="ai-sidebar-label">Your conversations <span>{sessions.length}</span></h2>
    <nav className="chat-session-list" aria-label="Conversations">
      {!ready ? <p className="ai-sidebar-empty" role="status">Loading conversations…</p> : filtered.length === 0 ? <p className="ai-sidebar-empty">{query ? 'No matching conversations.' : 'Your next chapter starts with a question. Your conversations will appear here.'}</p> : filtered.map(session =>
        <button key={session.id} type="button" className={`chat-session-item ${session.id === activeSessionId ? 'active' : ''}`} aria-current={session.id === activeSessionId ? 'page' : undefined} onClick={() => onSelectSession(session.id)}>
          <FiMessageSquare aria-hidden="true" /><span><strong>{session.title}</strong><small>{session.preview}</small></span>
        </button>)}
    </nav>
    <div className="ai-sidebar-footer"><span className="ai-sidebar-eyebrow">A little guidance. A new possibility.</span>
      <p>{signedIn ? 'Your conversations are saved to your account.' : 'Guest chats stay in this tab. Sign in to save your conversations.'}</p>
      <Link to={signedIn ? '/profile' : '/login'} state={signedIn ? undefined : { returnTo: '/ai' }}>{signedIn ? 'Personalize your recommendations' : 'Sign in to save chats'} <span aria-hidden="true">↗</span></Link>
    </div>
  </aside>;
}
