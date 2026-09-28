import { buildChatTranscript } from './chatExport';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAiConversations } from './useAiConversations';
import { HomeHeader } from '../home/HomeHeader';
import { AiCardsContainer } from './AiChatCards';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import {
  FiSend,
  FiTrash2,
  FiCompass,
  FiBriefcase,
  FiBookOpen,
  FiShield,
  FiExternalLink,
  FiFileText,
  FiCopy,
  FiCheck,
  FiThumbsUp,
  FiThumbsDown,
  FiDownload
} from 'react-icons/fi';
import './AiChatPage.css';

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'ai',
  text: "Hello! I am Sakhi AI, your digital assistant on the Sakhi platform. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const CATEGORIZED_PROMPTS = [
  {
    category: 'Jobs & Careers',
    icon: <FiBriefcase />,
    items: [
      { label: 'Software jobs in Chennai', prompt: 'Find me software engineering jobs in Chennai.' },
      { label: 'Remote roles for women', prompt: 'Show me remote job opportunities available for women.' },
      { label: 'Entry-level openings', prompt: 'What entry-level fresher jobs are currently hiring?' }
    ]
  },
  {
    category: 'Sakhi Academy',
    icon: <FiBookOpen />,
    items: [
      { label: 'Data Analytics courses', prompt: 'Recommend data analytics courses for me.' },
      { label: 'Web development roadmap', prompt: 'What web development and coding courses are available?' },
      { label: 'Free certifications', prompt: 'Recommend free beginner courses with certificates.' }
    ]
  },
  {
    category: 'Government Schemes',
    icon: <FiFileText />,
    items: [
      { label: 'Women entrepreneur grants', prompt: 'What government schemes and loans are available for women entrepreneurs?' },
      { label: 'Maternity benefits', prompt: 'Tell me about government maternity and healthcare financial schemes.' },
      { label: 'Education scholarships', prompt: 'What government scholarships and grants exist for female students?' }
    ]
  },
  {
    category: 'Platform & Safety',
    icon: <FiShield />,
    items: [
      { label: 'Emergency helplines', prompt: 'What are the 24/7 emergency safety helpline numbers for women?' },
      { label: 'Explore Sakhi features', prompt: 'What features, mentorship, and services are available on Sakhi?' }
    ]
  }
];

export function AiChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages: conversationMessages, sessions, activeSessionId, ready, busy, isTyping,
    send, newChat, selectSession, cancel, rateMessage, reloadSessions, loadError, notice, accountKey } = useAiConversations();
  const messages = conversationMessages.length ? conversationMessages : [INITIAL_WELCOME_MESSAGE];
  const [inputDraft, setInputDraft] = useState({ accountKey: null, text: '' });
  const inputValue = inputDraft.accountKey === accountKey ? inputDraft.text : '';
  const setInputValue = useCallback((text) => setInputDraft({ accountKey, text }), [accountKey]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [utilityNotice, setUtilityNotice] = useState('');
  const copyTimer = useRef(null);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initialPromptProcessed = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isTyping]);

  const handleSend = useCallback((textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || busy || !ready) return;
    void send(text);
    if (!textToSend) setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [inputValue, busy, ready, send, setInputValue]);

  useEffect(() => {
    if (!ready || busy || initialPromptProcessed.current) return;
    const initialPrompt = new URLSearchParams(location.search).get('prompt') || location.state?.prompt;
    if (initialPrompt?.trim()) {
      const timer = setTimeout(() => {
        initialPromptProcessed.current = true;
        handleSend(initialPrompt.trim());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.search, location.state, ready, busy, handleSend]);

  // Handle keypress inside textarea (Enter sends, Shift+Enter newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea as user types
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setUtilityNotice('Message copied.');
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      setUtilityNotice('Could not copy. Select the message text to copy it manually.');
    }
  };

  // Export conversation as text file
  const handleDownloadChat = () => {
    const fullContent = buildChatTranscript(conversationMessages);

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sakhi_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="ai-chat-shell">
      <HomeHeader pageTitle="AI Assistant" />

      {/* Top Bar with Export & Clear Buttons */}
      <div className="ai-top-nav-bar">
        <div className="ai-top-status-indicator">
          <span className="pulse-dot"></span>
          <span className="status-label">Sakhi AI Active</span>
        </div>

        <div className="ai-top-actions-group">
          <button
            type="button"
            onClick={handleDownloadChat}
            disabled={!conversationMessages.some((message) => !message.failed && !message.isError)}
            className="btn-top-action"
            title="Download conversation transcript"
          >
            <FiDownload /> Export Chat
          </button>
          <button
            type="button"
            onClick={newChat}
            className="btn-top-action danger"
            title="Start a fresh conversation; saved chats remain in Recent chats"
          >
            <FiTrash2 /> Clear Chat
          </button>
        </div>
      </div>

      <div className="ai-chat-notices" role="status" aria-live="polite">
        {!ready && <p>Loading your conversations…</p>}
        {loadError && <p>{loadError} <button type="button" disabled={busy} onClick={reloadSessions}>Retry loading</button></p>}
        {(notice || utilityNotice) && <p>{notice || utilityNotice}</p>}
        {busy && !isTyping && <p>A response is still running in another conversation. <button type="button" onClick={cancel}>Stop response</button></p>}
      </div>
      {/* Main Chat Body */}
      <main className="ai-chat-body ai-chat-layout">
        <ChatSessionSidebar
          sessions={sessions}
          onNewChat={newChat}
          onSelectSession={selectSession}
          activeSessionId={activeSessionId}
        />

        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}
            >
              <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                {/* Bubble Content */}
                <div className="bubble-content">
                  {msg.sender === 'ai' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Structured In-Chat Cards (Jobs, Courses, Schemes) */}
                {msg.sender === 'ai' && msg.cards && (
                  <AiCardsContainer cards={msg.cards} />
                )}

                {/* Navigation Action Buttons */}
                {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                  <div className="bubble-actions">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn-action-nav"
                        onClick={() => navigate(act.route)}
                      >
                        <span>{act.label}</span>
                        <FiExternalLink />
                      </button>
                    ))}
                  </div>
                )}

                {msg.retry && msg.id === messages.at(-1)?.id && (
                  <button type="button" className="btn-top-action" disabled={busy || !ready}
                    onClick={() => send(msg.retry.text, { retry: msg.retry })}>Retry message</button>
                )}
                {/* Bottom Footer Meta & Controls */}
                <div className="bubble-footer-row">
                  <span className="bubble-timestamp">{msg.timestamp}</span>

                  {msg.sender === 'ai' && (
                    <div className="bubble-utility-buttons">
                      <button
                        type="button"
                        className="btn-bubble-tool"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Copy text"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <FiCheck className="tool-icon success" />
                            <span className="tool-label">Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="tool-icon" />
                            <span className="tool-label">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className={`btn-bubble-tool ${msg.feedback === 'up' ? 'active-like' : ''}`}
                        onClick={() => rateMessage(msg, 'up')}
                        disabled={!msg.serverId || msg.feedbackPending}
                        aria-pressed={msg.feedback === 'up'}
                        title={msg.serverId ? 'Good response' : 'Feedback is available for saved responses'}
                      >
                        <FiThumbsUp className="tool-icon" />
                      </button>

                      <button
                        type="button"
                        className={`btn-bubble-tool ${msg.feedback === 'down' ? 'active-dislike' : ''}`}
                        onClick={() => rateMessage(msg, 'down')}
                        disabled={!msg.serverId || msg.feedbackPending}
                        aria-pressed={msg.feedback === 'down'}
                        title={msg.serverId ? 'Poor response' : 'Feedback is available for saved responses'}
                      >
                        <FiThumbsDown className="tool-icon" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-row ai-row">
              <div className="message-bubble ai-bubble typing-bubble">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="typing-label">Sakhi AI is analyzing & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Categorized Suggested Prompts (visible when chat has <= 2 messages) */}
        {messages.length <= 2 && !isTyping && (
          <div className="suggested-prompts-wrapper">
            <p className="suggested-heading">
              <FiCompass className="heading-icon" /> Quick Exploration Prompts
            </p>

            <div className="prompts-category-grid">
              {CATEGORIZED_PROMPTS.map((cat, idx) => (
                <div key={idx} className="prompt-category-card">
                  <div className="prompt-category-header">
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-title">{cat.category}</span>
                  </div>
                  <div className="category-chips-list">
                    {cat.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        type="button"
                        className="prompt-chip-btn"
                        disabled={busy || !ready}
                        onClick={() => handleSend(item.prompt)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input Dock Footer */}
      <footer className="ai-chat-footer">
        <div className="input-dock-container">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sakhi anything about jobs, courses, government schemes, or safety..."
            className="ai-chat-textarea"
            disabled={!ready}
            aria-label="Message Sakhi AI"
          />
          {busy && <button type="button" className="btn-top-action" onClick={cancel}>Stop</button>}
          <button
            type="button"
            className="btn-send-message"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || busy || !ready}
            aria-label="Send message"
          >
            <FiSend />
          </button>
        </div>
        <div className="footer-disclaimer">
          <span>Press <strong>Enter ↵</strong> to send • <strong>Shift + Enter</strong> for multi-line</span>
        </div>
      </footer>
    </div>
  );
}

