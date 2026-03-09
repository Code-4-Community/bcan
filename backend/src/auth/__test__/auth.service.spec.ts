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

// ─── Cognito mocks ────────────────────────────────────────────────────────────
const mockCognitoPromise = vi.fn();
const mockAdminCreateUser          = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockAdminSetUserPassword     = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockAdminAddUserToGroup      = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockAdminRemoveUserFromGroup = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockAdminDeleteUser          = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockInitiateAuth             = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockGetUser                  = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockRespondToAuthChallenge   = vi.fn(() => ({ promise: mockCognitoPromise }));
const mockGlobalSignOut            = vi.fn(() => ({ promise: mockCognitoPromise }));

// ─── DynamoDB mocks ───────────────────────────────────────────────────────────
const mockDynamoPromise = vi.fn();
const mockDynamoGet    = vi.fn(() => ({ promise: mockDynamoPromise }));
const mockDynamoPut    = vi.fn(() => ({ promise: mockDynamoPromise }));
const mockDynamoUpdate = vi.fn(() => ({ promise: mockDynamoPromise }));
const mockDynamoScan   = vi.fn(() => ({ promise: mockDynamoPromise }));
const mockDynamoDelete = vi.fn(() => ({ promise: mockDynamoPromise }));

// ─── AWS SDK mock ─────────────────────────────────────────────────────────────
vi.mock('aws-sdk', () => {
  const cognitoFactory = vi.fn(function () {
    return {
      adminCreateUser:          mockAdminCreateUser,
      adminSetUserPassword:     mockAdminSetUserPassword,
      adminAddUserToGroup:      mockAdminAddUserToGroup,
      adminRemoveUserFromGroup: mockAdminRemoveUserFromGroup,
      adminDeleteUser:          mockAdminDeleteUser,
      initiateAuth:             mockInitiateAuth,
      getUser:                  mockGetUser,
      respondToAuthChallenge:   mockRespondToAuthChallenge,
      globalSignOut:            mockGlobalSignOut,
    };
  });

  const documentClientFactory = vi.fn(function () {
    return {
      get:    mockDynamoGet,
      put:    mockDynamoPut,
      update: mockDynamoUpdate,
      scan:   mockDynamoScan,
      delete: mockDynamoDelete,
    };
  });

  const awsMock = {
    CognitoIdentityServiceProvider: cognitoFactory,
    DynamoDB: { DocumentClient: documentClientFactory },
  };

  return { ...awsMock, default: awsMock };
});

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    process.env.COGNITO_USER_POOL_ID     = 'test-pool-id';
    process.env.COGNITO_CLIENT_ID        = 'test-client-id';
    process.env.COGNITO_CLIENT_SECRET    = 'test-client-secret';
    process.env.DYNAMODB_USER_TABLE_NAME = 'test-users-table';
    process.env.FISH_EYE_LENS            = 'sha256';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-attach after clearAllMocks
    mockAdminCreateUser.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminSetUserPassword.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminRemoveUserFromGroup.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockCognitoPromise });
    mockInitiateAuth.mockReturnValue({ promise: mockCognitoPromise });
    mockGetUser.mockReturnValue({ promise: mockCognitoPromise });
    mockRespondToAuthChallenge.mockReturnValue({ promise: mockCognitoPromise });
    mockGlobalSignOut.mockReturnValue({ promise: mockCognitoPromise });

    mockDynamoGet.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoPut.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoUpdate.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoScan.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoDelete.mockReturnValue({ promise: mockDynamoPromise });

    mockCognitoPromise.mockResolvedValue({});
    mockDynamoPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should successfully register a user', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({ User: { Attributes: [{ Name: 'sub', Value: 'test-sub-123' }] } }) // adminCreateUser
        .mockResolvedValueOnce({})   // adminSetUserPassword
        .mockResolvedValueOnce({});  // adminAddUserToGroup

      mockDynamoPromise.mockResolvedValueOnce({});  // DynamoDB put

      await service.register('c4c@example.com', 'Pass123!', 'John', 'Doe');

      expect(mockAdminCreateUser).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: 'c4c@example.com',
        UserAttributes: [
          { Name: 'email', Value: 'c4c@example.com' },
          { Name: 'email_verified', Value: 'true' },
        ],
        MessageAction: 'SUPPRESS',
      });

      expect(mockAdminSetUserPassword).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: 'c4c@example.com',
        Password: 'Pass123!',
        Permanent: true,
      });

      expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
        GroupName: 'Inactive',
        UserPoolId: 'test-pool-id',
        Username: 'c4c@example.com',
      });

      expect(mockDynamoPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: 'test-users-table',
          Item: expect.objectContaining({
            email: 'c4c@example.com',
            position: UserStatus.Inactive,
            firstName: 'John',
            lastName: 'Doe',
          }),
        })
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      mockCognitoPromise.mockRejectedValueOnce({
        code: 'UsernameExistsException',
        message: 'User already exists',
      });

      await expect(
        service.register('existing@example.com', 'Pass123!', 'John', 'Doe')
      ).rejects.toThrow('An account with this email already exists');
    });

    it('should throw BadRequestException for invalid email', async () => {
      await expect(
        service.register('not-an-email', 'Pass123!', 'John', 'Doe')
      ).rejects.toThrow('Valid email address is required');
    });

    it('should throw BadRequestException when password is too short', async () => {
      await expect(
        service.register('test@test.com', 'short', 'John', 'Doe')
      ).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should throw InternalServerErrorException when COGNITO_USER_POOL_ID is missing', async () => {
      const original = process.env.COGNITO_USER_POOL_ID;
      delete process.env.COGNITO_USER_POOL_ID;

      const module = await Test.createTestingModule({ providers: [AuthService] }).compile();
      const svc = module.get<AuthService>(AuthService);

      await expect(svc.register('test@test.com', 'Pass123!', 'John', 'Doe')).rejects.toThrow('Server configuration error');
      process.env.COGNITO_USER_POOL_ID = original;
    });

    it('should throw InternalServerErrorException when DYNAMODB_USER_TABLE_NAME is missing', async () => {
      const original = process.env.DYNAMODB_USER_TABLE_NAME;
      delete process.env.DYNAMODB_USER_TABLE_NAME;

      const module = await Test.createTestingModule({ providers: [AuthService] }).compile();
      const svc = module.get<AuthService>(AuthService);

      await expect(svc.register('test@test.com', 'Pass123!', 'John', 'Doe')).rejects.toThrow('Server configuration error');
      process.env.DYNAMODB_USER_TABLE_NAME = original;
    });

    it('should rollback Cognito user if adminSetUserPassword fails', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({ User: { Attributes: [{ Name: 'sub', Value: 'sub-123' }] } }) // adminCreateUser
        .mockRejectedValueOnce({ code: 'InvalidPasswordException', message: 'Bad password' }) // setPassword fails
        .mockResolvedValueOnce({});  // rollback delete

      await expect(
        service.register('test@test.com', 'Pass123!', 'John', 'Doe')
      ).rejects.toThrow();

      expect(mockAdminDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({ Username: 'test@test.com', UserPoolId: 'test-pool-id' })
      );
    });

    it('should rollback Cognito user if adminAddUserToGroup fails', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({ User: { Attributes: [{ Name: 'sub', Value: 'sub-123' }] } }) // adminCreateUser
        .mockResolvedValueOnce({})   // adminSetUserPassword
        .mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Group not found' }) // group fails
        .mockResolvedValueOnce({});  // rollback delete

      await expect(
        service.register('test@test.com', 'Pass123!', 'John', 'Doe')
      ).rejects.toThrow("User group 'Inactive' does not exist in the system");

      expect(mockAdminDeleteUser).toHaveBeenCalled();
    });

    it('should rollback Cognito user if DynamoDB put fails', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({ User: { Attributes: [{ Name: 'sub', Value: 'sub-123' }] } })
        .mockResolvedValueOnce({})   // adminSetUserPassword
        .mockResolvedValueOnce({})   // adminAddUserToGroup
        .mockResolvedValueOnce({});  // rollback delete

      mockDynamoPromise.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.register('test@test.com', 'Pass123!', 'John', 'Doe')
      ).rejects.toThrow('Failed to save user data to database');

      expect(mockAdminDeleteUser).toHaveBeenCalled();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should successfully login and return tokens and user', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({
          AuthenticationResult: {
            IdToken: 'id-token',
            AccessToken: 'access-token',
            RefreshToken: 'refresh-token',
          },
        })
        .mockResolvedValueOnce({
          UserAttributes: [
            { Name: 'email', Value: 'c4c@example.com' },
            { Name: 'sub',   Value: 'test-sub-123' },
          ],
        });

      mockDynamoPromise.mockResolvedValueOnce({
        Item: { email: 'c4c@example.com', position: UserStatus.Inactive, firstName: 'John', lastName: 'Doe' },
      });

      const result = await service.login('c4c@example.com', 'Pass123!');

      expect(result.access_token).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.idToken).toBe('id-token');
      expect(result.user).toEqual({ email: 'c4c@example.com', position: UserStatus.Inactive, firstName: 'John', lastName: 'Doe' });
      expect(result.message).toBe('Login Successful!');
    });

    it('should return NEW_PASSWORD_REQUIRED challenge', async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: 'session-123',
        ChallengeParameters: { requiredAttributes: '["email"]' },
      });

      const result = await service.login('c4c@example.com', 'Pass123!');

      expect(result.challenge).toBe('NEW_PASSWORD_REQUIRED');
      expect(result.session).toBe('session-123');
      expect(result.requiredAttributes).toEqual(['email']);
      expect(result.access_token).toBeUndefined();
    });

    it('should create new DynamoDB user if not found after login', async () => {
      mockCognitoPromise
        .mockResolvedValueOnce({
          AuthenticationResult: {
            IdToken: 'id-token',
            AccessToken: 'access-token',
            RefreshToken: 'refresh-token',
          },
        })
        .mockResolvedValueOnce({
          UserAttributes: [
            { Name: 'email', Value: 'new@example.com' },
            { Name: 'sub',   Value: 'new-sub-456' },
          ],
        });

      mockDynamoPromise
        .mockResolvedValueOnce({})   // get - user not found
        .mockResolvedValueOnce({});  // put - create new user

      const result = await service.login('new@example.com', 'Pass123!');

      expect(result.user).toEqual({ email: 'new@example.com', position: UserStatus.Inactive, firstName: '', lastName: '' });
      expect(mockDynamoPut).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is empty', async () => {
      await expect(service.login('', 'Pass123!')).rejects.toThrow('Email is required');
      await expect(service.login('   ', 'Pass123!')).rejects.toThrow('Email is required');
    });

    it('should throw BadRequestException when password is empty', async () => {
      await expect(service.login('test@test.com', '')).rejects.toThrow('Password is required');
    });

    it('should throw UnauthorizedException for NotAuthorizedException', async () => {
      mockCognitoPromise.mockRejectedValueOnce({ code: 'NotAuthorizedException', message: 'Bad credentials' });
      await expect(service.login('test@test.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException for other Cognito errors', async () => {
      mockCognitoPromise.mockRejectedValueOnce({ code: 'SomeAwsError', message: 'AWS error' });
      await expect(service.login('test@test.com', 'Pass123!')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw when client credentials are missing', async () => {
      const origId     = process.env.COGNITO_CLIENT_ID;
      const origSecret = process.env.COGNITO_CLIENT_SECRET;
      delete process.env.COGNITO_CLIENT_ID;
      delete process.env.COGNITO_CLIENT_SECRET;

      await expect(service.login('test@test.com', 'Pass123!')).rejects.toThrow('Cognito Client ID or Secret is not defined.');

      process.env.COGNITO_CLIENT_ID     = origId;
      process.env.COGNITO_CLIENT_SECRET = origSecret;
    });

    it('should throw when AuthenticationResult is missing tokens', async () => {
      mockCognitoPromise.mockResolvedValueOnce({ AuthenticationResult: {} });
      await expect(service.login('test@test.com', 'Pass123!')).rejects.toThrow('Authentication failed: Missing IdToken or AccessToken');
    });
  });

  // ── setNewPassword ───────────────────────────────────────────────────────────

  describe('setNewPassword', () => {
    it('should successfully set a new password', async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: { IdToken: 'new-id-token' },
      });

      const result = await service.setNewPassword('NewPass123!', 'session123', 'c4c@example.com');
      expect(result.access_token).toBe('new-id-token');
      expect(mockRespondToAuthChallenge).toHaveBeenCalled();
    });

    it('should include email in challenge responses', async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: { IdToken: 'new-id-token' },
      });

      await service.setNewPassword('NewPass123!', 'session123', 'c4c@example.com');

      expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          ChallengeResponses: expect.objectContaining({ email: 'c4c@example.com' }),
        })
      );
    });

    it('should throw BadRequestException when newPassword is empty', async () => {
      await expect(service.setNewPassword('', 'session', 'c4c@example.com')).rejects.toThrow('New password is required');
    });

    it('should throw BadRequestException when session is empty', async () => {
      await expect(service.setNewPassword('NewPass123!', '', 'c4c@example.com')).rejects.toThrow('Session is required');
    });

    it('should throw when AuthenticationResult is missing from response', async () => {
      mockCognitoPromise.mockResolvedValueOnce({});
      await expect(service.setNewPassword('NewPass123!', 'session', 'c4c@example.com')).rejects.toThrow('Failed to set new password');
    });

    it('should throw when respondToAuthChallenge fails', async () => {
      mockCognitoPromise.mockRejectedValueOnce(new Error('Challenge failed'));
      await expect(service.setNewPassword('NewPass123!', 'session', 'c4c@example.com')).rejects.toThrow('Challenge failed');
    });
  });

  // ── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      mockDynamoPromise.mockResolvedValueOnce({});

      await expect(service.updateProfile('c4c@example.com', 'Software Developer')).resolves.toBeUndefined();

      expect(mockDynamoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: 'test-users-table',
          Key: { email: 'c4c@example.com' },
          ExpressionAttributeValues: expect.objectContaining({
            ':email': 'c4c@example.com',
            ':position_or_role': 'Software Developer',
          }),
        })
      );
    });

    it('should throw BadRequestException when email is empty', async () => {
      await expect(service.updateProfile('', 'role')).rejects.toThrow('Email is required');
      await expect(service.updateProfile('   ', 'role')).rejects.toThrow('Email is required');
    });

    it('should throw BadRequestException when position_or_role is empty', async () => {
      await expect(service.updateProfile('c4c@example.com', '')).rejects.toThrow('Position or role is required');
      await expect(service.updateProfile('c4c@example.com', '   ')).rejects.toThrow('Position or role is required');
    });

    it('should throw when DynamoDB update fails', async () => {
      mockDynamoPromise.mockRejectedValueOnce(new Error('DB error'));
      await expect(service.updateProfile('c4c@example.com', 'role')).rejects.toThrow('DB error');
    });
  });

  // ── validateSession ──────────────────────────────────────────────────────────

  describe('validateSession', () => {
    it('should successfully validate a session and return user', async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        Username: 'c4c@example.com',
        UserAttributes: [{ Name: 'email', Value: 'c4c@example.com' }],
      });

      mockDynamoPromise.mockResolvedValueOnce({
        Item: { email: 'c4c@example.com', position: UserStatus.Employee, firstName: 'John', lastName: 'Doe' },
      });

      const result = await service.validateSession('valid-access-token');

      expect(result).toEqual({ email: 'c4c@example.com', position: UserStatus.Employee, firstName: 'John', lastName: 'Doe' });
      expect(mockGetUser).toHaveBeenCalledWith({ AccessToken: 'valid-access-token' });
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockCognitoPromise.mockRejectedValueOnce({ code: 'NotAuthorizedException', message: 'Token expired' });
      await expect(service.validateSession('expired-token')).rejects.toThrow('Session expired or invalid');
    });

    it('should throw UnauthorizedException when user not found in DynamoDB', async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        Username: 'ghost@test.com',
        UserAttributes: [{ Name: 'email', Value: 'ghost@test.com' }],
      });
      mockDynamoPromise.mockResolvedValueOnce({});  // no Item

      await expect(service.validateSession('some-token')).rejects.toThrow('Failed to validate session');
    });

    it('should throw UnauthorizedException for any other error', async () => {
      mockCognitoPromise.mockRejectedValueOnce(new Error('Unknown error'));
      await expect(service.validateSession('bad-token')).rejects.toThrow('Failed to validate session');
    });
  });

  describe('logout', () => {
    it('should successfully sign out user from Cognito', async () => {
      mockCognitoPromise.mockResolvedValueOnce({});
      
      await expect(service.logout('valid-access-token')).resolves.toBeUndefined();
      
      expect(mockGlobalSignOut).toHaveBeenCalledWith({
        AccessToken: 'valid-access-token',
      });
    });
    
    it('should not throw error when Cognito sign out fails', async () => {
      mockCognitoPromise.mockRejectedValueOnce(new Error('Cognito error'));
      
      await expect(service.logout('some-token')).resolves.toBeUndefined();
      expect(mockGlobalSignOut).toHaveBeenCalled();
    });
    
    it('should not throw error when token is already expired', async () => {
      mockCognitoPromise.mockRejectedValueOnce({ 
        code: 'NotAuthorizedException', 
        message: 'Token expired' 
      });
      
      await expect(service.logout('expired-token')).resolves.toBeUndefined();
    });
  });
});