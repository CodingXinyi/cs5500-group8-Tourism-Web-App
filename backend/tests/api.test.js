import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import app from '../server/api.js';


const prisma = new PrismaClient();

// test user data
const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  password: 'testpassword123'
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
      expect(response.body.username).toBe(testUser.username);
      expect(response.body).not.toHaveProperty('password');
      
      userId = response.body.id;
    });
    
    it('should not create user with duplicate username', async () => {
      const duplicateUser = {
        ...testUser,
        email: 'another@example.com'
      };

      const response = await request(app)
        .post('/user')
        .send(duplicateUser)
        .expect(400);

      expect(response.body.error).toBe('username already exists');
    });
    
    it('should not create user with duplicate email', async () => {
      const duplicateUser = {
        ...testUser,
        username: 'anotheruser'
      };

      const response = await request(app)
        .post('/user')
        .send(duplicateUser)
        .expect(400);

      expect(response.body.error).toBe('email already exists');
    });
    
    it('should get user information', async () => {
      const response = await request(app)
        .get(`/user/${userId}`)
        .expect(200);
      
      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('ratings');
      expect(response.body).toHaveProperty('comments');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 99999;
      const response = await request(app)
        .get(`/user/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('user not found');
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        username: testUser.username,
        password: testUser.password
      };

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(200);

      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail login with incorrect password', async () => {
      const loginData = {
        username: testUser.username,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('password is incorrect');
    });

    it('should fail login with non-existent username', async () => {
      const loginData = {
        username: 'nonexistentuser',
        password: 'somepassword'
      };

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(404);

      expect(response.body.error).toBe('user does not exist');
    });
  });
  
  // Post API tests
  describe('Post API', () => {
    it('should create a new post', async () => {
      const postData = {
        userId: userId,
        postName: testPost.postName,
        location: testPost.exactLocation,
        introduction: 'Test Introduction',
        description: testPost.postDetailDescription,
        policy: 'Test Policy',
        pictureUrl: testPost.pictureUrl
      };

      const response = await request(app)
        .post('/posts')
        .send(postData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.postName).toBe(postData.postName);
      expect(response.body.userId).toBe(userId);
      postId = response.body.id;
    });

    it('should get all posts', async () => {
      const response = await request(app)
        .get('/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('commentCount');
      expect(response.body[0].user).toHaveProperty('name');
    });

    it('should get post details by id', async () => {
      const response = await request(app)
        .get(`/posts/${postId}`)
        .expect(200);

      expect(response.body.id).toBe(postId);
      expect(response.body.postName).toBe(testPost.postName);
      expect(response.body).toHaveProperty('comments');
      expect(response.body).toHaveProperty('ratings');
      expect(response.body.user).toHaveProperty('name');
    });

    it('should update a post', async () => {
      const updateData = {
        postName: 'Updated Post Name',
        introduction: 'Updated Introduction'
      };

      const response = await request(app)
        .put(`/posts/${postId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.postName).toBe(updateData.postName);
      expect(response.body.introduction).toBe(updateData.introduction);
    });

    it('should get post comments', async () => {
      const response = await request(app)
        .get(`/posts/${postId}/comments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should delete a post', async () => {
      await request(app)
        .delete(`/posts/${postId}`)
        .expect(200);

      // Verify post is deleted
      const response = await request(app)
        .get(`/posts/${postId}`)
        .expect(404);

      expect(response.body.error).toBe('post not found');
    });
  });
}); 