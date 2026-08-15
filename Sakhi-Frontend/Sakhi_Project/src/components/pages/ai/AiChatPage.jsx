import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendChatMessage } from '../../../services/aiApi';
import {
  FiSend,
  FiArrowLeft,
  FiTrash2,
  FiCompass,
  FiCornerDownLeft,
  FiBriefcase,
  FiBookOpen,
  FiShield,
  FiUser,
  FiExternalLink
} from 'react-icons/fi';
import './AiChatPage.css';

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'ai',
  text: "🤖 Hi! I'm Sakhi AI. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTED_PROMPTS = [
  { icon: '💼', label: 'Find jobs in Chennai', prompt: 'Find me software engineering jobs in Chennai.' },
  { icon: '🎓', label: 'Recommend courses for me', prompt: 'Recommend data analytics courses for me.' },
  { icon: '📜', label: 'Government schemes for women', prompt: 'What government schemes are available for women entrepreneurs?' },
  { icon: '🌸', label: 'What can I do on Sakhi?', prompt: 'What features and services are available on Sakhi?' }
];

export function AiChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle message submission
  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsTyping(true);

    try {
      // Build conversation history payload for Phase 5 multi-turn context
      const existingHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const historyPayload = [
        ...existingHistory,
        { role: 'user', content: text }
      ];

      // Call Express backend endpoint POST /api/ai/chat with conversation history
      const data = await sendChatMessage(historyPayload);
      const replyText = data && data.message ? data.message : 'No response from Sakhi AI.';
      const actions = data && Array.isArray(data.actions) ? data.actions : [];

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to communicate with Sakhi AI backend:', error);
      const serverMsg = error.response?.data?.message;
      const is429 = error.response?.status === 429;
      
      const errorText = is429
        ? '⏳ Google Gemini Free Tier rate limit reached (20 requests/min). Please wait 5–10 seconds and try again!'
        : (serverMsg || '⚠️ Unable to connect to Sakhi AI backend. Please check your connection and try again.');

      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

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

  // Clear chat history
  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
  };

  return (
    <div className="ai-chat-shell">
      {/* Header Bar */}
      <header className="ai-chat-header">
        <div className="header-left">
          <button
            type="button"
            className="btn-back-home"
            onClick={() => navigate('/home')}
            title="Return to Sakhi Home"
          >
            <FiArrowLeft />
          </button>
          <div className="ai-brand-badge">
            <span className="brand-robot-avatar">🤖</span>
            <div>
              <h1 className="ai-brand-title">Sakhi AI</h1>
              <p className="ai-brand-subtitle">Your personal Sakhi assistant</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="btn-clear-chat"
            onClick={handleClearChat}
            title="Clear Chat History"
          >
            <FiTrash2 className="btn-icon" /> Clear Chat
          </button>
          <Link to="/home" className="btn-exit-ai">
            Portal Home
          </Link>
        </div>
      </header>

      {/* Main Chat Body */}
      <main className="ai-chat-body">
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}
            >
              {msg.sender === 'ai' && (
                <div className="avatar-circle ai-avatar">🤖</div>
              )}

              <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <div className="bubble-content">{msg.text}</div>

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

                <div className="bubble-timestamp">{msg.timestamp}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="avatar-circle user-avatar">
                  <FiUser />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-row ai-row">
              <div className="avatar-circle ai-avatar">🤖</div>
              <div className="message-bubble ai-bubble typing-bubble">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="typing-label">Sakhi AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Banner (visible when few messages exist) */}
        {messages.length <= 2 && !isTyping && (
          <div className="suggested-prompts-wrapper">
            <p className="suggested-heading">
              <FiCompass className="heading-icon" /> Suggested Prompts
            </p>
            <div className="prompts-grid">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip-btn"
                  onClick={() => handleSend(item.prompt)}
                >
                  <span className="chip-icon">{item.icon}</span>
                  <span className="chip-label">{item.label}</span>
                </button>
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
            placeholder="Ask Sakhi anything... (Enter to send, Shift+Enter for newline)"
            className="ai-chat-textarea"
          />
          <button
            type="button"
            className="btn-send-message"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
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
