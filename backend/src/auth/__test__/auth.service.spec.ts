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

const mockAdminCreateUser = vi.fn();
const mockAdminSetUserPassword = vi.fn();
const mockInitiateAuth = vi.fn();
const mockGetUser = vi.fn();
const mockRespondToAuthChallenge = vi.fn();
const mockAdminAddUserToGroup = vi.fn();
const mockAdminDeleteUser = vi.fn();
const mockCognitoPromise = vi.fn();

const mockDynamoGet = vi.fn();
const mockDynamoPut = vi.fn();
const mockDynamoUpdate = vi.fn();
const mockDynamoScan = vi.fn();
const mockDynamoPromise = vi.fn();

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

    mockAdminCreateUser.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminSetUserPassword.mockReturnValue({ promise: mockCognitoPromise });
    mockInitiateAuth.mockReturnValue({ promise: mockCognitoPromise });
    mockGetUser.mockReturnValue({ promise: mockCognitoPromise });
    mockRespondToAuthChallenge.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminAddUserToGroup.mockReturnValue({ promise: mockCognitoPromise });
    mockAdminDeleteUser.mockReturnValue({ promise: mockCognitoPromise });

    mockDynamoGet.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoPut.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoUpdate.mockReturnValue({ promise: mockDynamoPromise });
    mockDynamoScan.mockReturnValue({ promise: mockDynamoPromise });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    mockCognitoPromise.mockResolvedValue({});
    mockDynamoPromise.mockResolvedValue({});
  });

  describe("register", () => {
    it("should successfully register a user", async () => {
      // adminCreateUser returns a user with sub attribute
      mockCognitoPromise.mockResolvedValueOnce({
        User: {
          Attributes: [{ Name: "sub", Value: "test-sub-123" }],
        },
      });
      // adminSetUserPassword
      mockCognitoPromise.mockResolvedValueOnce({});
      // adminAddUserToGroup
      mockCognitoPromise.mockResolvedValueOnce({});
      // DynamoDB put
      mockDynamoPromise.mockResolvedValueOnce({});

      // register now takes (email, password, firstName, lastName)
      await service.register("c4c@example.com", "Pass123!", "John", "Doe");

      expect(mockAdminCreateUser).toHaveBeenCalledWith({
        UserPoolId: "test-user-pool-id",
        Username: "c4c@example.com",
        UserAttributes: [
          { Name: "email", Value: "c4c@example.com" },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS",
      });

      expect(mockAdminSetUserPassword).toHaveBeenCalledWith({
        UserPoolId: "test-user-pool-id",
        Username: "c4c@example.com",
        Password: "Pass123!",
        Permanent: true,
      });

      expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
        GroupName: "Inactive",
        UserPoolId: "test-user-pool-id",
        Username: "c4c@example.com",
      });

      expect(mockDynamoPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "test-users-table",
          Item: expect.objectContaining({
            email: "c4c@example.com",
            position: "Inactive",
            firstName: "John",
            lastName: "Doe",
          }),
        })
      );
    });

    it("should deny someone from making an account when email is already in use", async () => {
      mockCognitoPromise.mockRejectedValueOnce({
        code: "UsernameExistsException",
        message: "User already exists",
      });

      await expect(
        service.register("existing@example.com", "Pass123!", "John", "Doe")
      ).rejects.toThrow("An account with this email already exists");
    });
  });

  describe("login", () => {
    it("should successfully login existing user", async () => {
      const mockInitiateAuthFn = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "id-token",
              AccessToken: "access-token",
              RefreshToken: "refresh-token",
            },
          }),
      });

      const mockGetUserFn = () => ({
        promise: () =>
          Promise.resolve({
            UserAttributes: [
              { Name: "email", Value: "c4c@example.com" },
              { Name: "sub", Value: "test-sub-123" },
            ],
          }),
      });

      // DynamoDB get returns existing user keyed by email
      const mockGetFn = () => ({
        promise: () =>
          Promise.resolve({
            Item: {
              email: "c4c@example.com",
              position: "Inactive",
              firstName: "John",
              lastName: "Doe",
            },
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuthFn;
      (service["cognito"] as any).getUser = mockGetUserFn;
      (service["dynamoDb"] as any).get = mockGetFn;

      const result = await service.login("c4c@example.com", "Pass123!");

      expect(result.access_token).toBe("access-token");
      expect(result.user).toEqual({
        email: "c4c@example.com",
        position: "Inactive",
        firstName: "John",
        lastName: "Doe",
      });
      expect(result.message).toBe("Login Successful!");
    });

    it("should handle NEW_PASSWORD_REQUIRED challenge", async () => {
      const mockInitiateAuthFn = () => ({
        promise: () =>
          Promise.resolve({
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            Session: "session-123",
            ChallengeParameters: {
              requiredAttributes: '["email"]',
            },
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuthFn;

      const result = await service.login("c4c@example.com", "newPassword");

      expect(result.challenge).toBe("NEW_PASSWORD_REQUIRED");
      expect(result.session).toBe("session-123");
      expect(result.requiredAttributes).toEqual(["email"]);
      // username is no longer returned in challenge response
      expect(result.access_token).toBeUndefined();
      expect(result.user).toEqual({});
    });

    it("should create new DynamoDB user if not exists", async () => {
      const mockInitiateAuthFn = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "id-token",
              AccessToken: "access-token",
              RefreshToken: "refresh-token",
            },
          }),
      });

      const mockGetUserFn = () => ({
        promise: () =>
          Promise.resolve({
            UserAttributes: [
              { Name: "email", Value: "c4c@gmail.com" },
              { Name: "sub", Value: "test-sub-456" },
            ],
          }),
      });

      // DynamoDB get returns nothing (user doesn't exist yet)
      const mockGetFn = () => ({
        promise: () => Promise.resolve({}),
      });

      const mockPutFn = () => ({
        promise: () => Promise.resolve({}),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuthFn;
      (service["cognito"] as any).getUser = mockGetUserFn;
      (service["dynamoDb"] as any).get = mockGetFn;
      (service["dynamoDb"] as any).put = mockPutFn;

      const result = await service.login("c4c@gmail.com", "Pass123!");

      expect(result.access_token).toBe("access-token");
      expect(result.user).toEqual({
        email: "c4c@gmail.com",
        position: "Inactive",
        firstName: "",
        lastName: "",
      });
      expect(result.message).toBe("Login Successful!");
    });

    it("should handle NotAuthorizedException", async () => {
      const mockInitiateAuthFn = () => ({
        promise: () =>
          Promise.reject({
            code: "NotAuthorizedException",
            message: "Incorrect username or password",
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuthFn;
      await expect(service.login("c4c@example.com", "wrongpassword")).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should handle missing client credentials", async () => {
      delete process.env.COGNITO_CLIENT_ID;
      delete process.env.COGNITO_CLIENT_SECRET;

      await expect(service.login("c4c@example.com", "Pass123!")).rejects.toThrow(
        "Cognito Client ID or Secret is not defined."
      );

      await expect(svc.register('user', 'Password123!', 'test@test.com')).rejects.toThrow('Server configuration error');
      process.env.DYNAMODB_USER_TABLE_NAME = original;
    });

    it("should handle missing tokens in response", async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: {},
      });

      await expect(service.login("c4c@example.com", "Pass123!")).rejects.toThrow(
        "Authentication failed: Missing IdToken or AccessToken"
      );
    });

    it("should handle generic Cognito errors", async () => {
      const mockInitiateAuthFn = () => ({
        promise: () =>
          Promise.reject({
            code: "SomeAwsError",
            message: "AWS error occurred",
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuthFn;
      await expect(service.login("c4c@example.com", "Pass123!")).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe("setNewPassword", () => {
    it("should successfully set new password", async () => {
      const mockRespondFn = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "new-id-token",
            },
          }),
      });

      (service["cognito"] as any).respondToAuthChallenge = mockRespondFn;

      // setNewPassword no longer takes a separate username — just (newPassword, session, email)
      const result = await service.setNewPassword(
        "NewPass123!",
        "session123",
        "c4c@example.com"
      );

      expect(result.access_token).toBe("new-id-token");
    });

    it("should handle failed password setting", async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: {},
      });

      await expect(
        service.setNewPassword("NewPass123!", "s123", "c4c@example.com")
      ).rejects.toThrow("Failed to set new password");
    });

    it("should handle Cognito errors", async () => {
      const mockRespondFn = () => ({
        promise: () => Promise.reject(new Error("Cognito Error")),
      });

      (service["cognito"] as any).respondToAuthChallenge = mockRespondFn;

      await expect(
        service.setNewPassword("NewPass123!", "s123", "c4c@example.com")
      ).rejects.toThrow("Cognito Error");
    });
  });

  describe("updateProfile", () => {
    it("should successfully update user profile", async () => {
      mockDynamoPromise.mockResolvedValueOnce({});

      // updateProfile now takes (email, position_or_role) — no username
      await service.updateProfile("c4c@example.com", "Software Developer");

      expect(mockDynamoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { email: "c4c@example.com" },
          UpdateExpression: "SET email = :email, position_or_role = :position_or_role",
          ExpressionAttributeValues: {
            ":email": "c4c@example.com",
            ":position_or_role": "Software Developer",
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

    it("should handle DynamoDB update errors", async () => {
      const mockUpdateFn = vi.fn().mockReturnValue({
        promise: vi.fn().mockRejectedValue(new Error("DB error")),
      });

      (service['dynamoDb'] as any).update = mockUpdateFn;

      await expect(
        service.updateProfile("c4c@example.com", "Active")
      ).rejects.toThrow("DB error");
    });
  });

  describe("validateSession", () => {
    it("should successfully validate a session", async () => {
      // Cognito getUser returns email in attributes
      mockCognitoPromise.mockResolvedValueOnce({
        Username: "c4c@example.com",
        UserAttributes: [{ Name: "email", Value: "c4c@example.com" }],
      });

      // DynamoDB get returns user keyed by email
      mockDynamoPromise.mockResolvedValueOnce({
        Item: { email: "c4c@example.com", position: "Active", firstName: "John", lastName: "Doe" },
      });

      const result = await service.validateSession("valid-token");

      expect(result).toEqual({
        email: "c4c@example.com",
        position: "Active",
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("should reject missing access token", async () => {
      // Empty string still calls Cognito which then throws, caught as UnauthorizedException
      mockCognitoPromise.mockRejectedValueOnce({
        code: "NotAuthorizedException",
        message: "Invalid token",
      });

      await expect(
        service.validateSession("")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should handle NotAuthorizedException", async () => {
      mockCognitoPromise.mockRejectedValueOnce({
        code: "NotAuthorizedException",
        message: "Invalid token",
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