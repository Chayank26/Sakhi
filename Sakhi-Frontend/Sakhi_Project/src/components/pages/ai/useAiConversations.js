import { useCallback, useEffect, useReducer, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { createAiSession, getAiSessions, sendChatMessage } from '../../../services/aiApi';
import { chatSessionReducer, createChatState, mapSessionToSidebar } from './chatSessionUtils';

const localId = () => `local-${crypto.randomUUID()}`;
const displayMessage = (sender, text, extra = {}) => ({
  id: localId(), sender, text,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...extra
});

export function useAiConversations() {
  const [state, dispatch] = useReducer(chatSessionReducer, undefined, () => createChatState(localId()));
  const lifecycle = useRef(0);
  const navigation = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let previousUid;
    const handleAuth = async (user) => {
      const uid = user?.uid || null;
      if (previousUid === uid) return;
      previousUid = uid;
      const generation = ++lifecycle.current;
      const selection = navigation.current;
      inFlight.current = false;
      dispatch({ type: 'reset', id: localId() });
      let sessions = [];
      try {
        if (user) {
          const response = await getAiSessions();
          sessions = (response.sessions || []).map(mapSessionToSidebar);
        }
      } catch (error) {
        console.error('Failed to load Sakhi AI conversations:', error);
      }
      if (generation === lifecycle.current) {
        dispatch({ type: 'loaded', sessions, selectFirst: navigation.current === selection });
      }
    };
    const unsubscribe = auth ? onAuthStateChanged(auth, handleAuth) : undefined;
    if (!auth) void handleAuth(null);
    return () => { lifecycle.current += 1; unsubscribe?.(); };
  }, []);

  const newChat = useCallback(() => {
    navigation.current += 1;
    dispatch({ type: 'new', id: localId() });
  }, []);
  const selectSession = useCallback((id) => {
    navigation.current += 1;
    dispatch({ type: 'select', id });
  }, []);

  const send = useCallback(async (text) => {
    if (!text.trim() || !state.ready || inFlight.current) return false;
    const session = state.sessions.find((entry) => entry.id === state.activeId);
    if (!session) return false;
    inFlight.current = true;
    const generation = lifecycle.current;
    let sessionId = session.id;
    const isCurrent = () => generation === lifecycle.current;
    const userMessage = displayMessage('user', text.trim());
    dispatch({ type: 'start', id: sessionId });
    dispatch({ type: 'append', id: sessionId, message: userMessage });

    try {
      let persisted = session.persisted;
      if (!persisted && auth?.currentUser) {
        const response = await createAiSession();
        if (!isCurrent()) return true;
        const saved = mapSessionToSidebar(response.session);
        dispatch({ type: 'saved', previousId: sessionId, session: { ...saved, messages: [...session.messages, userMessage] } });
        sessionId = saved.id;
        persisted = true;
      }
      const history = [...session.messages.filter((message) => !message.isError), userMessage]
        .map((message) => ({ role: message.sender === 'user' ? 'user' : 'assistant', content: message.text }));
      const response = await sendChatMessage(persisted ? text.trim() : history, persisted ? sessionId : null);
      if (!isCurrent()) return true;
      if (response.session) {
        dispatch({ type: 'saved', previousId: sessionId, session: mapSessionToSidebar(response.session) });
      } else {
        dispatch({ type: 'append', id: sessionId,
          message: displayMessage('ai', response.message || 'No response from Sakhi AI.', { actions: response.actions, cards: response.cards }) });
      }
    } catch (error) {
      if (isCurrent()) dispatch({ type: 'append', id: sessionId,
        message: displayMessage('ai', error.response?.data?.message || 'Unable to connect to Sakhi AI. Please try again.', { isError: true }) });
    } finally {
      if (isCurrent()) {
        inFlight.current = false;
        dispatch({ type: 'finish' });
      }
    }
    return true;
  }, [state]);

  const activeSession = state.sessions.find((session) => session.id === state.activeId);
  return {
    messages: activeSession?.messages || [],
    sessions: state.sessions.filter((session) => session.persisted || session.messages.length),
    activeSessionId: state.activeId,
    ready: state.ready,
    busy: state.pendingId !== null,
    isTyping: state.pendingId === state.activeId,
    send, newChat, selectSession
  };
}
