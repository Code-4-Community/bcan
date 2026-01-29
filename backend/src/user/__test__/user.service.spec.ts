import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

import * as AWS from 'aws-sdk';

import { VerifyUserGuard, VerifyAdminRoleGuard, VerifyAdminOrEmployeeRoleGuard } from '../../guards/auth.guard';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// Create mock functions at module level (BEFORE mock)
const mockScan = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPromise = vi.fn();

// Mock Cognito functions
const mockAdminAddUserToGroup = vi.fn();
const mockAdminRemoveUserFromGroup = vi.fn();
const mockAdminDeleteUser = vi.fn();

// Mock AWS SDK ONCE with proper structure for import * as AWS
vi.mock('aws-sdk', () => {
  return {
    default: {
      CognitoIdentityServiceProvider: vi.fn(function() {
        return {
          adminAddUserToGroup: mockAdminAddUserToGroup,
          adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
          adminDeleteUser: mockAdminDeleteUser,
        };
      }),
      DynamoDB: {
        DocumentClient: vi.fn(function() {
          return {
            scan: mockScan,
            get: mockGet,
            update: mockUpdate,
            put: mockPut,
            delete: mockDelete,
          };
        })
      },
      SES: vi.fn(function() {
        return {};
      })
    },
    CognitoIdentityServiceProvider: vi.fn(function() {
      return {
        adminAddUserToGroup: mockAdminAddUserToGroup,
        adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
        adminDeleteUser: mockAdminDeleteUser,
      };
    }),
    DynamoDB: {
      DocumentClient: vi.fn(function() {
        return {
          scan: mockScan,
          get: mockGet,
          update: mockUpdate,
          put: mockPut,
          delete: mockDelete,
        };
      })
    },
    SES: vi.fn(function() {
      return {};
    })
  };
});

// ✅ Mock the auth guards
vi.mock('../../guards/auth.guard', () => ({
  VerifyUserGuard: vi.fn(class MockVerifyUserGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
  VerifyAdminRoleGuard: vi.fn(class MockVerifyAdminRoleGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
  VerifyAdminOrEmployeeRoleGuard: vi.fn(class MockVerifyAdminOrEmployeeRoleGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  })
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

    // Setup DynamoDB mocks to return chainable objects with .promise()
    mockScan.mockReturnValue({ promise: mockPromise });
    mockGet.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });

    // Setup Cognito mocks to return chainable objects with .promise()
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockPromise });
    mockAdminRemoveUserFromGroup.mockReturnValue({ promise: mockPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockPromise });
    
    // Reset promise mocks to default resolved state
    mockPromise.mockResolvedValue({});

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