import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../../../../middle-layer/types/User';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';

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

// Mock SES functions
const mockSendEmail = vi.fn();

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
        return {
          sendEmail: mockSendEmail,
        };
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
      return {
        sendEmail: mockSendEmail,
      };
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

// 🗄️ Mock Database with test data
// This simulates a DynamoDB table with realistic test data
// Contains: 2 Admins, 3 Employees, 4 Inactive users (9 total)
const mockDatabase = {
  users: [
    { userId: 'admin1', email: 'admin1@example.com', position: UserStatus.Admin },
    { userId: 'admin2', email: 'admin2@example.com', position: UserStatus.Admin },
    { userId: 'emp1', email: 'emp1@example.com', position: UserStatus.Employee },
    { userId: 'emp2', email: 'emp2@example.com', position: UserStatus.Employee },
    { userId: 'emp3', email: 'emp3@example.com', position: UserStatus.Employee },
    { userId: 'inactive1', email: 'inactive1@example.com', position: UserStatus.Inactive },
    { userId: 'inactive2', email: 'inactive2@example.com', position: UserStatus.Inactive },
    { userId: 'inactive3', email: 'inactive3@example.com', position: UserStatus.Inactive },
    { userId: 'inactive4', email: 'inactive4@example.com', position: UserStatus.Inactive },
  ] as User[],
  
  // Helper function to simulate DynamoDB scan with FilterExpression
  scan: (params: any) => {
    let filteredUsers = [...mockDatabase.users];
    
    if (params.FilterExpression) {
      // Handle FilterExpression for inactive users: #pos IN (:inactive)
      if (params.FilterExpression.includes('(:inactive)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Inactive');
      }
      // Handle FilterExpression for active users: #pos IN (:admin, :employee)
      else if (params.FilterExpression.includes('(:admin, :employee)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Admin' || u.position === 'Employee');
      }
    }
    
    return { Items: filteredUsers };
  },
  
  // Helper function to simulate DynamoDB get operation
  get: (params: any) => {
    const userId = params.Key.userId;
    const user = mockDatabase.users.find(u => u.userId === userId);
    return user ? { Item: user } : {};
  }
};

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
    
    // Setup SES mocks to return chainable objects with .promise()
    mockSendEmail.mockReturnValue({ promise: mockPromise });
    
    // Reset promise mocks to default resolved state
    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should get all users from mock database', async () => {
    // Setup the mock response using our mock database
    mockPromise.mockResolvedValueOnce(mockDatabase.scan({ TableName: 'test-users-table' }));

    const result = await userService.getAllUsers();
    
    expect(result).toHaveLength(9); // All 9 users in mock database
    expect(mockScan).toHaveBeenCalledWith({
      TableName: 'test-users-table'
    });
  });

  it('should get user by id from mock database', async () => {
    // Setup the mock response using our mock database
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { userId: 'admin1' } }));

    const result = await userService.getUserById('admin1');
    
    expect(result.userId).toBe('admin1');
    expect(result.position).toBe('Admin');
    expect(result.email).toBe('admin1@example.com');
    expect(mockGet).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Key: { userId: 'admin1' }
    });
  });

  it('should throw BadRequestException when userId is invalid', async () => {
    await expect(userService.getUserById('')).rejects.toThrow('Valid user ID is required');
    await expect(userService.getUserById(null as any)).rejects.toThrow('Valid user ID is required');
    await expect(userService.getUserById('   ')).rejects.toThrow('Valid user ID is required');
  });

  it('should throw NotFoundException when user does not exist in mock database', async () => {
    // Mock empty response (user not found) using mock database
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { userId: 'nonexistent' } }));

    await expect(userService.getUserById('nonexistent')).rejects.toThrow("User 'nonexistent' does not exist");
    expect(mockGet).toHaveBeenCalled();
  });

  it('should handle errors when getting all users', async () => {
    // Mock an error with AWS error structure
    const awsError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllUsers()).rejects.toThrow('Database table not found');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle generic DynamoDB errors when getting all users', async () => {
    // Mock a generic error
    const awsError = { code: 'UnknownError', message: 'Unknown DynamoDB error' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllUsers()).rejects.toThrow('Could not retrieve users');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle errors when getting user by id', async () => {
    // Mock an AWS error with specific error code
    const awsError = { code: 'ValidationException', message: 'Invalid request' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getUserById('1')).rejects.toThrow('Invalid request: Invalid request');
    expect(mockGet).toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundException when getting user by id', async () => {
    // Mock a ResourceNotFoundException
    const awsError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getUserById('1')).rejects.toThrow('Database table not found');
    expect(mockGet).toHaveBeenCalled();
  });

  it('should get all inactive users from mock database', async () => {
    // Setup the mock response using our mock database with filter
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:inactive)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':inactive': 'Inactive' }
    };
    
    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));

    const result = await userService.getAllInactiveUsers();
    
    // Should return exactly 4 inactive users from mock database
    expect(result).toHaveLength(4);
    expect(result.every(u => u.position === 'Inactive')).toBe(true);
    expect(result.map(u => u.userId).sort()).toEqual(['inactive1', 'inactive2', 'inactive3', 'inactive4']);
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should handle errors when getting inactive users', async () => {
    const awsError = { code: 'ValidationException', message: 'Invalid filter' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllInactiveUsers()).rejects.toThrow('Invalid filter expression');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should get all active users from mock database', async () => {
    // Setup the mock response using our mock database with filter
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:admin, :employee)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':admin': 'Admin', ':employee': 'Employee' }
    };
    
    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));

    const result = await userService.getAllActiveUsers();
    
    // Should return exactly 5 active users (2 admins + 3 employees) from mock database
    expect(result).toHaveLength(5);
    expect(result.every(u => u.position === 'Admin' || u.position === 'Employee')).toBe(true);
    
    const admins = result.filter(u => u.position === 'Admin');
    const employees = result.filter(u => u.position === 'Employee');
    expect(admins).toHaveLength(2);
    expect(employees).toHaveLength(3);
    
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should throw NotFoundException when no active users found', async () => {
    // Mock empty response
    mockPromise.mockResolvedValueOnce({ Items: undefined });

    await expect(userService.getAllActiveUsers()).rejects.toThrow('No active users found.');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle ProvisionedThroughputExceededException', async () => {
    const awsError = { code: 'ProvisionedThroughputExceededException', message: 'Throughput exceeded' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllActiveUsers()).rejects.toThrow('Database is temporarily unavailable, please try again');
    expect(mockScan).toHaveBeenCalled();
  });

  // ========================================
  // Tests for addUserToGroup (Change Role)
  // ========================================

  it('should successfully change user role from Inactive to Employee', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'inactive1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get to verify user exists
    mockPromise.mockResolvedValueOnce({ Item: user });
    
    // Mock Cognito remove from old group (no-op for Inactive)
    mockPromise.mockResolvedValueOnce({});
    
    // Mock Cognito add to new group
    mockPromise.mockResolvedValueOnce({});
    
    // Mock SES sendEmail (verification email for Inactive -> Employee)
    mockPromise.mockResolvedValueOnce({ MessageId: 'test-message-id' });
    
    // Mock DynamoDB update
    mockPromise.mockResolvedValueOnce({
      Attributes: { ...user, position: UserStatus.Employee }
    });

    const result = await userService.addUserToGroup(user, UserStatus.Employee, admin);
    
    expect(result.position).toBe(UserStatus.Employee);
    expect(mockGet).toHaveBeenCalled();
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
      GroupName: 'Employee',
      UserPoolId: 'test-pool-id',
      Username: 'inactive1'
    });
    expect(mockSendEmail).toHaveBeenCalled(); // Verify email was sent
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should successfully promote Employee to Admin', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: user });
    
    // Mock Cognito remove from Employee group
    mockPromise.mockResolvedValueOnce({});
    
    // Mock Cognito add to Admin group
    mockPromise.mockResolvedValueOnce({});
    
    // Mock DynamoDB update
    mockPromise.mockResolvedValueOnce({
      Attributes: { ...user, position: UserStatus.Admin }
    });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, admin);
    
    expect(result.position).toBe(UserStatus.Admin);
    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledWith({
      GroupName: 'Employee',
      UserPoolId: 'test-pool-id',
      Username: 'emp1'
    });
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
      GroupName: 'Admin',
      UserPoolId: 'test-pool-id',
      Username: 'emp1'
    });
  });

  it('should return user unchanged if already in requested group', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'admin1')!;
    const requestedBy = mockDatabase.users.find(u => u.userId === 'admin2')!;
    
    // Mock DynamoDB get - user already Admin
    mockPromise.mockResolvedValueOnce({ Item: user });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, requestedBy);
    
    expect(result.position).toBe(UserStatus.Admin);
    // Should not call Cognito if already in group
    expect(mockAdminAddUserToGroup).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when user object is invalid', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    await expect(
      userService.addUserToGroup(null as any, UserStatus.Employee, admin)
    ).rejects.toThrow('Valid user object is required');
    
    await expect(
      userService.addUserToGroup({ userId: '' } as any, UserStatus.Employee, admin)
    ).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException when group name is invalid', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'inactive1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    await expect(
      userService.addUserToGroup(user, '' as any, admin)
    ).rejects.toThrow('Group name is required');
    
    await expect(
      userService.addUserToGroup(user, 'InvalidGroup' as any, admin)
    ).rejects.toThrow('Invalid group name');
  });

  it('should throw UnauthorizedException when non-admin tries to change role', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'inactive1')!;
    const employee = mockDatabase.users.find(u => u.userId === 'emp1')!;
    
    await expect(
      userService.addUserToGroup(user, UserStatus.Employee, employee)
    ).rejects.toThrow('Only administrators can modify user groups');
  });

  it('should throw BadRequestException when admin tries to demote themselves', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: admin });
    
    await expect(
      userService.addUserToGroup(admin, UserStatus.Employee, admin)
    ).rejects.toThrow('Administrators cannot demote themselves');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    const fakeUser: User = { userId: 'nonexistent', email: 'fake@test.com', position: UserStatus.Inactive };
    
    // Mock DynamoDB get - user not found
    mockPromise.mockResolvedValueOnce({});
    
    await expect(
      userService.addUserToGroup(fakeUser, UserStatus.Employee, admin)
    ).rejects.toThrow("User 'nonexistent' does not exist");
  });

  it('should handle Cognito UserNotFoundException', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'inactive1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: user });
    
    // Mock Cognito remove from old group (no-op for Inactive, but still called)
    mockPromise.mockResolvedValueOnce({});
    
    // Mock Cognito add to new group - this should fail
    const cognitoError = { code: 'UserNotFoundException', message: 'User not found in Cognito' };
    mockPromise.mockRejectedValueOnce(cognitoError);
    
    await expect(
      userService.addUserToGroup(user, UserStatus.Employee, admin)
    ).rejects.toThrow('not found in authentication system');
  });

  it('should rollback Cognito change if DynamoDB update fails', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: user });
    
    // Mock Cognito operations succeed
    mockPromise.mockResolvedValueOnce({}); // Remove from old group
    mockPromise.mockResolvedValueOnce({}); // Add to new group
    
    // Mock DynamoDB update fails
    const dynamoError = { code: 'ValidationException', message: 'Invalid update' };
    mockPromise.mockRejectedValueOnce(dynamoError);
    
    // Mock rollback operations
    mockPromise.mockResolvedValueOnce({}); // Remove from new group
    mockPromise.mockResolvedValueOnce({}); // Add back to old group
    
    await expect(
      userService.addUserToGroup(user, UserStatus.Admin, admin)
    ).rejects.toThrow('Invalid update parameters');
    
    // Verify rollback was attempted
    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledTimes(2); // Once for change, once for rollback
    expect(mockAdminAddUserToGroup).toHaveBeenCalledTimes(2); // Once for change, once for rollback
  });

  // ========================================
  // Tests for deleteUser
  // ========================================

  it('should successfully delete a user', async () => {
    const userToDelete = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get to verify user exists
    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    
    // Mock DynamoDB delete
    mockPromise.mockResolvedValueOnce({
      Attributes: userToDelete
    });
    
    // Mock Cognito delete
    mockPromise.mockResolvedValueOnce({});

    const result = await userService.deleteUser(userToDelete, admin);
    
    expect(result.userId).toBe('emp1');
    expect(mockGet).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Key: { userId: 'emp1' },
      ReturnValues: 'ALL_OLD'
    });
    expect(mockAdminDeleteUser).toHaveBeenCalledWith({
      UserPoolId: 'test-pool-id',
      Username: 'emp1'
    });
  });

  it('should throw BadRequestException when user object is invalid', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    await expect(
      userService.deleteUser(null as any, admin)
    ).rejects.toThrow('Valid user object is required');
    
    await expect(
      userService.deleteUser({ userId: '' } as any, admin)
    ).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException when requestedBy is invalid', async () => {
    const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
    
    await expect(
      userService.deleteUser(user, null as any)
    ).rejects.toThrow('Valid requesting user is required');
  });

  it('should throw UnauthorizedException when non-admin tries to delete', async () => {
    const userToDelete = mockDatabase.users.find(u => u.userId === 'emp2')!;
    const employee = mockDatabase.users.find(u => u.userId === 'emp1')!;
    
    await expect(
      userService.deleteUser(userToDelete, employee)
    ).rejects.toThrow('Only administrators can delete users');
  });

  it('should throw BadRequestException when admin tries to delete themselves', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    await expect(
      userService.deleteUser(admin, admin)
    ).rejects.toThrow('Administrators cannot delete their own account');
  });

  it('should throw NotFoundException when user to delete does not exist', async () => {
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    const fakeUser: User = { userId: 'nonexistent', email: 'fake@test.com', position: UserStatus.Employee };
    
    // Mock DynamoDB get - user not found
    mockPromise.mockResolvedValueOnce({});
    
    await expect(
      userService.deleteUser(fakeUser, admin)
    ).rejects.toThrow("User 'nonexistent' does not exist");
  });

  it('should handle Cognito UserNotFoundException during delete', async () => {
    const userToDelete = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    
    // Mock DynamoDB delete succeeds
    mockPromise.mockResolvedValueOnce({ Attributes: userToDelete });
    
    // Mock Cognito delete fails
    const cognitoError = { code: 'UserNotFoundException', message: 'User not found' };
    mockPromise.mockRejectedValueOnce(cognitoError);
    
    // Mock rollback (restore to DynamoDB)
    mockPromise.mockResolvedValueOnce({});
    
    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('not found in authentication system');
    
    // Verify rollback was attempted
    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Item: userToDelete
    });
  });

  it('should rollback DynamoDB delete if Cognito delete fails', async () => {
    const userToDelete = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    
    // Mock DynamoDB delete succeeds
    mockPromise.mockResolvedValueOnce({ Attributes: userToDelete });
    
    // Mock Cognito delete fails with generic error
    const cognitoError = { code: 'InternalError', message: 'Cognito internal error' };
    mockPromise.mockRejectedValueOnce(cognitoError);
    
    // Mock rollback succeeds
    mockPromise.mockResolvedValueOnce({});
    
    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('Failed to delete user from authentication system');
    
    // Verify rollback was attempted
    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Item: userToDelete
    });
  });

  it('should handle DynamoDB delete failure', async () => {
    const userToDelete = mockDatabase.users.find(u => u.userId === 'emp1')!;
    const admin = mockDatabase.users.find(u => u.userId === 'admin1')!;
    
    // Mock DynamoDB get
    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    
    // Mock DynamoDB delete fails
    const dynamoError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(dynamoError);
    
    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('Failed to delete user from database');
    
    // Cognito delete should not be called if DynamoDB fails
    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
  });
});