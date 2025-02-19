const { registerUser, loginUser } = require('../src/controllers/authController');
const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');

jest.mock('../src/models/User');
jest.mock('../src/utils/generateToken');

describe('Auth Controller - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user', async () => {
    User.findOne.mockResolvedValue(null); // No user exists
    User.create.mockResolvedValue({ id: '123', name: 'Test User', email: 'testuser@example.com' });
    generateToken.mockReturnValue('mockedToken');

    const req = { body: { name: 'Test User', email: 'testuser@example.com', password: 'password123' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await registerUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: '123',
      name: 'Test User',
      email: 'testuser@example.com',
      token: 'mockedToken',
    });
  });

  test('should fail to register an existing user', async () => {
    User.findOne.mockResolvedValue({}); // User exists

    const req = { body: { name: 'Test User', email: 'testuser@example.com', password: 'password123' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await registerUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  test('should login a user', async () => {
    const mockUser = { id: '123', name: 'Test User', email: 'testuser@example.com', matchPassword: jest.fn() };
    mockUser.matchPassword.mockResolvedValue(true);
    User.findOne.mockResolvedValue(mockUser);
    generateToken.mockReturnValue('mockedToken');

    const req = { body: { email: 'testuser@example.com', password: 'password123' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await loginUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: '123',
      name: 'Test User',
      email: 'testuser@example.com',
      token: 'mockedToken',
    });
  });

  test('should fail to login with invalid credentials', async () => {
    User.findOne.mockResolvedValue(null); // User not found

    const req = { body: { email: 'wronguser@example.com', password: 'wrongpassword' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await loginUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });
});
