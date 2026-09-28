export const mapSessionToSidebar = (session) => {
  const id = session._id || session.id;
  const messages = Array.isArray(session.messages) ? session.messages : [];
  return {
    id,
    persisted: true,
    title: session.title || 'New conversation',
    preview: [...messages].reverse().find((msg) => msg.role === 'user')?.content || 'Start a new conversation',
    messages: messages.map((msg, index) => ({
      id: `${id}-${msg._id || index}`,
      serverId: msg._id,
      turnId: msg.turnId,
      feedback: msg.feedback?.rating || null,
      sender: msg.role === 'assistant' ? 'ai' : 'user',
      text: msg.content || '',
      actions: msg.actions || [],
      cards: msg.cards || { jobs: [], courses: [], schemes: [] },
      timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }))
  };
};

export const createDraft = (id) => ({ id, persisted: false, title: 'New conversation', preview: '', messages: [] });
export const createChatState = (id) => ({ accountKey: id, sessions: [createDraft(id)], activeId: id, pendingId: null, ready: false, loadError: '' });

// Every response targets its originating session; changing the selection never redirects it.
export const chatSessionReducer = (state, action) => {
  switch (action.type) {
    case 'reset': return createChatState(action.id);
    case 'loaded': {
      const sessions = [...action.sessions, ...state.sessions.filter((session) => !action.sessions.some((saved) => saved.id === session.id) &&
        (!session.persisted || session.id === state.activeId || session.id === state.pendingId))];
      return { ...state, sessions, ready: true, loadError: action.error || '',
        activeId: action.selectFirst && action.sessions.length ? action.sessions[0].id : state.activeId };
    }
    case 'loadError': return { ...state, loadError: action.error };
    case 'patch': return { ...state, sessions: state.sessions.map((session) => session.id !== action.id ? session : { ...session,
      messages: session.messages.map((message) => message.id === action.messageId ? { ...message, ...action.patch } : message) }) };
    case 'retry': return { ...state, sessions: state.sessions.map((session) => session.id !== action.id ? session : { ...session,
      messages: session.messages.filter((message) => message.turnId !== action.turnId) }) };
    case 'new': return { ...state, activeId: action.id,
      sessions: [...state.sessions.filter((session) => session.messages.length || session.persisted || session.id === state.pendingId), createDraft(action.id)] };
    case 'select': return state.sessions.some((session) => session.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'start': return { ...state, pendingId: action.id };
    case 'finish': return { ...state, pendingId: null };
    case 'saved': return { ...state,
      activeId: state.activeId === action.previousId ? action.session.id : state.activeId,
      pendingId: state.pendingId === action.previousId ? action.session.id : state.pendingId,
      sessions: [action.session, ...state.sessions.filter((session) => session.id !== action.previousId && session.id !== action.session.id)] };
    case 'append': return { ...state, sessions: state.sessions.map((session) => {
      if (session.id !== action.id) return session;
      const firstUser = action.message.sender === 'user' && !session.messages.some((message) => message.sender === 'user');
      return { ...session, messages: [...session.messages, action.message],
        title: firstUser ? action.message.text.slice(0, 32) : session.title,
        preview: action.message.sender === 'user' ? action.message.text : session.preview };
    }) };
    default: return state;
  }
};
