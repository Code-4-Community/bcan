import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../../../../middle-layer/types/User';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';
import * as AWS from 'aws-sdk';
import { VerifyUserGuard, VerifyAdminRoleGuard, VerifyAdminOrEmployeeRoleGuard } from '../../guards/auth.guard';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

const mockScan = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPromise = vi.fn();

const mockAdminAddUserToGroup = vi.fn();
const mockAdminRemoveUserFromGroup = vi.fn();
const mockAdminDeleteUser = vi.fn();
const mockSendEmail = vi.fn();

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
          return { scan: mockScan, get: mockGet, update: mockUpdate, put: mockPut, delete: mockDelete };
        })
      },
      SES: vi.fn(function() {
        return { sendEmail: mockSendEmail };
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
        return { scan: mockScan, get: mockGet, update: mockUpdate, put: mockPut, delete: mockDelete };
      })
    },
    SES: vi.fn(function() {
      return { sendEmail: mockSendEmail };
    })
  };
});

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

// Mock database now keyed by email since that's the partition key
const mockDatabase = {
  users: [
    { email: 'admin1@example.com', position: UserStatus.Admin, firstName: 'Admin', lastName: 'One' },
    { email: 'admin2@example.com', position: UserStatus.Admin, firstName: 'Admin', lastName: 'Two' },
    { email: 'emp1@example.com', position: UserStatus.Employee, firstName: 'Emp', lastName: 'One' },
    { email: 'emp2@example.com', position: UserStatus.Employee, firstName: 'Emp', lastName: 'Two' },
    { email: 'emp3@example.com', position: UserStatus.Employee, firstName: 'Emp', lastName: 'Three' },
    { email: 'inactive1@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'One' },
    { email: 'inactive2@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Two' },
    { email: 'inactive3@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Three' },
    { email: 'inactive4@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Four' },
  ] as User[],

  scan: (params: any) => {
    let filteredUsers = [...mockDatabase.users];
    if (params.FilterExpression) {
      if (params.FilterExpression.includes('(:inactive)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Inactive');
      } else if (params.FilterExpression.includes('(:admin, :employee)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Admin' || u.position === 'Employee');
      }
    }
    return { Items: filteredUsers };
  },

  // Now looks up by email instead of userId
  get: (params: any) => {
    const email = params.Key.email;
    const user = mockDatabase.users.find(u => u.email === email);
    return user ? { Item: user } : {};
  }
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeAll(() => {
    process.env.DYNAMODB_USER_TABLE_NAME = 'test-users-table';
    process.env.COGNITO_USER_POOL_ID = 'test-pool-id';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    mockScan.mockReturnValue({ promise: mockPromise });
    mockGet.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockPromise });
    mockAdminRemoveUserFromGroup.mockReturnValue({ promise: mockPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockPromise });
    mockSendEmail.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should get all users from mock database', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.scan({ TableName: 'test-users-table' }));

    const result = await userService.getAllUsers();

    expect(result).toHaveLength(9);
    expect(mockScan).toHaveBeenCalledWith({ TableName: 'test-users-table' });
  });

  // getUserById is now getUserByEmail in the service
  it('should get user by email from mock database', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { email: 'admin1@example.com' } }));

    const result = await userService.getUserByEmail('admin1@example.com');

    expect(result.email).toBe('admin1@example.com');
    expect(result.position).toBe('Admin');
    expect(mockGet).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Key: { email: 'admin1@example.com' }
    });
  });

  it('should throw BadRequestException when email is invalid', async () => {
    await expect(userService.getUserByEmail('')).rejects.toThrow('Valid user email is required');
    await expect(userService.getUserByEmail(null as any)).rejects.toThrow('Valid user email is required');
    await expect(userService.getUserByEmail('   ')).rejects.toThrow('Valid user email is required');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { email: 'nonexistent@example.com' } }));

    await expect(userService.getUserByEmail('nonexistent@example.com')).rejects.toThrow("User 'nonexistent@example.com' does not exist");
    expect(mockGet).toHaveBeenCalled();
  });

  it('should handle errors when getting all users', async () => {
    const awsError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllUsers()).rejects.toThrow('Database table not found');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle generic DynamoDB errors when getting all users', async () => {
    const awsError = { code: 'UnknownError', message: 'Unknown DynamoDB error' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllUsers()).rejects.toThrow('Could not retrieve users');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should handle errors when getting user by email', async () => {
    const awsError = { code: 'ValidationException', message: 'Invalid request' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getUserByEmail('user@example.com')).rejects.toThrow('Invalid request: Invalid request');
    expect(mockGet).toHaveBeenCalled();
  });

  it('should handle ResourceNotFoundException when getting user by email', async () => {
    const awsError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getUserByEmail('user@example.com')).rejects.toThrow('Database table not found');
    expect(mockGet).toHaveBeenCalled();
  });

  it('should get all inactive users from mock database', async () => {
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:inactive)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':inactive': 'Inactive' }
    };

    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));

    const result = await userService.getAllInactiveUsers();

    expect(result).toHaveLength(4);
    expect(result.every((u: User) => u.position === 'Inactive')).toBe(true);
    expect(result.map((u: User) => u.email).sort()).toEqual([
      'inactive1@example.com',
      'inactive2@example.com',
      'inactive3@example.com',
      'inactive4@example.com'
    ]);
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should handle errors when getting inactive users', async () => {
    const awsError = { code: 'ValidationException', message: 'Invalid filter' };
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(userService.getAllInactiveUsers()).rejects.toThrow('Invalid filter expression');
    expect(mockScan).toHaveBeenCalled();
  });

  it('should get all active users from mock database', async () => {
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:admin, :employee)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':admin': 'Admin', ':employee': 'Employee' }
    };

    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));

    const result = await userService.getAllActiveUsers();

    expect(result).toHaveLength(5);
    expect(result.every((u: User) => u.position === 'Admin' || u.position === 'Employee')).toBe(true);
    expect(result.filter((u: User) => u.position === 'Admin')).toHaveLength(2);
    expect(result.filter((u: User) => u.position === 'Employee')).toHaveLength(3);
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should throw NotFoundException when no active users found', async () => {
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
    const user = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });       // DynamoDB get
    mockPromise.mockResolvedValueOnce({});                   // Cognito remove from old group
    mockPromise.mockResolvedValueOnce({});                   // Cognito add to new group
    mockPromise.mockResolvedValueOnce({ MessageId: 'test' }); // SES sendEmail
    mockPromise.mockResolvedValueOnce({
      Attributes: { ...user, position: UserStatus.Employee }
    });                                                       // DynamoDB update

    const result = await userService.addUserToGroup(user, UserStatus.Employee, admin);

    expect(result.position).toBe(UserStatus.Employee);
    expect(mockGet).toHaveBeenCalled();
    // Cognito calls now use email as Username
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
      GroupName: 'Employee',
      UserPoolId: 'test-pool-id',
      Username: 'inactive1@example.com'
    });
    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should successfully promote Employee to Admin', async () => {
    const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });
    mockPromise.mockResolvedValueOnce({});  // Remove from Employee
    mockPromise.mockResolvedValueOnce({});  // Add to Admin
    mockPromise.mockResolvedValueOnce({ Attributes: { ...user, position: UserStatus.Admin } });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, admin);

    expect(result.position).toBe(UserStatus.Admin);
    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledWith({
      GroupName: 'Employee',
      UserPoolId: 'test-pool-id',
      Username: 'emp1@example.com'
    });
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
      GroupName: 'Admin',
      UserPoolId: 'test-pool-id',
      Username: 'emp1@example.com'
    });
  });

  it('should return user unchanged if already in requested group', async () => {
    const user = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    const requestedBy = mockDatabase.users.find(u => u.email === 'admin2@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, requestedBy);

    expect(result.position).toBe(UserStatus.Admin);
    expect(mockAdminAddUserToGroup).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when user object is invalid', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    await expect(
      userService.addUserToGroup(null as any, UserStatus.Employee, admin)
    ).rejects.toThrow('Valid user object is required');

    await expect(
      userService.addUserToGroup({ email: '' } as any, UserStatus.Employee, admin)
    ).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException when group name is invalid', async () => {
    const user = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    await expect(
      userService.addUserToGroup(user, '' as any, admin)
    ).rejects.toThrow('Group name is required');

    await expect(
      userService.addUserToGroup(user, 'InvalidGroup' as any, admin)
    ).rejects.toThrow('Invalid group name');
  });

  it('should throw UnauthorizedException when non-admin tries to change role', async () => {
    const user = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const employee = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;

    await expect(
      userService.addUserToGroup(user, UserStatus.Employee, employee)
    ).rejects.toThrow('Only administrators can modify user groups');
  });

  it('should throw BadRequestException when admin tries to demote themselves', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: admin });

    await expect(
      userService.addUserToGroup(admin, UserStatus.Employee, admin)
    ).rejects.toThrow('Administrators cannot demote themselves');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com') as User;
    const fakeUser: User = { email: 'fake@test.com', position: UserStatus.Inactive, firstName: '', lastName: '' };

    mockPromise.mockResolvedValueOnce({});

    await expect(
      userService.addUserToGroup(fakeUser, UserStatus.Employee, admin)
    ).rejects.toThrow("User 'fake@test.com' does not exist");
  });

  it('should handle Cognito UserNotFoundException', async () => {
    const user = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });
    mockPromise.mockResolvedValueOnce({});  // Remove from old group
    const cognitoError = { code: 'UserNotFoundException', message: 'User not found in Cognito' };
    mockPromise.mockRejectedValueOnce(cognitoError);

    await expect(
      userService.addUserToGroup(user, UserStatus.Employee, admin)
    ).rejects.toThrow('not found in authentication system');
  });

  it('should rollback Cognito change if DynamoDB update fails', async () => {
    const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });
    mockPromise.mockResolvedValueOnce({});  // Remove from old group
    mockPromise.mockResolvedValueOnce({});  // Add to new group
    const dynamoError = { code: 'ValidationException', message: 'Invalid update' };
    mockPromise.mockRejectedValueOnce(dynamoError);
    mockPromise.mockResolvedValueOnce({});  // Rollback: remove from new group
    mockPromise.mockResolvedValueOnce({});  // Rollback: add back to old group

    await expect(
      userService.addUserToGroup(user, UserStatus.Admin, admin)
    ).rejects.toThrow('Invalid update parameters');

    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledTimes(2);
    expect(mockAdminAddUserToGroup).toHaveBeenCalledTimes(2);
  });

  // ========================================
  // Tests for deleteUser
  // ========================================

  it('should successfully delete a user', async () => {
    const userToDelete = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: userToDelete });       // DynamoDB get
    mockPromise.mockResolvedValueOnce({ Attributes: userToDelete }); // DynamoDB delete
    mockPromise.mockResolvedValueOnce({});                           // Cognito delete

    const result = await userService.deleteUser(userToDelete, admin);

    expect(result.email).toBe('emp1@example.com');
    expect(mockGet).toHaveBeenCalled();
    // DynamoDB key is now email
    expect(mockDelete).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Key: { email: 'emp1@example.com' },
      ReturnValues: 'ALL_OLD'
    });
    // Cognito Username is now email
    expect(mockAdminDeleteUser).toHaveBeenCalledWith({
      UserPoolId: 'test-pool-id',
      Username: 'emp1@example.com'
    });
  });

  it('should throw BadRequestException when user object is invalid', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    await expect(
      userService.deleteUser(null as any, admin)
    ).rejects.toThrow('Valid user object is required');

    await expect(
      userService.deleteUser({ email: '' } as any, admin)
    ).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException when requestedBy is invalid', async () => {
    const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;

    await expect(
      userService.deleteUser(user, null as any)
    ).rejects.toThrow('Valid requesting user is required');
  });

  it('should throw UnauthorizedException when non-admin tries to delete', async () => {
    const userToDelete = mockDatabase.users.find(u => u.email === 'emp2@example.com')!;
    const employee = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;

    await expect(
      userService.deleteUser(userToDelete, employee)
    ).rejects.toThrow('Only administrators can delete users');
  });

  it('should throw BadRequestException when admin tries to delete themselves', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    await expect(
      userService.deleteUser(admin, admin)
    ).rejects.toThrow('Administrators cannot delete their own account');
  });

  it('should throw NotFoundException when user to delete does not exist', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com') as User;
    const fakeUser: User = { email: 'fake@test.com', position: UserStatus.Employee, firstName: '', lastName: '' };

    mockPromise.mockResolvedValueOnce({});

    await expect(
      userService.deleteUser(fakeUser, admin)
    ).rejects.toThrow("User 'fake@test.com' does not exist");
  });

  it('should handle Cognito UserNotFoundException during delete', async () => {
    const userToDelete = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    mockPromise.mockResolvedValueOnce({ Attributes: userToDelete });
    const cognitoError = { code: 'UserNotFoundException', message: 'User not found' };
    mockPromise.mockRejectedValueOnce(cognitoError);
    mockPromise.mockResolvedValueOnce({});  // Rollback restore

    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('not found in authentication system');

    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Item: userToDelete
    });
  });

  it('should rollback DynamoDB delete if Cognito delete fails', async () => {
    const userToDelete = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    mockPromise.mockResolvedValueOnce({ Attributes: userToDelete });
    const cognitoError = { code: 'InternalError', message: 'Cognito internal error' };
    mockPromise.mockRejectedValueOnce(cognitoError);
    mockPromise.mockResolvedValueOnce({});  // Rollback

    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('Failed to delete user from authentication system');

    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'test-users-table',
      Item: userToDelete
    });
  });

  it('should handle DynamoDB delete failure', async () => {
    const userToDelete = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: userToDelete });
    const dynamoError = { code: 'ResourceNotFoundException', message: 'Table not found' };
    mockPromise.mockRejectedValueOnce(dynamoError);

    await expect(
      userService.deleteUser(userToDelete, admin)
    ).rejects.toThrow('Failed to delete user from database');

    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
  });
});