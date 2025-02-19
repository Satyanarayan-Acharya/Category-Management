const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');

describe('Auth Controller - Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test User');
  });

  test('should fail to register an existing user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('should login a user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('should fail to login with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'wronguser@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
