import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import {
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";

// Create mock functions for Cognito operations
const mockAdminCreateUser = vi.fn().mockReturnThis();
const mockAdminSetUserPassword = vi.fn().mockReturnThis();
const mockInitiateAuth = vi.fn().mockReturnThis();
const mockGetUser = vi.fn().mockReturnThis();
const mockRespondToAuthChallenge = vi.fn().mockReturnThis();
const mockCognitoPromise = vi.fn();
// adminAddUserToGroup is called without .promise() in the service; return a resolved promise so `await` works
const mockAdminAddUserToGroup = vi.fn().mockReturnThis()
// Create mock functions for DynamoDB operations
const mockDynamoGet = vi.fn().mockReturnThis();
const mockDynamoPut = vi.fn().mockReturnThis();
const mockDynamoUpdate = vi.fn().mockReturnThis();
const mockDynamoScan = vi.fn().mockReturnThis();
const mockDynamoPromise = vi.fn();

// Mock AWS SDK
vi.mock('aws-sdk', () => ({
  CognitoIdentityServiceProvider: vi.fn(() => ({
    adminCreateUser: mockAdminCreateUser,
    adminSetUserPassword: mockAdminSetUserPassword,
    initiateAuth: mockInitiateAuth,
    getUser: mockGetUser,
    respondToAuthChallenge: mockRespondToAuthChallenge,
    adminAddUserToGroup: mockAdminAddUserToGroup,
    promise: mockCognitoPromise,
  })),
  DynamoDB: {
    DocumentClient: vi.fn(() => ({
      get: mockDynamoGet,
      put: mockDynamoPut,
      update: mockDynamoUpdate,
      promise: mockDynamoPromise,
      scan: mockDynamoScan
    }))
  },
  SES: vi.fn(() => ({
    // SES methods can be mocked here if needed
  })),
}));

describe("AuthService", () => {
  let service: AuthService;

  // Set up environment variables for testing
  beforeAll(() => {
    process.env.COGNITO_USER_POOL_ID = "test-user-pool-id";
    process.env.COGNITO_CLIENT_ID = "test-client-id";
    process.env.COGNITO_CLIENT_SECRET = "test-client-secret";
    process.env.DYNAMODB_USER_TABLE_NAME = "test-users-table";
    process.env.FISH_EYE_LENS = "sha256";
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mock promises to default resolved state
    mockCognitoPromise.mockResolvedValue({});
    mockDynamoPromise.mockResolvedValue({});
  });

  describe("register", () => {
    // 1. Set up mock responses for Cognito adminCreateUser and adminSetUserPassword
    // 2. Set up mock response for DynamoDB put operation
    // 3. Call service.register with test data
    // 4. Assert that Cognito methods were called with correct parameters
    // 5. Assert that DynamoDB put was called with correct user data
    it("should successfully register a user", async () => {
      // Ensure scan returns no items (email not in use)
      mockDynamoPromise.mockResolvedValueOnce({ Items: [] });
      // Ensure get returns no items (username not in use)
      mockDynamoPromise.mockResolvedValueOnce({});

      // Cognito promise chain
      // adminCreateUser().promise()
      mockCognitoPromise.mockResolvedValueOnce({});
      // adminSetUserPassword().promise()
      mockCognitoPromise.mockResolvedValueOnce({});
      // adminAddUserToGroup().promise() - needs to be mocked here
      mockCognitoPromise.mockResolvedValueOnce({});
      // DynamoDB put().promise()
      mockDynamoPromise.mockResolvedValueOnce({});

      await service.register("c4c", "Pass123!", "c4c@example.com");

      expect(mockAdminCreateUser).toHaveBeenCalledWith({
        UserPoolId: "test-user-pool-id",
        Username: "c4c",
        UserAttributes: [
          { Name: "email", Value: "c4c@example.com" },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS",
      });

      expect(mockAdminSetUserPassword).toHaveBeenCalledWith({
        UserPoolId: "test-user-pool-id",
        Username: "c4c",
        Password: "Pass123!",
        Permanent: true,
      });

      expect(mockAdminAddUserToGroup).toHaveBeenCalledWith({
        GroupName: "Inactive",
        UserPoolId: "test-user-pool-id",
        Username: "c4c",
      });

      expect(mockDynamoPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "test-users-table",
          Item: expect.objectContaining({
            userId: "c4c",
            email: "c4c@example.com",
            position: "Inactive",
          }),
        })
      );
    });

    it("should deny someone from making an email when it is already in use", async () => {});
  });

  describe("login", () => {
    // 1. Mock successful Cognito initiateAuth response with tokens
    // 2. Mock Cognito getUser response with user attributes
    // 3. Mock DynamoDB get to return existing user
    // 4. Call service.login and verify returned token and user data
    it("should successfully login existing user", async () => {
      // Mock Cognito initiateAuth
      const mockInitiateAuth = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "id-token",
              AccessToken: "access-token",
            },
          }),
      });

      // Mock Cognito getUser
      const mockGetUser = () => ({
        promise: () =>
          Promise.resolve({
            UserAttributes: [{ Name: "email", Value: "c4c@example.com" }],
          }),
      });

      // Mock DynamoDB get to return existing user
      const mockGet = () => ({
        promise: () =>
          Promise.resolve({
            Item: { userId: "c4c", email: "c4c@example.com", biography: "" },
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuth;
      (service["cognito"] as any).getUser = mockGetUser;
      (service["dynamoDb"] as any).get = mockGet;

      // Call the login method
      const result = await service.login("c4c", "Pass123!");

      // Verify the results
      expect(result.access_token).toBe("id-token");
      expect(result.user).toEqual({
        userId: "c4c",
        email: "c4c@example.com",
        biography: "",
      });
      expect(result.message).toBe("Login Successful!");
    });

    // 1. Mock Cognito initiateAuth to return NEW_PASSWORD_REQUIRED challenge
    // 2. Call service.login and verify challenge response structure
    it("should handle NEW_PASSWORD_REQUIRED challenge", async () => {
      // Mock Cognito initiateAuth
      const mockInitiateAuth = () => ({
        promise: () =>
          Promise.resolve({
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            Session: "session-123",
            ChallengeParameters: {
              requiredAttributes: '["email"]',
            },
          }),
      });

      // Replace the cognito method with mock
      (service["cognito"] as any).initiateAuth = mockInitiateAuth;

      // Call login and expect challenge response
      const result = await service.login("c4c", "newPassword");

      // Verify the challenge response
      expect(result.challenge).toBe("NEW_PASSWORD_REQUIRED");
      expect(result.session).toBe("session-123");
      expect(result.requiredAttributes).toEqual(["email"]);
      expect(result.username).toBe("c4c");
      expect(result.access_token).toBeUndefined();
      expect(result.user).toEqual({});
    });

    it("should create new DynamoDB user if not exists", async () => {
      const mockInitiateAuth = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "id-token",
              AccessToken: "access-token",
            },
          }),
      });

      // Mock getUser
      const mockGetUser = () => ({
        promise: () =>
          Promise.resolve({
            UserAttributes: [{ Name: "email", Value: "c4c@gmail.com" }],
          }),
      });

      // Mock DynamoDB
      const mockGet = () => ({
        promise: () => Promise.resolve({}),
      });

      // Mock DynamoDB put
      const mockPut = () => ({
        promise: () => Promise.resolve({}),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuth;
      (service["cognito"] as any).getUser = mockGetUser;
      (service["dynamoDb"] as any).get = mockGet;
      (service["dynamoDb"] as any).put = mockPut;

      const result = await service.login("c4c", "Pass123!");

      expect(result.access_token).toBe("id-token");
      expect(result.user).toEqual({
        userId: "c4c",
        email: "c4c@gmail.com",
        position: "Inactive",
      });
      expect(result.message).toBe("Login Successful!");

      expect(result.user.userId).toBe("c4c");
      expect(result.user.email).toBe("c4c@gmail.com");
    });

    // 1. Mock Cognito to throw NotAuthorizedException
    // 2. Verify UnauthorizedException is thrown by service
    it("should handle NotAuthorizedException", async () => {
      const mockInitiateAuth = () => ({
        promise: () =>
          Promise.reject({
            code: "NotAuthorizedException",
            message: "Incorrect username or password",
          }),
      });

      (service["cognito"] as any).initiateAuth = mockInitiateAuth;
      await expect(service.login("c4c", "wrongpassword")).rejects.toThrow(
        UnauthorizedException
      );
    });

    // 1. Remove environment variables
    // 2. Expect service to throw configuration error
    it("should handle missing client credentials", async () => {
      delete process.env.COGNITO_CLIENT_ID;
      delete process.env.COGNITO_CLIENT_SECRET;

      await expect(service.login("john", "123")).rejects.toThrow(
        "Cognito Client ID or Secret is not defined."
      );

      process.env.COGNITO_CLIENT_ID = "test-client-id";
      process.env.COGNITO_CLIENT_SECRET = "test-client-secret";
    });

    // 1. Mock Cognito to return response without required tokens
    // 2. Verify appropriate error is thrown
    it("should handle missing tokens in response", async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: {},
      });

      await expect(service.login("c4c", "c4c@gmail.com")).rejects.toThrow(
        "Authentication failed: Missing IdToken or AccessToken"
      );
    });
  });

  describe("setNewPassword", () => {
    // 1. Mock successful respondToAuthChallenge response
    // 2. Call service.setNewPassword with test data
    // 3. Verify correct parameters passed to Cognito
    // 4. Verify returned access token
    it("should successfully set new password", async () => {
      const mockRespondToAuthChallenge = () => ({
        promise: () =>
          Promise.resolve({
            AuthenticationResult: {
              IdToken: "new-id-token",
            },
          }),
      });

      (service["cognito"] as any).respondToAuthChallenge =
        mockRespondToAuthChallenge;

      const result = await service.setNewPassword(
        "NewPass123!",
        "session123",
        "c4c",
        "c4c@gmail.com"
      );

      expect(result.access_token).toBe("new-id-token");
    });

    // 1. Mock Cognito to return response without IdToken
    // 2. Verify error is thrown
    it("should handle failed password setting", async () => {
      mockCognitoPromise.mockResolvedValueOnce({
        AuthenticationResult: {},
      });

      await expect(
        service.setNewPassword("NewPass123!", "s123", "c4c")
      ).rejects.toThrow("Failed to set new password");
    });

    // 1. Mock Cognito to throw error
    // 2. Verify error handling
    it("should handle Cognito errors", async () => {
      const mockRespondToAuthChallenge = () => ({
        promise: () => Promise.reject(new Error("Cognito Error")),
      });

      (service["cognito"] as any).respondToAuthChallenge =
        mockRespondToAuthChallenge;

      await expect(
        service.setNewPassword("NewPass123!", "s123", "c4c")
      ).rejects.toThrow("Cognito Error");
    });
  });

  describe("updateProfile", () => {
    // 1. Mock successful DynamoDB update
    // 2. Call service.updateProfile with test data
    // 3. Verify correct UpdateExpression and parameters
    it("should successfully update user profile", async () => {
      mockDynamoPromise.mockResolvedValueOnce({});

      await service.updateProfile(
        "c4c",
        "c4c@example.com",
        "Software Developer"
      );

      expect(mockDynamoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { userId: "c4c" },
          UpdateExpression:
            "SET email = :email, position_or_role = :position_or_role",
          ExpressionAttributeValues: {
            ":email": "c4c@example.com",
            ":position_or_role": "Software Developer",
          },
        })
      );
    });

    // 1. Mock DynamoDB to throw error
    // 2. Verify error handling
    it("should handle DynamoDB update errors", async () => {
  const mockUpdate = vi.fn().mockReturnValue({
    promise: vi.fn().mockRejectedValue(new Error("DB error"))
  });
  
  (service['dynamoDb'] as any).update = mockUpdate;

  await expect(
    service.updateProfile("c4c", "c4c@example.com", "Active")
  ).rejects.toThrow("DB error");
});
  });
});
