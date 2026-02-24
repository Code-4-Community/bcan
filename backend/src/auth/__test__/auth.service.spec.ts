import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { User } from '../../../../middle-layer/types/User';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Mock function declarations ───────────────────────────────────────────────
const mockPromise = vi.fn();

// DynamoDB
const mockScan   = vi.fn(() => ({ promise: mockPromise }));
const mockGet    = vi.fn(() => ({ promise: mockPromise }));
const mockUpdate = vi.fn(() => ({ promise: mockPromise }));
const mockPut    = vi.fn(() => ({ promise: mockPromise }));
const mockDelete = vi.fn(() => ({ promise: mockPromise }));

// Cognito
const mockAdminAddUserToGroup      = vi.fn(() => ({ promise: mockPromise }));
const mockAdminRemoveUserFromGroup = vi.fn(() => ({ promise: mockPromise }));
const mockAdminDeleteUser          = vi.fn(() => ({ promise: mockPromise }));
const mockAdminCreateUser          = vi.fn(() => ({ promise: mockPromise }));
const mockAdminSetUserPassword     = vi.fn(() => ({ promise: mockPromise }));
const mockInitiateAuth             = vi.fn(() => ({ promise: mockPromise }));
const mockGetUser                  = vi.fn(() => ({ promise: mockPromise }));
const mockRespondToAuthChallenge   = vi.fn(() => ({ promise: mockPromise }));

// ─── AWS SDK mock ─────────────────────────────────────────────────────────────
vi.mock('aws-sdk', () => {
  const cognitoFactory = vi.fn(function () {
    return {
      adminAddUserToGroup:      mockAdminAddUserToGroup,
      adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
      adminDeleteUser:          mockAdminDeleteUser,
      adminCreateUser:          mockAdminCreateUser,
      adminSetUserPassword:     mockAdminSetUserPassword,
      initiateAuth:             mockInitiateAuth,
      getUser:                  mockGetUser,
      respondToAuthChallenge:   mockRespondToAuthChallenge,
    };
  });

  const documentClientFactory = vi.fn(function () {
    return { scan: mockScan, get: mockGet, update: mockUpdate, put: mockPut, delete: mockDelete };
  });

  const awsMock = {
    CognitoIdentityServiceProvider: cognitoFactory,
    DynamoDB: { DocumentClient: documentClientFactory },
  };

  return { ...awsMock, default: awsMock };
});

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    process.env.COGNITO_USER_POOL_ID     = 'test-pool-id';
    process.env.COGNITO_CLIENT_ID        = 'test-client-id';
    process.env.COGNITO_CLIENT_SECRET    = 'test-client-secret';
    process.env.DYNAMODB_USER_TABLE_NAME = 'test-users-table';
    process.env.FISH_EYE_LENS            = 'sha256';
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
    mockAdminCreateUser.mockReturnValue({ promise: mockPromise });
    mockAdminSetUserPassword.mockReturnValue({ promise: mockPromise });
    mockInitiateAuth.mockReturnValue({ promise: mockPromise });
    mockGetUser.mockReturnValue({ promise: mockPromise });
    mockRespondToAuthChallenge.mockReturnValue({ promise: mockPromise });

    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  // ── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Email check - not found
      mockPromise
        .mockResolvedValueOnce({ Items: [] })           // email scan
        .mockResolvedValueOnce({})                      // username get (not found)
        .mockResolvedValueOnce({})                      // adminCreateUser
        .mockResolvedValueOnce({})                      // adminSetUserPassword
        .mockResolvedValueOnce({})                      // adminAddUserToGroup (Inactive)
        .mockResolvedValueOnce({});                     // DynamoDB put

      await expect(
        authService.register('newuser', 'Password123!', 'new@example.com')
      ).resolves.toBeUndefined();

      expect(mockAdminCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({ Username: 'newuser', UserPoolId: 'test-pool-id' })
      );
      expect(mockAdminSetUserPassword).toHaveBeenCalledWith(
        expect.objectContaining({ Username: 'newuser', Password: 'Password123!', Permanent: true })
      );
      expect(mockAdminAddUserToGroup).toHaveBeenCalledWith(
        expect.objectContaining({ GroupName: 'Inactive', Username: 'newuser' })
      );
      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: 'test-users-table',
          Item: expect.objectContaining({ userId: 'newuser', position: UserStatus.Inactive }),
        })
      );
    });

    it('should throw BadRequestException when username is empty', async () => {
      await expect(authService.register('', 'Password123!', 'test@test.com')).rejects.toThrow('Username is required');
      await expect(authService.register('   ', 'Password123!', 'test@test.com')).rejects.toThrow('Username is required');
    });

    it('should throw BadRequestException when password is too short', async () => {
      await expect(authService.register('user', 'short', 'test@test.com')).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should throw BadRequestException when email is invalid', async () => {
      await expect(authService.register('user', 'Password123!', 'not-an-email')).rejects.toThrow('Valid email address is required');
      await expect(authService.register('user', 'Password123!', '')).rejects.toThrow('Valid email address is required');
    });

    it('should throw InternalServerErrorException when COGNITO_USER_POOL_ID is missing', async () => {
      const original = process.env.COGNITO_USER_POOL_ID;
      delete process.env.COGNITO_USER_POOL_ID;

      const module = await Test.createTestingModule({ providers: [AuthService] }).compile();
      const svc = module.get<AuthService>(AuthService);

      await expect(svc.register('user', 'Password123!', 'test@test.com')).rejects.toThrow('Server configuration error');
      process.env.COGNITO_USER_POOL_ID = original;
    });

    it('should throw InternalServerErrorException when DYNAMODB_USER_TABLE_NAME is missing', async () => {
      const original = process.env.DYNAMODB_USER_TABLE_NAME;
      delete process.env.DYNAMODB_USER_TABLE_NAME;

      const module = await Test.createTestingModule({ providers: [AuthService] }).compile();
      const svc = module.get<AuthService>(AuthService);

      await expect(svc.register('user', 'Password123!', 'test@test.com')).rejects.toThrow('Server configuration error');
      process.env.DYNAMODB_USER_TABLE_NAME = original;
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPromise.mockResolvedValueOnce({
        Items: [{ userId: 'existing', email: 'existing@test.com' }],
      });

      await expect(
        authService.register('newuser', 'Password123!', 'existing@test.com')
      ).rejects.toThrow('An account with this email already exists');
    });

    it('should throw ConflictException when username already exists', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })                                       // email scan
        .mockResolvedValueOnce({ Item: { userId: 'taken', email: 'x@x.com' } });   // username get

      await expect(
        authService.register('taken', 'Password123!', 'new@test.com')
      ).rejects.toThrow('This username is already taken');
    });

    it('should throw ConflictException when Cognito UsernameExistsException', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce({ code: 'UsernameExistsException', message: 'User exists' });

      await expect(
        authService.register('existing', 'Password123!', 'new@test.com')
      ).rejects.toThrow('Username already exists in authentication system');
    });

    it('should throw BadRequestException for Cognito InvalidPasswordException on create', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce({ code: 'InvalidPasswordException', message: 'Bad password' });

      await expect(
        authService.register('user', 'Password123!', 'test@test.com')
      ).rejects.toThrow('Password does not meet security requirements');
    });

    it('should throw BadRequestException for Cognito InvalidParameterException on create', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce({ code: 'InvalidParameterException', message: 'Bad param' });

      await expect(
        authService.register('user', 'Password123!', 'test@test.com')
      ).rejects.toThrow('Invalid registration parameters');
    });

    it('should rollback Cognito user if adminSetUserPassword fails', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})   // adminCreateUser succeeds
        .mockRejectedValueOnce({ code: 'InvalidPasswordException', message: 'Bad' }) // set password fails
        .mockResolvedValueOnce({});  // rollback delete

      await expect(
        authService.register('user', 'Password123!', 'test@test.com')
      ).rejects.toThrow();

      expect(mockAdminDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({ Username: 'user', UserPoolId: 'test-pool-id' })
      );
    });

    it('should rollback Cognito user if adminAddUserToGroup fails', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})   // adminCreateUser
        .mockResolvedValueOnce({})   // adminSetUserPassword
        .mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Group not found' }) // add to group fails
        .mockResolvedValueOnce({});  // rollback delete

      await expect(
        authService.register('user', 'Password123!', 'test@test.com')
      ).rejects.toThrow("User group 'Inactive' does not exist in the system");

      expect(mockAdminDeleteUser).toHaveBeenCalled();
    });

    it('should rollback Cognito user if DynamoDB put fails', async () => {
      mockPromise
        .mockResolvedValueOnce({ Items: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})   // adminCreateUser
        .mockResolvedValueOnce({})   // adminSetUserPassword
        .mockResolvedValueOnce({})   // adminAddUserToGroup
        .mockRejectedValueOnce({ code: 'InternalError', message: 'DB error' }) // put fails
        .mockResolvedValueOnce({});  // rollback delete

      await expect(
        authService.register('user', 'Password123!', 'test@test.com')
      ).rejects.toThrow('Failed to save user data to database');

      expect(mockAdminDeleteUser).toHaveBeenCalled();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    const mockUser: User = { userId: 'emp1', email: 'emp1@example.com', position: UserStatus.Employee };

    it('should successfully login and return access token and user', async () => {
      mockPromise
        .mockResolvedValueOnce({
          AuthenticationResult: {
            IdToken: 'mock-id-token',
            AccessToken: 'mock-access-token',
          },
        })
        .mockResolvedValueOnce({
          Username: 'emp1',
          UserAttributes: [{ Name: 'email', Value: 'emp1@example.com' }],
        })
        .mockResolvedValueOnce({ Item: mockUser });

      const result = await authService.login('emp1', 'Password123!');

      expect(result.access_token).toBe('mock-access-token');
      expect(result.user).toEqual(mockUser);
      expect(result.message).toBe('Login Successful!');
      expect(mockInitiateAuth).toHaveBeenCalled();
    });

    it('should return NEW_PASSWORD_REQUIRED challenge', async () => {
      mockPromise.mockResolvedValueOnce({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: 'mock-session',
        ChallengeParameters: { requiredAttributes: '[]' },
      });

      const result = await authService.login('emp1', 'Password123!');

      expect(result.challenge).toBe('NEW_PASSWORD_REQUIRED');
      expect(result.session).toBe('mock-session');
    });

    it('should create user in DynamoDB if not found after login', async () => {
      mockPromise
        .mockResolvedValueOnce({
          AuthenticationResult: { IdToken: 'id-token', AccessToken: 'access-token' },
        })
        .mockResolvedValueOnce({
          Username: 'newuser',
          UserAttributes: [{ Name: 'email', Value: 'new@test.com' }],
        })
        .mockResolvedValueOnce({})   // DynamoDB get - user not found
        .mockResolvedValueOnce({});  // DynamoDB put - create new user

      const result = await authService.login('newuser', 'Password123!');

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: 'test-users-table',
          Item: expect.objectContaining({ userId: 'newuser', position: UserStatus.Inactive }),
        })
      );
      expect(result.user.position).toBe(UserStatus.Inactive);
    });

    it('should throw BadRequestException when username is empty', async () => {
      await expect(authService.login('', 'password')).rejects.toThrow('Username is required');
      await expect(authService.login('   ', 'password')).rejects.toThrow('Username is required');
    });

    it('should throw BadRequestException when password is empty', async () => {
      await expect(authService.login('user', '')).rejects.toThrow('Password is required');
    });

    it('should throw UnauthorizedException for NotAuthorizedException', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'NotAuthorizedException', message: 'Bad credentials' });
      await expect(authService.login('user', 'wrongpass')).rejects.toThrow('Incorrect username or password.');
    });

    it('should throw InternalServerErrorException for other Cognito errors', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'InternalError', message: 'Something broke' });
      await expect(authService.login('user', 'Password123!')).rejects.toThrow('An error occurred during login.');
    });
  });

  // ── setNewPassword ───────────────────────────────────────────────────────────

  describe('setNewPassword', () => {
    it('should successfully set a new password', async () => {
      mockPromise.mockResolvedValueOnce({
        AuthenticationResult: { IdToken: 'new-id-token' },
      });

      const result = await authService.setNewPassword('NewPass123!', 'mock-session', 'emp1');
      expect(result.access_token).toBe('new-id-token');
      expect(mockRespondToAuthChallenge).toHaveBeenCalled();
    });

    it('should include email in challenge response when provided', async () => {
      mockPromise.mockResolvedValueOnce({
        AuthenticationResult: { IdToken: 'new-id-token' },
      });

      await authService.setNewPassword('NewPass123!', 'mock-session', 'emp1', 'emp1@test.com');

      expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          ChallengeResponses: expect.objectContaining({ email: 'emp1@test.com' }),
        })
      );
    });

    it('should throw BadRequestException when newPassword is empty', async () => {
      await expect(authService.setNewPassword('', 'session', 'user')).rejects.toThrow('New password is required');
    });

    it('should throw BadRequestException when session is empty', async () => {
      await expect(authService.setNewPassword('Password123!', '', 'user')).rejects.toThrow('Session is required');
    });

    it('should throw BadRequestException when username is empty', async () => {
      await expect(authService.setNewPassword('Password123!', 'session', '')).rejects.toThrow('Username is required');
      await expect(authService.setNewPassword('Password123!', 'session', '   ')).rejects.toThrow('Username is required');
    });

    it('should throw when AuthenticationResult is missing from response', async () => {
      mockPromise.mockResolvedValueOnce({});
      await expect(authService.setNewPassword('Password123!', 'session', 'user')).rejects.toThrow('Failed to set new password');
    });

    it('should throw when respondToAuthChallenge fails', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Challenge failed'));
      await expect(authService.setNewPassword('Password123!', 'session', 'user')).rejects.toThrow('Challenge failed');
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      mockPromise.mockResolvedValueOnce({});
      await expect(authService.updateProfile('emp1', 'newemail@test.com', 'Engineer')).resolves.toBeUndefined();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: 'test-users-table',
          Key: { userId: 'emp1' },
        })
      );
    });

    it('should throw BadRequestException when username is empty', async () => {
      await expect(authService.updateProfile('', 'email@test.com', 'role')).rejects.toThrow('Username is required');
      await expect(authService.updateProfile('   ', 'email@test.com', 'role')).rejects.toThrow('Username is required');
    });

    it('should throw BadRequestException when email is empty', async () => {
      await expect(authService.updateProfile('user', '', 'role')).rejects.toThrow('Email is required');
      await expect(authService.updateProfile('user', '   ', 'role')).rejects.toThrow('Email is required');
    });

    it('should throw BadRequestException when position_or_role is empty', async () => {
      await expect(authService.updateProfile('user', 'email@test.com', '')).rejects.toThrow('Position or role is required');
      await expect(authService.updateProfile('user', 'email@test.com', '   ')).rejects.toThrow('Position or role is required');
    });

    it('should throw when DynamoDB update fails', async () => {
      mockPromise.mockRejectedValueOnce(new Error('DynamoDB failure'));
      await expect(authService.updateProfile('user', 'email@test.com', 'role')).rejects.toThrow('DynamoDB failure');
    });
  });

  // ── validateSession ──────────────────────────────────────────────────────────

  describe('validateSession', () => {
    const mockUser: User = { userId: 'emp1', email: 'emp1@example.com', position: UserStatus.Employee };

    it('should successfully validate a session and return user', async () => {
      mockPromise
        .mockResolvedValueOnce({
          Username: 'emp1',
          UserAttributes: [{ Name: 'email', Value: 'emp1@example.com' }],
        })
        .mockResolvedValueOnce({ Item: mockUser });

      const result = await authService.validateSession('valid-access-token');
      expect(result).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledWith({ AccessToken: 'valid-access-token' });
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'NotAuthorizedException', message: 'Token expired' });
      await expect(authService.validateSession('expired-token')).rejects.toThrow('Session expired or invalid');
    });

    it('should throw UnauthorizedException when user not found in DynamoDB', async () => {
      mockPromise
        .mockResolvedValueOnce({
          Username: 'ghost',
          UserAttributes: [{ Name: 'email', Value: 'ghost@test.com' }],
        })
        .mockResolvedValueOnce({});  // no Item

      await expect(authService.validateSession('some-token')).rejects.toThrow('Failed to validate session');
    });

    it('should throw UnauthorizedException for any other error', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Unknown error'));
      await expect(authService.validateSession('bad-token')).rejects.toThrow('Failed to validate session');
    });
  });
});