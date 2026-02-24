import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../../../../middle-layer/types/User';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';
import { VerifyUserGuard, VerifyAdminRoleGuard, VerifyAdminOrEmployeeRoleGuard } from '../../guards/auth.guard';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Mock function declarations ───────────────────────────────────────────────
const mockPromise = vi.fn();

const mockScan   = vi.fn(() => ({ promise: mockPromise }));
const mockGet    = vi.fn(() => ({ promise: mockPromise }));
const mockUpdate = vi.fn(() => ({ promise: mockPromise }));
const mockPut    = vi.fn(() => ({ promise: mockPromise }));
const mockDelete = vi.fn(() => ({ promise: mockPromise }));

const mockAdminAddUserToGroup      = vi.fn(() => ({ promise: mockPromise }));
const mockAdminRemoveUserFromGroup = vi.fn(() => ({ promise: mockPromise }));
const mockAdminDeleteUser          = vi.fn(() => ({ promise: mockPromise }));
const mockSendEmail                = vi.fn(() => ({ promise: mockPromise }));
const mockS3Upload                 = vi.fn(() => ({ promise: mockPromise }));

// ─── AWS SDK mock ─────────────────────────────────────────────────────────────
vi.mock('aws-sdk', () => {
  const cognitoFactory = vi.fn(function () {
    return {
      adminAddUserToGroup:      mockAdminAddUserToGroup,
      adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
      adminDeleteUser:          mockAdminDeleteUser,
    };
  });

  const documentClientFactory = vi.fn(function () {
    return { scan: mockScan, get: mockGet, update: mockUpdate, put: mockPut, delete: mockDelete };
  });

  const sesFactory = vi.fn(function () {
    return { sendEmail: mockSendEmail };
  });

  const s3Factory = vi.fn(function () {
    return { upload: mockS3Upload };
  });

  const awsMock = {
    CognitoIdentityServiceProvider: cognitoFactory,
    DynamoDB: { DocumentClient: documentClientFactory },
    SES: sesFactory,
    S3: s3Factory,
  };

  return { ...awsMock, default: awsMock };
});

// ─── Auth guard mock ──────────────────────────────────────────────────────────
vi.mock('../../guards/auth.guard', () => ({
  VerifyUserGuard: vi.fn(class { canActivate = vi.fn().mockResolvedValue(true); }),
  VerifyAdminRoleGuard: vi.fn(class { canActivate = vi.fn().mockResolvedValue(true); }),
  VerifyAdminOrEmployeeRoleGuard: vi.fn(class { canActivate = vi.fn().mockResolvedValue(true); }),
}));

// ─── Mock database (email is now the partition key) ───────────────────────────
const mockDatabase = {
  users: [
    { email: 'admin1@example.com', position: UserStatus.Admin,    firstName: 'Admin',    lastName: 'One'   },
    { email: 'admin2@example.com', position: UserStatus.Admin,    firstName: 'Admin',    lastName: 'Two'   },
    { email: 'emp1@example.com',   position: UserStatus.Employee, firstName: 'Emp',      lastName: 'One'   },
    { email: 'emp2@example.com',   position: UserStatus.Employee, firstName: 'Emp',      lastName: 'Two'   },
    { email: 'emp3@example.com',   position: UserStatus.Employee, firstName: 'Emp',      lastName: 'Three' },
    { email: 'inactive1@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'One'   },
    { email: 'inactive2@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Two'   },
    { email: 'inactive3@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Three' },
    { email: 'inactive4@example.com', position: UserStatus.Inactive, firstName: 'Inactive', lastName: 'Four'  },
  ] as User[],

  scan(params: any) {
    let users = [...this.users];
    if (params.FilterExpression?.includes('(:inactive)')) {
      users = users.filter(u => u.position === UserStatus.Inactive);
    } else if (params.FilterExpression?.includes('(:admin, :employee)')) {
      users = users.filter(u => u.position === UserStatus.Admin || u.position === UserStatus.Employee);
    }
    return { Items: users };
  },

  get(params: any) {
    const user = this.users.find(u => u.email === params.Key.email);
    return user ? { Item: user } : {};
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
  fieldname: 'profilePic',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024 * 1024,
  buffer: Buffer.from('fake-image-data'),
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
  ...overrides,
});

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeAll(() => {
    process.env.DYNAMODB_USER_TABLE_NAME = 'test-users-table';
    process.env.COGNITO_USER_POOL_ID     = 'test-pool-id';
    process.env.PROFILE_PICTURE_BUCKET   = 'test-profile-pics-bucket';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    mockScan.mockReturnValue({ promise: mockPromise });
    mockGet.mockReturnValue({ promise: mockPromise });
    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockPromise });
    mockAdminRemoveUserFromGroup.mockReturnValue({ promise: mockPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockPromise });
    mockSendEmail.mockReturnValue({ promise: mockPromise });
    mockS3Upload.mockReturnValue({ promise: mockPromise });

    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller  = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  // ── uploadProfilePic ────────────────────────────────────────────────────────

  describe('uploadProfilePic', () => {
    it('should successfully upload profile picture', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      const file = createMockFile();
      // key format: firstName-lastName-firstThreeOfEmail-profilepic.ext
      const s3Url = 'https://test-profile-pics-bucket.s3.amazonaws.com/Emp-One-emp-profilepic.jpg';

      mockPromise
        .mockResolvedValueOnce({ Location: s3Url, Key: 'Emp-One-emp-profilepic.jpg', Bucket: 'test-profile-pics-bucket' })
        .mockResolvedValueOnce({ Attributes: { ...user, profilePicUrl: s3Url } });

      const result = await userService.uploadProfilePic(user, file);

      expect(result).toBe(s3Url);
      expect(mockS3Upload).toHaveBeenCalledWith({
        Bucket: 'test-profile-pics-bucket',
        Key: 'Emp-One-emp-profilepic.jpg',
        Body: file.buffer,
        ContentType: 'image/jpeg',
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { email: 'emp1@example.com' },
        UpdateExpression: 'SET profilePicUrl = :url',
        ExpressionAttributeValues: { ':url': s3Url },
        ReturnValues: 'ALL_NEW',
      });
    });

    it('should generate correct filename for non-jpg extensions', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      const file = createMockFile({ originalname: 'test.png', mimetype: 'image/png' });
      const s3Url = 'https://test-profile-pics-bucket.s3.amazonaws.com/Emp-One-emp-profilepic.png';

      mockPromise
        .mockResolvedValueOnce({ Location: s3Url, Key: 'Emp-One-emp-profilepic.png' })
        .mockResolvedValueOnce({ Attributes: { ...user, profilePicUrl: s3Url } });

      await userService.uploadProfilePic(user, file);

      expect(mockS3Upload).toHaveBeenCalledWith(
        expect.objectContaining({ Key: 'Emp-One-emp-profilepic.png' })
      );
    });

    it('should throw BadRequestException when user object is invalid', async () => {
      const file = createMockFile();
      await expect(userService.uploadProfilePic(null as any, file)).rejects.toThrow('Valid user object is required');
      await expect(userService.uploadProfilePic({ email: '' } as any, file)).rejects.toThrow('Valid user object is required');
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      await expect(userService.uploadProfilePic(user, null as any)).rejects.toThrow('Valid image file is required');
      await expect(userService.uploadProfilePic(user, { buffer: null } as any)).rejects.toThrow('Valid image file is required');
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      await expect(userService.uploadProfilePic(user, createMockFile({ mimetype: 'application/pdf' }))).rejects.toThrow('Invalid file type');
    });

    it('should throw BadRequestException for file too large', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      await expect(userService.uploadProfilePic(user, createMockFile({ size: 10 * 1024 * 1024 }))).rejects.toThrow('File too large');
    });

    it('should accept all allowed image types', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      const s3Url = 'https://test.com/image.jpg';

      for (const mimetype of ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']) {
        vi.clearAllMocks();
        mockS3Upload.mockReturnValue({ promise: mockPromise });
        mockUpdate.mockReturnValue({ promise: mockPromise });
        mockPromise
          .mockResolvedValueOnce({ Location: s3Url, Key: 'key', Bucket: 'test-profile-pics-bucket' })
          .mockResolvedValueOnce({ Attributes: { ...user, profilePicUrl: s3Url } });

        const result = await userService.uploadProfilePic(user, createMockFile({ mimetype }));
        expect(result).toBe(s3Url);
      }
    });

    it('should handle S3 NoSuchBucket error', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      mockPromise.mockRejectedValueOnce({ code: 'NoSuchBucket', message: 'Bucket does not exist' });
      await expect(userService.uploadProfilePic(user, createMockFile())).rejects.toThrow('Storage bucket not found');
    });

    it('should handle S3 AccessDenied error', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      mockPromise.mockRejectedValueOnce({ code: 'AccessDenied', message: 'Access denied' });
      await expect(userService.uploadProfilePic(user, createMockFile())).rejects.toThrow('Insufficient permissions to upload file');
    });

    it('should handle DynamoDB update failure after S3 upload succeeds', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      mockPromise
        .mockResolvedValueOnce({ Location: 'https://test.com/img.jpg', Key: 'key' })
        .mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found' });
      await expect(userService.uploadProfilePic(user, createMockFile())).rejects.toThrow('Database table not found');
    });

    it('should handle DynamoDB ValidationException', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      mockPromise
        .mockResolvedValueOnce({ Location: 'https://test.com/img.jpg', Key: 'key' })
        .mockRejectedValueOnce({ code: 'ValidationException', message: 'Invalid parameters' });
      await expect(userService.uploadProfilePic(user, createMockFile())).rejects.toThrow('Invalid update parameters');
    });

    it('should throw InternalServerErrorException when DynamoDB returns no Attributes', async () => {
      const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
      mockPromise
        .mockResolvedValueOnce({ Location: 'https://test.com/img.jpg', Key: 'key' })
        .mockResolvedValueOnce({});
      await expect(userService.uploadProfilePic(user, createMockFile())).rejects.toThrow('Failed to retrieve updated user data');
    });

    it('should throw InternalServerErrorException when bucket env var is not set', async () => {
      const original = process.env.PROFILE_PICTURE_BUCKET;
      delete process.env.PROFILE_PICTURE_BUCKET;

      const module = await Test.createTestingModule({ providers: [UserService] }).compile();
      const svc = module.get<UserService>(UserService);

      await expect(svc.uploadProfilePic(mockDatabase.users[2], createMockFile())).rejects.toThrow('Server configuration error');
      process.env.PROFILE_PICTURE_BUCKET = original;
    });
  });

  // ── getAllUsers ──────────────────────────────────────────────────────────────

  it('should get all users', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.scan({ TableName: 'test-users-table' }));
    const result = await userService.getAllUsers();
    expect(result).toHaveLength(9);
    expect(mockScan).toHaveBeenCalledWith({ TableName: 'test-users-table' });
  });

  it('should handle ResourceNotFoundException when getting all users', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found' });
    await expect(userService.getAllUsers()).rejects.toThrow('Database table not found');
  });

  it('should handle generic DynamoDB errors when getting all users', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'UnknownError', message: 'Unknown error' });
    await expect(userService.getAllUsers()).rejects.toThrow('Could not retrieve users');
  });

  // ── getUserByEmail ───────────────────────────────────────────────────────────

  it('should get user by email', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { email: 'admin1@example.com' } }));
    const result = await userService.getUserByEmail('admin1@example.com');
    expect(result.email).toBe('admin1@example.com');
    expect(result.position).toBe(UserStatus.Admin);
    expect(mockGet).toHaveBeenCalledWith({ TableName: 'test-users-table', Key: { email: 'admin1@example.com' } });
  });

  it('should throw BadRequestException for invalid email', async () => {
    await expect(userService.getUserByEmail('')).rejects.toThrow('Valid user email is required');
    await expect(userService.getUserByEmail(null as any)).rejects.toThrow('Valid user email is required');
    await expect(userService.getUserByEmail('   ')).rejects.toThrow('Valid user email is required');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockPromise.mockResolvedValueOnce(mockDatabase.get({ Key: { email: 'nonexistent@example.com' } }));
    await expect(userService.getUserByEmail('nonexistent@example.com')).rejects.toThrow("User 'nonexistent@example.com' does not exist");
  });

  it('should handle ValidationException when getting user by email', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'ValidationException', message: 'Invalid request' });
    await expect(userService.getUserByEmail('user@example.com')).rejects.toThrow('Invalid request: Invalid request');
  });

  it('should handle ResourceNotFoundException when getting user by email', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found' });
    await expect(userService.getUserByEmail('user@example.com')).rejects.toThrow('Database table not found');
  });

  // ── getAllInactiveUsers ──────────────────────────────────────────────────────

  it('should get all inactive users', async () => {
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:inactive)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':inactive': 'Inactive' },
    };
    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));
    const result = await userService.getAllInactiveUsers();
    expect(result).toHaveLength(4);
    expect(result.every((u: User) => u.position === UserStatus.Inactive)).toBe(true);
    expect(result.map((u: User) => u.email).sort()).toEqual([
      'inactive1@example.com', 'inactive2@example.com', 'inactive3@example.com', 'inactive4@example.com',
    ]);
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should handle ValidationException when getting inactive users', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'ValidationException', message: 'Invalid filter' });
    await expect(userService.getAllInactiveUsers()).rejects.toThrow('Invalid filter expression');
  });

  // ── getAllActiveUsers ────────────────────────────────────────────────────────

  it('should get all active users', async () => {
    const scanParams = {
      TableName: 'test-users-table',
      FilterExpression: '#pos IN (:admin, :employee)',
      ExpressionAttributeNames: { '#pos': 'position' },
      ExpressionAttributeValues: { ':admin': 'Admin', ':employee': 'Employee' },
    };
    mockPromise.mockResolvedValueOnce(mockDatabase.scan(scanParams));
    const result = await userService.getAllActiveUsers();
    expect(result).toHaveLength(5);
    expect(result.filter((u: User) => u.position === UserStatus.Admin)).toHaveLength(2);
    expect(result.filter((u: User) => u.position === UserStatus.Employee)).toHaveLength(3);
    expect(mockScan).toHaveBeenCalledWith(scanParams);
  });

  it('should throw NotFoundException when no active users found', async () => {
    mockPromise.mockResolvedValueOnce({ Items: undefined });
    await expect(userService.getAllActiveUsers()).rejects.toThrow('No active users found.');
  });

  it('should handle ProvisionedThroughputExceededException', async () => {
    mockPromise.mockRejectedValueOnce({ code: 'ProvisionedThroughputExceededException', message: 'Throughput exceeded' });
    await expect(userService.getAllActiveUsers()).rejects.toThrow('Database is temporarily unavailable, please try again');
  });

  // ── addUserToGroup ───────────────────────────────────────────────────────────

  it('should change role from Inactive to Employee and send email', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ MessageId: 'test-id' })
      .mockResolvedValueOnce({ Attributes: { ...user, position: UserStatus.Employee } });

    const result = await userService.addUserToGroup(user, UserStatus.Employee, admin);
    expect(result.position).toBe(UserStatus.Employee);
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({ GroupName: 'Employee', UserPoolId: 'test-pool-id', Username: 'inactive1@example.com' });
    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should promote Employee to Admin', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Attributes: { ...user, position: UserStatus.Admin } });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, admin);
    expect(result.position).toBe(UserStatus.Admin);
    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledWith({ GroupName: 'Employee', UserPoolId: 'test-pool-id', Username: 'emp1@example.com' });
    expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({ GroupName: 'Admin', UserPoolId: 'test-pool-id', Username: 'emp1@example.com' });
  });

  it('should return user unchanged if already in requested group', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin2@example.com')!;

    mockPromise.mockResolvedValueOnce({ Item: user });

    const result = await userService.addUserToGroup(user, UserStatus.Admin, admin);
    expect(result.position).toBe(UserStatus.Admin);
    expect(mockAdminAddUserToGroup).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid user in addUserToGroup', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    await expect(userService.addUserToGroup(null as any, UserStatus.Employee, admin)).rejects.toThrow('Valid user object is required');
    await expect(userService.addUserToGroup({ email: '' } as any, UserStatus.Employee, admin)).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException for invalid group name', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    await expect(userService.addUserToGroup(user, '' as any, admin)).rejects.toThrow('Group name is required');
    await expect(userService.addUserToGroup(user, 'InvalidGroup' as any, admin)).rejects.toThrow('Invalid group name');
  });

  it('should throw UnauthorizedException when non-admin changes role', async () => {
    const user     = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const employee = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    await expect(userService.addUserToGroup(user, UserStatus.Employee, employee)).rejects.toThrow('Only administrators can modify user groups');
  });

  it('should throw BadRequestException when admin demotes themselves', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    mockPromise.mockResolvedValueOnce({ Item: admin });
    await expect(userService.addUserToGroup(admin, UserStatus.Employee, admin)).rejects.toThrow('Administrators cannot demote themselves');
  });

  it('should throw NotFoundException when user does not exist in addUserToGroup', async () => {
    const admin    = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    const fakeUser: User = { email: 'fake@test.com', position: UserStatus.Inactive, firstName: '', lastName: '' };
    mockPromise.mockResolvedValueOnce({});
    await expect(userService.addUserToGroup(fakeUser, UserStatus.Employee, admin)).rejects.toThrow("User 'fake@test.com' does not exist");
  });

  it('should handle Cognito UserNotFoundException in addUserToGroup', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'inactive1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ code: 'UserNotFoundException', message: 'User not found in Cognito' });

    await expect(userService.addUserToGroup(user, UserStatus.Employee, admin)).rejects.toThrow('not found in authentication system');
  });

  it('should rollback Cognito change if DynamoDB update fails', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ code: 'ValidationException', message: 'Invalid update' })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await expect(userService.addUserToGroup(user, UserStatus.Admin, admin)).rejects.toThrow('Invalid update parameters');
    expect(mockAdminRemoveUserFromGroup).toHaveBeenCalledTimes(2);
    expect(mockAdminAddUserToGroup).toHaveBeenCalledTimes(2);
  });

  // ── deleteUser ───────────────────────────────────────────────────────────────

  it('should successfully delete a user', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({ Attributes: user })
      .mockResolvedValueOnce({});

    const result = await userService.deleteUser(user, admin);
    expect(result.email).toBe('emp1@example.com');
    expect(mockDelete).toHaveBeenCalledWith({ TableName: 'test-users-table', Key: { email: 'emp1@example.com' }, ReturnValues: 'ALL_OLD' });
    expect(mockAdminDeleteUser).toHaveBeenCalledWith({ UserPoolId: 'test-pool-id', Username: 'emp1@example.com' });
  });

  it('should throw BadRequestException for invalid user in deleteUser', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    await expect(userService.deleteUser(null as any, admin)).rejects.toThrow('Valid user object is required');
    await expect(userService.deleteUser({ email: '' } as any, admin)).rejects.toThrow('Valid user object is required');
  });

  it('should throw BadRequestException for invalid requestedBy', async () => {
    const user = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    await expect(userService.deleteUser(user, null as any)).rejects.toThrow('Valid requesting user is required');
  });

  it('should throw UnauthorizedException when non-admin deletes user', async () => {
    const user     = mockDatabase.users.find(u => u.email === 'emp2@example.com')!;
    const employee = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    await expect(userService.deleteUser(user, employee)).rejects.toThrow('Only administrators can delete users');
  });

  it('should throw BadRequestException when admin deletes themselves', async () => {
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    await expect(userService.deleteUser(admin, admin)).rejects.toThrow('Administrators cannot delete their own account');
  });

  it('should throw NotFoundException when user to delete does not exist', async () => {
    const admin    = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;
    const fakeUser: User = { email: 'fake@test.com', position: UserStatus.Employee, firstName: '', lastName: '' };
    mockPromise.mockResolvedValueOnce({});
    await expect(userService.deleteUser(fakeUser, admin)).rejects.toThrow("User 'fake@test.com' does not exist");
  });

  it('should handle Cognito UserNotFoundException during delete and rollback', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({ Attributes: user })
      .mockRejectedValueOnce({ code: 'UserNotFoundException', message: 'User not found' })
      .mockResolvedValueOnce({});

    await expect(userService.deleteUser(user, admin)).rejects.toThrow('not found in authentication system');
    expect(mockPut).toHaveBeenCalledWith({ TableName: 'test-users-table', Item: user });
  });

  it('should rollback DynamoDB delete if Cognito delete fails', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockResolvedValueOnce({ Attributes: user })
      .mockRejectedValueOnce({ code: 'InternalError', message: 'Cognito internal error' })
      .mockResolvedValueOnce({});

    await expect(userService.deleteUser(user, admin)).rejects.toThrow('Failed to delete user from authentication system');
    expect(mockPut).toHaveBeenCalledWith({ TableName: 'test-users-table', Item: user });
  });

  it('should handle DynamoDB delete failure without calling Cognito', async () => {
    const user  = mockDatabase.users.find(u => u.email === 'emp1@example.com')!;
    const admin = mockDatabase.users.find(u => u.email === 'admin1@example.com')!;

    mockPromise
      .mockResolvedValueOnce({ Item: user })
      .mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found' });

    await expect(userService.deleteUser(user, admin)).rejects.toThrow('Failed to delete user from database');
    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
  });
});