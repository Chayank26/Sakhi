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
    send, newChat, selectSession } = useAiConversations();
  const messages = conversationMessages.length ? conversationMessages : [INITIAL_WELCOME_MESSAGE];
  const [inputValue, setInputValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({});
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
  }, [inputValue, busy, ready, send]);

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

  // Copy message text to clipboard
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Set thumbs up / thumbs down feedback
  const handleFeedback = (msgId, type) => {
    setMessageFeedback((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  // Export conversation as text file
  const handleDownloadChat = () => {
    const formattedTranscript = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'YOU' : 'SAKHI AI'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const fileHeader = `========================================\n SAKHI AI CONVERSATION TRANSCRIPT\n Exported: ${new Date().toLocaleString()}\n========================================\n\n`;
    const fullContent = fileHeader + formattedTranscript;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sakhi_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                        className={`btn-bubble-tool ${messageFeedback[msg.id] === 'up' ? 'active-like' : ''}`}
                        onClick={() => handleFeedback(msg.id, 'up')}
                        title="Good response"
                      >
                        <FiThumbsUp className="tool-icon" />
                      </button>

                      <button
                        type="button"
                        className={`btn-bubble-tool ${messageFeedback[msg.id] === 'down' ? 'active-dislike' : ''}`}
                        onClick={() => handleFeedback(msg.id, 'down')}
                        title="Poor response"
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
          />
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

