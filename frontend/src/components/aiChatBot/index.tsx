import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import './index.scss';
import { AuthContext } from '../../context/authContext';  // 调整路径以匹配你的项目结构

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
  const userId = currentUser?.id;  // 假设用户ID在currentUser.id中

  // 使用 useCallback 包装函数，确保依赖项不变时函数引用不变
  const loadSessionMessages = useCallback(async (sid: number) => {
    try {
      console.log(`正在加载会话${sid}的消息...`);
      const response = await axios.get(`http://localhost:8000/aiChat/session/${sid}`);
      console.log('加载消息成功:', response.data);
      const formattedMessages = response.data.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  }, []);

  // 使用 useCallback 包装 createChatSession 函数
  const createChatSession = useCallback(async () => {
    if (!userId) {
      console.error('用户未登录，无法创建聊天会话');
      return;
    }

    try {
      console.log('正在创建聊天会话，用户ID:', userId);
      const response = await axios.post('http://localhost:8000/aiChat/session', { userId });
      console.log('会话创建成功:', response.data);
      setSessionId(response.data.id);
      // 加载现有会话消息
      loadSessionMessages(response.data.id);
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  }, [userId, loadSessionMessages]);

  // 使用 useEffect 并指定正确的依赖项
  useEffect(() => {
    if (isOpen && !sessionId && userId) {
      createChatSession();
    }
  }, [isOpen, sessionId, userId, createChatSession]);

  // 使用 useCallback 包装 sendMessage 函数
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (!userId) {
      console.error('用户未登录，无法发送消息');
      return;
    }
    if (!sessionId) {
      await createChatSession();
      if (!sessionId) return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const requestData = {
        sessionId,
        userId,
        message: input
      };
      console.log('发送数据:', requestData);
      
      const response = await axios.post('http://localhost:8000/aiChat/message', requestData);
      console.log('接收到回复:', response.data);

      const aiReply = {
        role: 'assistant',
        content: response.data.content
      };
      
      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '请求失败，请稍后再试。' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, userId, sessionId, createChatSession]);

  return (
    <div className="ai-chatbot">
      <button 
        className="chatbot-button" 
        onClick={() => {
          if (!currentUser) {
            alert('请先登录再使用AI助手');
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
              <div className="welcome-message">您好！有什么可以帮助您的？</div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant loading">
                正在思考...
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="请输入问题..."
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
