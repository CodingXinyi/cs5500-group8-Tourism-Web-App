import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import './index.scss';
import { AuthContext } from '../../context/authContext';  // 调整路径以匹配你的项目结构

// API基础URL
const API_BASE_URL = ' https://cs5500-group8-tourism-web-app.onrender.com';

// 添加一个处理消息内容的函数
const cleanMessageContent = (content: string) => {
  return content.replace(/\s*\*\s*/g, ', ');
};

// 添加常用prompt列表
const suggestionPrompts = [
  {
    text: "recommend the top 3 tourist destinations with the highest ratings",
    icon: "⭐"
  },
  {
    text: "recommend the top 3 tourist destinations with the most comments",
    icon: "💬"
  },
  {
    text: "find the best family-friendly tourist destinations",
    icon: "👨‍👩‍👧"
  },
  {
    text: "find the most popular outdoor activities",
    icon: "🏞️"
  }
];

const AIChatBot = () => {
  const { currentUser } = useContext(AuthContext);  // 从AuthContext获取当前用户
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 从currentUser对象中获取userId
  const userId = currentUser?.id;  // 确保使用currentUser中的id

  // 使用 useCallback 包装函数，确保依赖项不变时函数引用不变
  const loadSessionMessages = useCallback(async (sid: number) => {
    try {
      console.log(`Loading messages for ${sid}...`);
      const response = await axios.get(`${API_BASE_URL}/aiChat/session/${sid}`);
      console.log('Messages loaded successfully:', response.data);
      const formattedMessages = response.data.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  // 使用 useCallback 包装 createChatSession 函数
  const createChatSession = useCallback(async () => {
    if (!userId) {
      console.error('User not logged in, cannot create chat session');
      return;
    }

    try {
      console.log('Creating chat session, user ID:', userId);
      const response = await axios.post(`${API_BASE_URL}/aiChat/session`, { userId });
      console.log('Session created successfully:', response.data);
      setSessionId(response.data.id);
      // 加载现有会话消息
      loadSessionMessages(response.data.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, [userId, loadSessionMessages]);

  // 使用 useEffect 并指定正确的依赖项
  useEffect(() => {
    if (isOpen && !sessionId && userId) {
      createChatSession();
    }
  }, [isOpen, sessionId, userId, createChatSession]);

  // 使用 useCallback 包装 sendMessage 函数
  const sendMessage = useCallback(async (messageText = input) => {
    if (!messageText.trim()) return;
    if (!userId) {
      alert('please login first');
      return;
    }
    
    setLoading(true);
    try {
      const userMessage = { role: 'user', content: messageText };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const response = await axios.post(`${API_BASE_URL}/aiChat/message`, {
        sessionId,
        userId,
        message: messageText
      });

      const aiMessage = { role: 'assistant', content: response.data.content };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message, please try again later');
    } finally {
      setLoading(false);
    }
  }, [input, userId, sessionId]);

  // 处理建议提示点击
  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  return (
    <div className="ai-chatbot">
      <button 
        className="chatbot-button" 
        onClick={() => {
          if (!currentUser) {
            alert('Please login before using the AI assistant');
            return;
          }
          setIsOpen(!isOpen);
        }}
      >
        🤖
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-messages">
            {messages.length === 0 && !loading && (
              <div className="welcome-message">
                <p>Hi, I'm your travel assistant. How can I help you?</p>
                <div className="suggestion-prompts">
                  {suggestionPrompts.map((prompt, index) => (
                    <button 
                      key={index} 
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(prompt.text)}
                    >
                      <span className="prompt-icon">{prompt.icon}</span>
                      <span className="prompt-text">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {cleanMessageContent(msg.content)}
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant loading">
                Thinking...
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Enter your question..."
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
