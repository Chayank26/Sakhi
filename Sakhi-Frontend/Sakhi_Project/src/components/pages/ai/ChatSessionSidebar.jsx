import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiMoreHorizontal, FiDownload, FiEdit2, FiMapPin } from 'react-icons/fi';

export function ChatSessionSidebar({ sessions = [], onNewChat, activeSessionId, onSelectSession, onClose, signedIn, ready, onDownload, accountKey }) {
  const [query, setQuery] = useState('');
  const sidebar = useRef(null);
  const menuTrigger = useRef(null);
  const storageKey = `sakhi-chat-display:${accountKey}`;
  const [preferences, setPreferences] = useState(() => {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; }
  });
  const [openMenu, setOpenMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!openMenu) return;
    const dismiss = event => {
      if (!event.target.closest('.ai-session-menu, .ai-session-options')) setOpenMenu(null);
    };
    const escape = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpenMenu(null); menuTrigger.current?.focus(); }
    };
    const node = sidebar.current;
    document.addEventListener('pointerdown', dismiss);
    node?.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); node?.removeEventListener('keydown', escape); };
  }, [openMenu]);
  const moveMenuFocus = event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...event.currentTarget.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  const update = (id, change) => {
    const next = { ...preferences, [id]: { ...preferences[id], ...change } };
    setPreferences(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setError(''); } catch { setError('This change could not be saved on this device.'); }
    setOpenMenu(null);
  };
  const filtered = sessions.map(session => ({ ...session, title: preferences[session.id]?.title || session.title, pinned: preferences[session.id]?.pinned === true })).filter(session => session.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return <aside ref={sidebar} className="chat-session-sidebar" aria-label="Chat history">
    <div className="ai-sidebar-brand-row">
      <button type="button" className="ai-icon-button ai-history-close" onClick={onClose} aria-label="Close chat history"><FiX /></button></div>
    <button type="button" className="ai-new-chat" onClick={onNewChat} disabled={!ready}>New conversation</button>
    <label className="ai-history-search"><FiSearch aria-hidden="true" /><span className="ai-sr-only">Search conversations</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" /></label>
    <h2 className="ai-sidebar-label">Your conversations <span>{sessions.length}</span></h2>
    <nav className="chat-session-list" aria-label="Conversations">
      {!ready ? <p className="ai-sidebar-empty" role="status">Loading conversations…</p> : filtered.length === 0 ? <p className="ai-sidebar-empty">{query ? 'No matching conversations.' : 'Your next chapter starts with a question. Your conversations will appear here.'}</p> : filtered.map(session =>
        <div className="ai-session-row" key={session.id}>
          <button type="button" className={`chat-session-item ${session.id === activeSessionId ? 'active' : ''}`} aria-current={session.id === activeSessionId ? 'page' : undefined} onClick={() => onSelectSession(session.id)}>
            {session.pinned && <FiMapPin aria-label="Pinned" />}<span><strong>{session.title}</strong></span>
          </button>
          <button type="button" className="ai-session-options" aria-label={`Options for ${session.title}`} aria-expanded={openMenu === session.id} onClick={event => { menuTrigger.current = event.currentTarget; setOpenMenu(openMenu === session.id ? null : session.id); }}><FiMoreHorizontal /></button>
          <div className="ai-session-menu" hidden={openMenu !== session.id} onKeyDown={moveMenuFocus}>
            <button type="button" onClick={() => { onDownload(session); setOpenMenu(null); }}><FiDownload /> Download</button>
            <button type="button" onClick={() => update(session.id, { pinned: !session.pinned })}><FiMapPin /> {session.pinned ? 'Unpin' : 'Pin'}</button>
            <button type="button" onClick={() => { setRenaming(session.id); setName(session.title); setOpenMenu(null); }}><FiEdit2 /> Rename</button>
          </div>
          {renaming === session.id && <form className="ai-session-rename" onSubmit={event => { event.preventDefault(); if (name.trim()) { update(session.id, { title: name.trim() }); setRenaming(null); } }}>
            <label>Conversation name<input value={name} onChange={event => setName(event.target.value)} maxLength={100} required /></label>
            <button type="submit" disabled={!name.trim()}>Save</button><button type="button" onClick={() => setRenaming(null)}>Cancel</button>
          </form>}
        </div>)}
    </nav>
    {error && <p role="alert">{error}</p>}
    <p className="ai-history-local-note">Names and pins are saved on this device.</p>

    <div className="ai-sidebar-footer"><span className="ai-sidebar-eyebrow">A little guidance. A new possibility.</span>
      <p>{signedIn ? 'Your conversations are saved to your account.' : 'Guest chats stay in this tab. Sign in to save your conversations.'}</p>
      <Link to={signedIn ? '/profile' : '/login'} state={signedIn ? undefined : { returnTo: '/ai' }}>{signedIn ? 'Personalize your recommendations' : 'Sign in to save chats'} <span aria-hidden="true">↗</span></Link>
    </div>
  </aside>;
}
