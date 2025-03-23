import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import app from '../server/api.js';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// test user data
const testUser = {
  email: 'test@example.com',
  name: 'Test User'
};

// test post data
const testPost = {
  postName: 'Test Post',
  locationState: 'Test State',
  locationCity: 'Test City',
  exactLocation: 'Test Location',
  postDetailDescription: 'Test Description',
  pictureUrl: 'http://example.com/image.jpg'
};

describe('API Tests', () => {
  let userId;
  let postId;
  
  // before all tests, set test data
  beforeAll(async () => {
    // clean database
    await prisma.postComment.deleteMany();
    await prisma.postRating.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    
    // ensure database connection is normal
    try {
      await prisma.$connect();
      console.log('database connection success');
    } catch (error) {
      console.error('database connection failed:', error);
      throw error;
    }
  }, 30000);
  
  // after all tests, clean database
  afterAll(async () => {
    // clean database
    await prisma.postComment.deleteMany();
    await prisma.postRating.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    
    await prisma.$disconnect();
  }, 10000);
  
  // user API tests
  describe('User API', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/user')
        .send(testUser)
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      
      userId = response.body.id;
    });
    
    // 可以添加获取用户信息的测试
    it('should get user information', async () => {
      const response = await request(app)
        .get(`/user/${userId}`)
        .expect(200);
      
      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(testUser.email);
    });
  });
  
  // post API tests
  describe('Post API', () => {
    it('should create a new post', async () => {
      const postData = { ...testPost, userId };
      
      const response = await request(app)
        .post('/posts')
        .send(postData)
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.postName).toBe(testPost.postName);
      
      postId = response.body.id;
    });
    
    it('should get all posts', async () => {
      const response = await request(app)
        .get('/posts')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('commentCount');
    }, 10000);
    
    it('should get a specific post', async () => {
      const response = await request(app)
        .get(`/posts/${postId}`)
        .expect(200);
      
      expect(response.body.id).toBe(postId);
      // if there is no rating and comment function, you can remove these assertions
      // expect(response.body).toHaveProperty('averageRating');
      // expect(response.body).toHaveProperty('comments');
    });
    
    it('should update a post', async () => {
      const updateData = {
        postName: 'Updated Post Name'
      };
      
      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.postName).toBe(updateData.postName);
    });
    
    it('should delete a post', async () => {
      await request(app)
        .delete(`/posts/${postId}`)
        .expect(200);
      
      // 验证帖子是否被删除
      const response = await request(app)
        .get('/posts')
        .expect(200);
      
      expect(response.body.length).toBe(0);
    });
  }, 60000);
  
  // 移除评论API测试部分，因为您只想测试用户和帖子功能
}); 