import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import app from '../server/api.js';

const prisma = new PrismaClient();

describe('AI Chat API Tests', () => {
  let userId;
  let sessionId;
  let testUser;
  
  // before all tests
  beforeAll(async () => {
    // clean database related tables
    await prisma.aiChatMessage.deleteMany();
    await prisma.aiChatSession.deleteMany();
    
    // ensure no same test user exists
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'aitest@example.com' },
          { username: 'aitestuser' }
        ]
      }
    });
    
    // create test user
    try {
      testUser = await prisma.user.create({
        data: {
          email: 'aitest@example.com',
          username: 'aitestuser',
          password: 'testpassword123',
          name: 'AI Test User'
        }
      });
      
      console.log('create test user successfully:', testUser);
      userId = testUser.id;
    } catch (error) {
      console.error('create test user failed:', error);
      throw error;
    }
    
    // mock fetch
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
  }, 30000);
  
  // after all tests
  afterAll(async () => {
    // clean database
    await prisma.aiChatMessage.deleteMany();
    await prisma.aiChatSession.deleteMany();
    
    // only delete user when it exists
    if (userId) {
      try {
        await prisma.user.delete({
          where: {
            id: userId
          }
        });
        console.log('delete test user successfully');
      } catch (error) {
        console.warn('delete test user failed:', error.message);
      }
    }
    
    // restore original fetch
    global.fetch = fetch;
    
    await prisma.$disconnect();
  }, 10000);
  
  // AI聊天测试
  describe('AI Chat API', () => {
    it('should create a new chat session', async () => {
      // first confirm user ID is valid
      if (!userId) {
        console.error('test user ID is invalid');
        throw new Error('test user ID is invalid');
      }
      
      const response = await request(app)
        .post('/aiChat/session')
        .send({ userId });
      
      console.log('create session response:', response.body);
      
      if (response.status !== 200) {
        console.error('create session failed:', response.body);
      }
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(userId);
      
      sessionId = response.body.id;
    });
    
    it('should create a session in database for later tests', async () => {
      // if API create session failed, create a session in database directly
      if (!sessionId) {
        const session = await prisma.aiChatSession.create({
          data: {
            userId
          }
        });
        sessionId = session.id;
        console.log('create session in database directly:', sessionId);
      }
      
      expect(sessionId).toBeDefined();
    });
    
    it('should create a message in database for later tests', async () => {
      // manually add test message to database
      const userMessage = await prisma.aiChatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'user',
          content: 'test message'
        }
      });
      
      const aiMessage = await prisma.aiChatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'assistant',
          content: 'test reply'
        }
      });
      
      expect(userMessage).toHaveProperty('id');
      expect(aiMessage).toHaveProperty('id');
    });
    
    it('should get all messages of a session', async () => {
      const response = await request(app)
        .get(`/aiChat/session/${sessionId}`);
      
      console.log('get messages response:', response.body);
      
      if (response.status !== 200) {
        console.error('get messages failed:', response.body);
      }
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // verify messages
      const userMsg = response.body.find(m => m.role === 'user');
      const aiMsg = response.body.find(m => m.role === 'assistant');
      
      expect(userMsg).toBeDefined();
      expect(aiMsg).toBeDefined();
    });
  });
}); 