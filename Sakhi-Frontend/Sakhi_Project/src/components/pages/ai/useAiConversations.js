import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { createAiSession, getAiSessions, sendChatMessage, saveAiFeedback } from '../../../services/aiApi';
import { chatSessionReducer, createChatState, mapSessionToSidebar } from './chatSessionUtils';

import { retryDelayMs } from './chatUiUtils';

const localId = () => `local-${crypto.randomUUID()}`;
const displayMessage = (sender, text, extra = {}) => ({
  id: localId(), sender, text,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...extra
});

export function useAiConversations() {
  const [state, dispatch] = useReducer(chatSessionReducer, undefined, () => createChatState(localId()));
  const lifecycle = useRef(0);
  const navigation = useRef(0);
  const inFlight = useRef(null);
  const feedbackRequests = useRef(new Set());
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let previousUid;
    const handleAuth = async (user) => {
      const uid = user?.uid || null;
      if (previousUid === uid) return;
      previousUid = uid;
      const generation = ++lifecycle.current;
      const selection = navigation.current;
      inFlight.current?.controller.abort();
      inFlight.current = null;
      feedbackRequests.current.clear();
      setNotice('');
      dispatch({ type: 'reset', id: localId() });
      let sessions = [];
      let errorMessage = '';
      try {
        if (user) {
          const response = await getAiSessions();
          sessions = (response.sessions || []).map(mapSessionToSidebar);
        }
      } catch {
        console.error('Failed to load Sakhi AI conversations.');
        errorMessage = 'Saved conversations could not be loaded.';
      }
      if (generation === lifecycle.current) {
        dispatch({ type: 'loaded', sessions, error: errorMessage, selectFirst: navigation.current === selection });
      }
    };
    const unsubscribe = auth ? onAuthStateChanged(auth, handleAuth) : undefined;
    if (!auth) void handleAuth(null);
    return () => { lifecycle.current += 1; inFlight.current?.controller.abort(); unsubscribe?.(); };
  }, []);

  const newChat = useCallback(() => {
    navigation.current += 1;
    dispatch({ type: 'new', id: localId() });
  }, []);
  const selectSession = useCallback((id) => {
    navigation.current += 1;
    dispatch({ type: 'select', id });
  }, []);

  const send = useCallback(async (text, { retry } = {}) => {
    if (!text.trim() || !state.ready || inFlight.current) return false;
    const session = state.sessions.find((entry) => entry.id === state.activeId);
    if (!session) return false;
    if (retry?.retryAt > Date.now()) {
      setNotice('Please wait for the service retry delay before trying again.');
      return false;
    }
    setNotice('');
    navigation.current += 1;
    const request = { controller: new AbortController() };
    inFlight.current = request;
    const turnId = retry?.turnId || crypto.randomUUID();
    if (retry) dispatch({ type: 'retry', id: session.id, turnId });
    const generation = lifecycle.current;
    let sessionId = session.id;
    const isCurrent = () => generation === lifecycle.current;
    const userMessage = displayMessage('user', text.trim(), { turnId });
    dispatch({ type: 'start', id: sessionId });
    dispatch({ type: 'append', id: sessionId, message: userMessage });

    try {
      let persisted = session.persisted;
      if (!persisted && auth?.currentUser) {
        const response = await createAiSession({ signal: request.controller.signal });
        if (!isCurrent()) return true;
        request.controller.signal.throwIfAborted();
        const saved = mapSessionToSidebar(response.session);
        dispatch({ type: 'saved', previousId: sessionId, session: { ...saved, messages: [...session.messages.filter((message) => message.turnId !== turnId), userMessage] } });
        sessionId = saved.id;
        persisted = true;
      }
      const history = [...session.messages.filter((message) => !message.isError && !message.failed && message.turnId !== turnId), userMessage]
        .map((message) => ({ role: message.sender === 'user' ? 'user' : 'assistant', content: message.text }));
      const response = await sendChatMessage(persisted ? text.trim() : history, persisted ? sessionId : null, { signal: request.controller.signal, clientTurnId: turnId });
      if (!isCurrent()) return true;
      request.controller.signal.throwIfAborted();
      if (response.session) {
        dispatch({ type: 'saved', previousId: sessionId, session: mapSessionToSidebar(response.session) });
      } else {
        dispatch({ type: 'append', id: sessionId,
          message: displayMessage('ai', response.message || 'No response from Sakhi AI.', { actions: response.actions, cards: response.cards }) });
      }
    } catch (error) {
      if (isCurrent()) {
        dispatch({ type: 'patch', id: sessionId, messageId: userMessage.id, patch: { failed: true } });
        const text = request.controller.signal.aborted ? 'Response stopped. You can retry this message.'
          : error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. You can retry this message.' : 'Unable to connect to Sakhi AI. Please try again.');
        dispatch({ type: 'append', id: sessionId, message: displayMessage('ai', text, { isError: true, turnId,
          retry: { text: userMessage.text, turnId, retryAt: Date.now() + retryDelayMs(error) } }) });
      }
    } finally {
      if (isCurrent() && inFlight.current === request) {
        inFlight.current = null;
        dispatch({ type: 'finish' });
      }
    }
    return true;
  }, [state]);

  const cancel = useCallback(() => inFlight.current?.controller.abort(), []);
  const reloadSessions = useCallback(async () => {
    const generation = lifecycle.current;
    const selection = navigation.current;
    try {
      const response = await getAiSessions();
      if (generation === lifecycle.current && selection === navigation.current && !inFlight.current) dispatch({ type: 'loaded', sessions: (response.sessions || []).map(mapSessionToSidebar), selectFirst: false });
    } catch {
      if (generation === lifecycle.current) dispatch({ type: 'loadError', error: 'Saved conversations could not be loaded. Please retry.' });
    }
  }, []);
  const rateMessage = useCallback(async (message, rating) => {
    if (!message.serverId || feedbackRequests.current.has(message.id)) return;
    const generation = lifecycle.current;
    const sessionId = state.activeId;
    feedbackRequests.current.add(message.id);
    dispatch({ type: 'patch', id: sessionId, messageId: message.id, patch: { feedbackPending: true } });
    try {
      const result = await saveAiFeedback(sessionId, message.serverId, message.feedback === rating ? null : rating);
      if (generation === lifecycle.current) {
        dispatch({ type: 'patch', id: sessionId, messageId: message.id, patch: { feedback: result.rating } });
        setNotice(result.rating ? 'Feedback saved. Thank you.' : 'Feedback removed.');
      }
    } catch {
      if (generation === lifecycle.current) setNotice('Feedback could not be saved. Please try again.');
    } finally {
      feedbackRequests.current.delete(message.id);
      if (generation === lifecycle.current) dispatch({ type: 'patch', id: sessionId, messageId: message.id, patch: { feedbackPending: false } });
    }
  }, [state.activeId]);

  const activeSession = state.sessions.find((session) => session.id === state.activeId);
  return {
    messages: activeSession?.messages || [],
    sessions: state.sessions.filter((session) => session.persisted || session.messages.length),
    activeSessionId: state.activeId,
    accountKey: state.accountKey,
    ready: state.ready,
    loadError: state.loadError, notice,
    busy: state.pendingId !== null,
    isTyping: state.pendingId === state.activeId,
    send, newChat, selectSession, cancel, rateMessage, reloadSessions
  };
}
