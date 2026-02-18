import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import {
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";

vi.mock('../../guards/auth.guard', () => ({
  VerifyUserGuard: vi.fn(class MockVerifyUserGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
  VerifyAdminRoleGuard: vi.fn(class MockVerifyAdminRoleGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
}));

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
  return {
    CognitoIdentityServiceProvider: vi.fn(function() {
      return {
        adminCreateUser: mockAdminCreateUser,
        adminSetUserPassword: mockAdminSetUserPassword,
        initiateAuth: mockInitiateAuth,
        getUser: mockGetUser,
        respondToAuthChallenge: mockRespondToAuthChallenge,
        adminAddUserToGroup: mockAdminAddUserToGroup,
        adminDeleteUser: mockAdminDeleteUser,
      };
    }),
    DynamoDB: {
      DocumentClient: vi.fn(function() {
        return {
          get: mockDynamoGet,
          put: mockDynamoPut,
          update: mockDynamoUpdate,
          scan: mockDynamoScan,
        };
      })
    },
    SES: vi.fn(function() {
      return {};
    }),
  };
});

describe("AuthService", () => {
  let service: AuthService;

  beforeAll(() => {
    process.env.COGNITO_USER_POOL_ID = "test-user-pool-id";
    process.env.COGNITO_CLIENT_ID = "test-client-id";
    process.env.COGNITO_CLIENT_SECRET = "test-client-secret";
    process.env.DYNAMODB_USER_TABLE_NAME = "test-users-table";
    process.env.FISH_EYE_LENS = "sha256";
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
      expect(result.username).toBe("c4c@example.com");
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

      process.env.COGNITO_CLIENT_ID = "test-client-id";
      process.env.COGNITO_CLIENT_SECRET = "test-client-secret";
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

      const result = await service.setNewPassword(
        "NewPass123!",
        "session123",
        "c4c@example.com",
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
      );
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
      await expect(
        service.validateSession("")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should handle NotAuthorizedException", async () => {
      mockCognitoPromise.mockRejectedValueOnce({
        code: "NotAuthorizedException",
        message: "Invalid token",
      });

      await expect(
        service.validateSession("invalid-token")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should handle InvalidParameterException", async () => {
      mockCognitoPromise.mockRejectedValueOnce({
        code: "InvalidParameterException",
        message: "Invalid token format",
      });

      await expect(
        service.validateSession("bad-format")
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});