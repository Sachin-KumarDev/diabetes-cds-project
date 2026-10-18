import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChat = async () => {
    try {
      const response = await api.post('/chat/start', {});
      setSessionId(response.data.data.session_id);
      setMessages([
        { role: 'assistant', content: response.data.data.welcome_message }
      ]);
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        question: userMessage,
        session_id: sessionId
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.data.response 
      }]);

      // Show suggested questions
      if (response.data.data.suggested_questions) {
        setMessages(prev => [...prev, {
          role: 'suggestions',
          content: response.data.data.suggested_questions
        }]);
      }

    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Clinical AI Assistant</h2>
        <span className="chat-status">● Online</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div key={index} className="message user-message">
                <div className="message-content">
                  <span className="message-avatar">👨‍⚕️</span>
                  <div className="message-bubble user-bubble">{msg.content}</div>
                </div>
              </div>
            );
          } else if (msg.role === 'assistant') {
            return (
              <div key={index} className="message assistant-message">
                <div className="message-content">
                  <span className="message-avatar">🤖</span>
                  <div className="message-bubble assistant-bubble">{msg.content}</div>
                </div>
              </div>
            );
          } else if (msg.role === 'suggestions' && Array.isArray(msg.content)) {
            return (
              <div key={index} className="message suggestions-message">
                <div className="suggestions-container">
                  <p className="suggestions-label">💡 Suggested Questions:</p>
                  <div className="suggestions-grid">
                    {msg.content.map((q, i) => (
                      <button 
                        key={i} 
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
        
        {loading && (
          <div className="message assistant-message">
            <div className="message-content">
              <span className="message-avatar">🤖</span>
              <div className="message-bubble assistant-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about diabetes risk factors, treatment, lifestyle..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;