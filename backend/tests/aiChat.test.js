import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import app from '../server/api.js';

const prisma = new PrismaClient();

describe('AI Chat API Tests', () => {
  let userId;
  let sessionId;
  let testUser;
  
  beforeAll(async () => {
    // 清理数据库
    await prisma.aiChatMessage.deleteMany();
    await prisma.aiChatSession.deleteMany();
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'aitest@example.com' },
          { username: 'aitestuser' }
        ]
      }
    });
    
    // 创建测试用户
    testUser = await prisma.user.create({
      data: {
        email: 'aitest@example.com',
        username: 'aitestuser',
        password: 'testpassword123',
        name: 'AI Test User'
      }
    });
    userId = testUser.id;

    // Mock Gemini API 响应
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'This is AI test reply'
                  }
                ]
              }
            }
          ]
        })
      })
    );
  }, 10000);
  
  afterAll(async () => {
    await prisma.aiChatMessage.deleteMany();
    await prisma.aiChatSession.deleteMany();
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    global.fetch = fetch;
    await prisma.$disconnect();
  }, 10000);
  
  describe('Chat Session API', () => {
    it('should create a new chat session', async () => {
      const response = await request(app)
        .post('/aiChat/session')
        .send({ userId });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(userId);
      
      sessionId = response.body.id;
    });

    it('should fail to create session with invalid userId', async () => {
      const response = await request(app)
        .post('/aiChat/session')
        .send({ userId: 'invalid' });
      
      expect(response.status).toBe(500);
    });
  });

  describe('Chat Message API', () => {
    it('should send message and get AI reply', async () => {
      const message = 'Tell me about posts';
      
      const response = await request(app)
        .post('/aiChat/message')
        .send({
          sessionId,
          userId,
          message
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.role).toBe('assistant');
      expect(response.body.content).toBeDefined();
    });

    it('should handle message with post context', async () => {
      const message = 'What posts are available?';
      
      const response = await request(app)
        .post('/aiChat/message')
        .send({
          sessionId,
          userId,
          message
        });
      
      expect(response.status).toBe(200);
      expect(response.body.content).toBeDefined();
    });

    it('should handle message with comment context', async () => {
      const message = 'Show me the comments';
      
      const response = await request(app)
        .post('/aiChat/message')
        .send({
          sessionId,
          userId,
          message
        });
      
      expect(response.status).toBe(200);
      expect(response.body.content).toBeDefined();
    });

    it('should handle message with rating context', async () => {
      const message = 'What are the ratings?';
      
      const response = await request(app)
        .post('/aiChat/message')
        .send({
          sessionId,
          userId,
          message
        });
      
      expect(response.status).toBe(200);
      expect(response.body.content).toBeDefined();
    });
  });

  describe('Chat History API', () => {
    it('should get all messages of a session', async () => {
      const response = await request(app)
        .get(`/aiChat/session/${sessionId}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // 验证消息格式
      const message = response.body[0];
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('role');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('sessionId');
      expect(message).toHaveProperty('userId');
    });

    it('should handle invalid session ID', async () => {
      const response = await request(app)
        .get('/aiChat/session/999999');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields in message API', async () => {
      const response = await request(app)
        .post('/aiChat/message')
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should handle AI API failure gracefully', async () => {
      // 临时修改 mock 以模拟 API 失败
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/aiChat/message')
        .send({
          sessionId,
          userId,
          message: 'test message'
        });
      
      expect(response.status).toBe(500);
      
      // 恢复原来的 mock
      global.fetch = vi.fn().mockImplementation(() => 
        Promise.resolve({
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Test reply' }] } }]
          })
        })
      );
    });
  });
}); 