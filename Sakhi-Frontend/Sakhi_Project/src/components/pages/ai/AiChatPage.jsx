import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FiArrowUp, FiArrowDown, FiPlus, FiMenu, FiBriefcase, FiBookOpen, FiFileText, FiArrowUpRight, FiCopy, FiCheck, FiThumbsUp, FiThumbsDown, FiDownload, FiSquare, FiRefreshCw, FiAlertCircle, FiCompass } from 'react-icons/fi';
import { useAccount } from '../../account/accountContext';
import { useAiConversations } from './useAiConversations';
import { buildChatTranscript } from './chatExport';
import { MAX_CHAT_LENGTH, safeChatRoute, shouldSendOnEnter } from './chatUiUtils';
import { AiCardsContainer } from './AiChatCards';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import { HomeHeader } from '../home/HomeHeader';
import './AiChatPage.css';

const prompts = [
  { icon: FiBriefcase, title: 'Find your next opportunity', detail: 'Explore jobs that fit your skills and goals.', prompt: 'Find entry-level remote jobs for me.', tag: 'CAREERS' },
  { icon: FiBookOpen, title: 'Learn something new', detail: 'Build confidence, one skill at a time.', prompt: 'Recommend free beginner Python courses.', tag: 'LEARNING' },
  { icon: FiFileText, title: 'Discover available support', detail: 'Explore government schemes and benefits.', prompt: 'What schemes support women entrepreneurs?', tag: 'SCHEMES' },
];

export function AiChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAccount();
  const { messages, sessions, activeSessionId, ready, busy, isTyping, send, newChat, selectSession, cancel, rateMessage, reloadSessions, loadError, notice, accountKey } = useAiConversations();
  const [draft, setDraft] = useState({ accountKey: null, text: '' });
  const text = draft.accountKey === accountKey ? draft.text : '';
  const [copied, setCopied] = useState(null);
  const [utilityNotice, setUtilityNotice] = useState('');
  const [showLatest, setShowLatest] = useState(false);
  const textarea = useRef(null);
  const viewport = useRef(null);
  const drawer = useRef(null);
  const historyButton = useRef(null);
  const stickToBottom = useRef(true);
  const copyTimer = useRef(null);
  const processedPrompt = useRef(null);
  const currentSession = sessions.find(session => session.id === activeSessionId);
  const setText = useCallback(value => setDraft({ accountKey, text: value }), [accountKey]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 160)}px`; }
  }, [text]);
  useEffect(() => {
    if (stickToBottom.current && viewport.current) viewport.current.scrollTop = messages.length ? viewport.current.scrollHeight : 0;
  }, [messages, isTyping, activeSessionId]);

  const submit = useCallback(async value => {
    const message = (value ?? text).trim();
    if (!message || message.length > MAX_CHAT_LENGTH || busy || !ready) return;
    stickToBottom.current = true;
    const accepted = send(message);
    if (value === undefined) setText('');
    setUtilityNotice('');
    textarea.current?.focus();
    await accepted;
  }, [text, busy, ready, send, setText]);

  useEffect(() => {
    const prompt = new URLSearchParams(location.search).get('prompt') || location.state?.prompt;
    if (!ready || busy || !prompt?.trim() || processedPrompt.current === location.key) return;
    const timer = setTimeout(() => { processedPrompt.current = location.key; if (prompt.length > MAX_CHAT_LENGTH) setText(prompt.slice(0, MAX_CHAT_LENGTH)); else void submit(prompt); }, 0);
    return () => clearTimeout(timer);
  }, [location.key, location.search, location.state, ready, busy, submit, setText]);

  const trapHistoryFocus = event => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled)')].filter(node => node.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const closeHistory = () => { drawer.current?.close(); historyButton.current?.focus(); };
  const choose = id => { stickToBottom.current = true; setShowLatest(false); selectSession(id); closeHistory(); };
  const startNew = () => { stickToBottom.current = true; setShowLatest(false); newChat(); setText(''); setUtilityNotice(''); closeHistory(); textarea.current?.focus(); };
  const copy = async message => {
    try { await navigator.clipboard.writeText(message.text); setCopied(message.id); setUtilityNotice('Response copied.'); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(null), 2000); }
    catch { setUtilityNotice('Could not copy. Select the response text to copy it manually.'); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([buildChatTranscript(messages)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `Sakhi_Chat_${new Date().toISOString().slice(0, 10)}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setUtilityNotice('Conversation exported.');
  };
  const sidebarProps = { sessions, activeSessionId, ready, signedIn: Boolean(user), onNewChat: startNew, onSelectSession: choose, onClose: closeHistory };

  return <div className="ai-page-shell">
    <HomeHeader pageTitle="Sakhi AI" />
    <main className="ai-workspace">
    <div className="ai-desktop-sidebar"><ChatSessionSidebar {...sidebarProps} /></div>
    <dialog className="ai-history-dialog" ref={drawer} aria-label="Chat history" onKeyDown={trapHistoryFocus} onClick={event => { if (event.target === event.currentTarget) closeHistory(); }}>
      <ChatSessionSidebar {...sidebarProps} />
    </dialog>
    <section className="ai-conversation" aria-label="Sakhi AI conversation">
      <header className="ai-conversation-header">
        <button ref={historyButton} type="button" className="ai-icon-button ai-history-toggle" onClick={() => drawer.current?.showModal()} aria-label="Open chat history" aria-haspopup="dialog"><FiMenu /></button>
        <div className="ai-conversation-heading"><span className="ai-overline">YOUR EVERYDAY GUIDE</span><h1>{currentSession?.title || 'A fresh start with Sakhi'}</h1></div>
        <div className="ai-header-actions">
          <button type="button" className="ai-icon-button" onClick={download} disabled={!messages.some(message => !message.failed && !message.isError)} aria-label="Export conversation" title="Export conversation"><FiDownload /></button>
          <button type="button" className="ai-icon-button" onClick={startNew} disabled={!ready} aria-label="New conversation" title="New conversation"><FiPlus /></button>
        </div>
      </header>
      <div className="ai-notice-region" aria-live="polite" role="status">
        {loadError && <p className="ai-notice ai-notice-error"><FiAlertCircle />{loadError}<button disabled={busy} onClick={reloadSessions}>Retry loading</button></p>}
        {(notice || utilityNotice) && <p className="ai-notice">{notice || utilityNotice}</p>}
        {busy && !isTyping && <p className="ai-notice">A response is running in another conversation.<button onClick={cancel}>Stop response</button></p>}
      </div>
      <div ref={viewport} className="ai-message-viewport" role="region" aria-label="Messages" tabIndex={0} onScroll={event => { const node = event.currentTarget; const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 100; stickToBottom.current = nearBottom; setShowLatest(messages.length > 0 && !nearBottom); }}>
        {!messages.length && <div className="ai-welcome">
          <div className="ai-welcome-emblem" aria-hidden="true"><FiCompass /></div><span className="ai-overline">SMALL STEPS. NEW POSSIBILITIES.</span>
          <h2>What’s your next<br /><em>chapter?</em></h2><p>A new role, a new skill, or a little direction.<br className="ai-desktop-break" /> Let’s find your way forward, together.</p>
          <div className="ai-prompt-grid">{prompts.map(({ icon: Icon, title, detail, prompt, tag }) => <button className="ai-prompt-card" type="button" key={tag} onClick={() => submit(prompt)} disabled={!ready || busy}>
            <span className="ai-prompt-top"><Icon /><span>{tag}</span><FiArrowUpRight /></span><strong>{title}</strong><span>{detail}</span>
          </button>)}</div>
          <p className="ai-welcome-hint">Try adding your location or a skill for more relevant suggestions.</p>
        </div>}
        <div className="ai-message-list" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions">
          {messages.map(message => <article key={message.id} className={`ai-message ${message.sender === 'user' ? 'ai-message-user' : 'ai-message-assistant'} ${message.isError ? 'ai-message-error' : ''}`} aria-label={message.sender === 'user' ? 'Your message' : message.isError ? 'Response issue' : 'Sakhi response'}>
            <div className="ai-message-author"><span className="ai-avatar" aria-hidden="true">{message.sender === 'user' ? 'Y' : <FiCompass />}</span><h2>{message.sender === 'user' ? 'You' : 'Sakhi'}</h2><time>{message.timestamp}</time>{message.failed && <span className="ai-failed-label">Not completed</span>}</div>
            <div className="ai-message-content">{message.sender === 'ai' ? <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}>{message.text}</ReactMarkdown> : <p>{message.text}</p>}</div>
            {message.sender === 'ai' && !message.isError && <AiCardsContainer cards={message.cards} />}
            {!!message.actions?.length && <div className="ai-message-actions">{message.actions.filter(action => safeChatRoute(action.route)).map((action, index) => <button type="button" key={index} onClick={() => navigate(action.route)}>{action.label}<FiArrowUpRight /></button>)}</div>}
            {message.retry && message.id === messages.at(-1)?.id && <button type="button" className="ai-retry-button" disabled={busy || !ready} onClick={() => send(message.retry.text, { retry: message.retry })}><FiRefreshCw /> Retry message</button>}
            {message.sender === 'ai' && !message.isError && <div className="ai-message-tools">
              <button type="button" onClick={() => copy(message)} aria-label={copied === message.id ? 'Response copied' : 'Copy response'}>{copied === message.id ? <FiCheck /> : <FiCopy />}<span>{copied === message.id ? 'Copied' : 'Copy'}</span></button>
              <button type="button" onClick={() => rateMessage(message, 'up')} disabled={!message.serverId || message.feedbackPending} aria-label="Helpful response" aria-pressed={message.feedback === 'up'} title={message.serverId ? 'Helpful response' : 'Sign in to save feedback'}><FiThumbsUp /></button>
              <button type="button" onClick={() => rateMessage(message, 'down')} disabled={!message.serverId || message.feedbackPending} aria-label="Unhelpful response" aria-pressed={message.feedback === 'down'} title={message.serverId ? 'Unhelpful response' : 'Sign in to save feedback'}><FiThumbsDown /></button>
            </div>}
          </article>)}
        </div>
        {isTyping && <div className="ai-thinking" role="status"><span className="ai-thinking-dots" aria-hidden="true"><i /><i /><i /></span>Finding a helpful way forward…</div>}
      </div>
      <div className="ai-composer-area">
        {showLatest && <button type="button" className="ai-jump-latest" onClick={() => { if (viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight; stickToBottom.current = true; setShowLatest(false); }}><FiArrowDown /> Latest message</button>}
        <form className="ai-composer" onSubmit={event => { event.preventDefault(); void submit(); }}>
          <label className="ai-sr-only" htmlFor="sakhi-message">Message Sakhi AI</label>
          <textarea id="sakhi-message" ref={textarea} rows={1} value={text} maxLength={MAX_CHAT_LENGTH} onChange={event => setText(event.target.value)} onKeyDown={event => { if (shouldSendOnEnter(event)) { event.preventDefault(); void submit(); } }} placeholder={ready ? 'Tell me what you’re looking for…' : 'Getting your conversations ready…'} disabled={!ready} aria-describedby="ai-composer-help" />
          <div className="ai-composer-bottom"><span id="ai-composer-help">{text.length > MAX_CHAT_LENGTH - 500 ? `${text.length.toLocaleString()} / ${MAX_CHAT_LENGTH.toLocaleString()}` : 'Enter to send · Shift + Enter for a new line'}</span>
            {busy ? <button type="button" className="ai-send-button ai-stop-button" onClick={cancel} aria-label="Stop response"><FiSquare /></button> : <button type="submit" className="ai-send-button" disabled={!text.trim() || !ready} aria-label="Send message"><FiArrowUp /></button>}
          </div>
        </form>
        <p className="ai-composer-note">A starting point, not a final answer. Verify details with the original source. <Link to="/support">Need help?</Link></p>
      </div>
    </section>
  </main>
  </div>;
}
