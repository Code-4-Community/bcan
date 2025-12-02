import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';

// Create mock functions at module level
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockPut = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockPromise = vi.fn();

// Mock Cognito functions
const mockAdminAddUserToGroup = vi.fn().mockReturnThis();
const mockAdminRemoveUserFromGroup = vi.fn().mockReturnThis();
const mockAdminDeleteUser = vi.fn().mockReturnThis();
const mockCognitoPromise = vi.fn();

// Mock AWS SDK
vi.mock('aws-sdk', () => ({
  default: {
    CognitoIdentityServiceProvider: vi.fn(() => ({
      adminAddUserToGroup: mockAdminAddUserToGroup,
      adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
      adminDeleteUser: mockAdminDeleteUser,
      promise: mockCognitoPromise,
    })),
    DynamoDB: {
      DocumentClient: vi.fn(() => ({
        scan: mockScan,
        get: mockGet,
        update: mockUpdate,
        put: mockPut,
        delete: mockDelete,
        promise: mockPromise,
      }))
    }
  }
}));

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeAll(() => {
    // Set up environment variables
    process.env.DYNAMODB_USER_TABLE_NAME = 'test-users-table';
    process.env.COGNITO_USER_POOL_ID = 'test-pool-id';
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset promise mocks to default resolved state
    mockPromise.mockResolvedValue({});
    mockCognitoPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should get all users', async () => {
    const mockUsers = [
      { userId: '1', email: 'user1@example.com', position: 'Employee' },
      { userId: '2', email: 'user2@example.com', position: 'Admin' }
    ];

    // Setup the mock response
    mockPromise.mockResolvedValueOnce({ Items: mockUsers });

    const result = await userService.getAllUsers();
    
    expect(result).toEqual(mockUsers);
    expect(mockScan).toHaveBeenCalledWith({
      TableName: 'test-users-table'
    });
  });

  it('should get user by id', async () => {
    const mockUser = { userId: '1', email: 'user1@example.com', position: 'Employee' };
    
    // Setup the mock response
    mockPromise.mockResolvedValueOnce({ Item: mockUser });

    const result = await userService.getUserById('1');
    
    expect(result).toEqual(mockUser);
    expect(mockGet).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Key: { userId: '1' }
    });
  });

  it('should handle errors when getting all users', async () => {
    // Mock an error
    mockPromise.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(userService.getAllUsers()).rejects.toThrow('Could not retrieve users.');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle errors when getting user by id', async () => {
    // Mock an error
    mockPromise.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(userService.getUserById('1')).rejects.toThrow('Could not retrieve user.');
    expect(mockGet).toHaveBeenCalled();
  });
});