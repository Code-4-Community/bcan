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

// Mock S3 functions
const mockS3Upload = vi.fn();

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
      }),
      S3: vi.fn(function() {
        return {
          upload: mockS3Upload,
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
    }),
    S3: vi.fn(function() {
      return {
        upload: mockS3Upload,
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
  
  scan: (params: any) => {
    let filteredUsers = [...mockDatabase.users];
    
    if (params.FilterExpression) {
      if (params.FilterExpression.includes('(:inactive)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Inactive');
      }
      else if (params.FilterExpression.includes('(:admin, :employee)')) {
        filteredUsers = filteredUsers.filter(u => u.position === 'Admin' || u.position === 'Employee');
      }
    }
    
    return { Items: filteredUsers };
  },
  
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
    process.env.PROFILE_PICTURE_BUCKET = 'test-profile-pics-bucket';
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup DynamoDB mocks
    mockScan.mockReturnValue({ promise: mockPromise });
    mockGet.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });

    // Setup Cognito mocks
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockPromise });
    mockAdminRemoveUserFromGroup.mockReturnValue({ promise: mockPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockPromise });
    
    // Setup SES mocks
    mockSendEmail.mockReturnValue({ promise: mockPromise });
    
    // Setup S3 mocks
    mockS3Upload.mockReturnValue({ promise: mockPromise });
    
    // Reset promise mocks to default resolved state
    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  // ========================================
  // Tests for uploadProfilePic
  // ========================================

  describe('uploadProfilePic', () => {
    const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
      fieldname: 'profilePic',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('fake-image-data'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
      ...overrides,
    });

    it('should successfully upload profile picture', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      // Mock S3 upload success
      mockPromise.mockResolvedValueOnce({
        Location: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        Key: 'emp1-profilepic.jpg',
        Bucket: 'test-profile-pics-bucket',
      });

      // Mock DynamoDB update success
      mockPromise.mockResolvedValueOnce({
        Attributes: {
          ...user,
          profilePictureUrl: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        },
      });

      const result = await userService.uploadProfilePic(user, mockFile);

      expect(result.profilePictureUrl).toBe('https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg');
      expect(mockS3Upload).toHaveBeenCalledWith({
        Bucket: 'test-profile-pics-bucket',
        Key: 'emp1-profilepic.jpg',
        Body: mockFile.buffer,
        ContentType: 'image/jpeg',
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { userId: 'emp1' },
        UpdateExpression: 'SET profilePictureUrl = :url',
        ExpressionAttributeValues: {
          ':url': 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        },
        ReturnValues: 'ALL_NEW',
      });
    });

    it('should generate correct filename with different extensions', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile({ originalname: 'test.png', mimetype: 'image/png' });

      mockPromise.mockResolvedValueOnce({
        Location: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.png',
        Key: 'emp1-profilepic.png',
      });
      mockPromise.mockResolvedValueOnce({
        Attributes: { ...user, profilePictureUrl: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.png' },
      });

      await userService.uploadProfilePic(user, mockFile);

      expect(mockS3Upload).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: 'emp1-profilepic.png',
        })
      );
    });

    it('should throw BadRequestException when user object is invalid', async () => {
      const mockFile = createMockFile();

      await expect(
        userService.uploadProfilePic(null as any, mockFile)
      ).rejects.toThrow('Valid user object is required');

      await expect(
        userService.uploadProfilePic({ userId: '' } as any, mockFile)
      ).rejects.toThrow('Valid user object is required');
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;

      await expect(
        userService.uploadProfilePic(user, null as any)
      ).rejects.toThrow('Valid image file is required');

      await expect(
        userService.uploadProfilePic(user, { buffer: null } as any)
      ).rejects.toThrow('Valid image file is required');
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile({ mimetype: 'application/pdf' });

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Invalid file type');
    });

    it('should throw BadRequestException for file too large', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile({ size: 10 * 1024 * 1024 }); // 10MB

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('File too large');
    });

    it('should accept all allowed image types', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      for (const mimetype of allowedTypes) {
        vi.clearAllMocks();
        mockS3Upload.mockReturnValue({ promise: mockPromise });
        mockPromise.mockResolvedValueOnce({ Location: 'https://test.com/image', Key: 'key' });
        mockPromise.mockResolvedValueOnce({ Attributes: user });

        const mockFile = createMockFile({ mimetype });
        await expect(userService.uploadProfilePic(user, mockFile)).resolves.toBeDefined();
      }
    });

    it('should handle S3 NoSuchBucket error', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      const s3Error = { code: 'NoSuchBucket', message: 'Bucket does not exist' };
      mockPromise.mockRejectedValueOnce(s3Error);

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Storage bucket not found');
    });

    it('should handle S3 AccessDenied error', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      const s3Error = { code: 'AccessDenied', message: 'Access denied' };
      mockPromise.mockRejectedValueOnce(s3Error);

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Insufficient permissions to upload file');
    });

    it('should handle DynamoDB update failure', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      // S3 upload succeeds
      mockPromise.mockResolvedValueOnce({
        Location: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        Key: 'emp1-profilepic.jpg',
      });

      // DynamoDB update fails
      const dynamoError = { code: 'ResourceNotFoundException', message: 'Table not found' };
      mockPromise.mockRejectedValueOnce(dynamoError);

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Database table not found');
    });

    it('should handle DynamoDB ValidationException', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      // S3 upload succeeds
      mockPromise.mockResolvedValueOnce({
        Location: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        Key: 'emp1-profilepic.jpg',
      });

      // DynamoDB update fails with ValidationException
      const dynamoError = { code: 'ValidationException', message: 'Invalid parameters' };
      mockPromise.mockRejectedValueOnce(dynamoError);

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Invalid update parameters');
    });

    it('should throw InternalServerErrorException when DynamoDB does not return attributes', async () => {
      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      // S3 upload succeeds
      mockPromise.mockResolvedValueOnce({
        Location: 'https://test-profile-pics-bucket.s3.amazonaws.com/emp1-profilepic.jpg',
        Key: 'emp1-profilepic.jpg',
      });

      // DynamoDB update succeeds but doesn't return Attributes
      mockPromise.mockResolvedValueOnce({});

      await expect(
        userService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Failed to retrieve updated user data');
    });

    it('should throw InternalServerErrorException when bucket env var is not set', async () => {
      const originalBucket = process.env.PROFILE_PICTURE_BUCKET;
      delete process.env.PROFILE_PICTURE_BUCKET;

      // Create a new service instance to pick up the env change
      const module: TestingModule = await Test.createTestingModule({
        providers: [UserService],
      }).compile();
      const testService = module.get<UserService>(UserService);

      const user = mockDatabase.users.find(u => u.userId === 'emp1')!;
      const mockFile = createMockFile();

      await expect(
        testService.uploadProfilePic(user, mockFile)
      ).rejects.toThrow('Server configuration error');

      // Restore env var
      process.env.PROFILE_PICTURE_BUCKET = originalBucket;
    });
  });

  // ========================================
  // Existing tests...
  // ========================================

  it('should get all users from mock database', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.scan({ TableName: 'test-users-table' }));
    const result = await userService.getAllUsers();
    expect(result).toHaveLength(9);
    expect(mockScan).toHaveBeenCalledWith({ TableName: 'test-users-table' });
  });

  // ... (rest of your existing tests remain the same)
});