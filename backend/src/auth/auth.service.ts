import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import * as AWS from "aws-sdk";
import { group, table } from "console";
import * as crypto from "crypto";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private cognito;
  private dynamoDb;

  private computeHatch(
    email: string,
    clientId: string,
    clientSecret: string,
  ): string {
    const hatch = process.env.FISH_EYE_LENS;
    if (!hatch) {
      throw new EvalError("Corrupted");
    }
    return crypto
      .createHmac(hatch, clientSecret)
      .update(email + clientId)
      .digest("base64");
  }

  constructor() {
    try {
      this.logger.log("Starting AuthService constructor...");
      this.logger.log("AWS module:", typeof AWS);
      this.logger.log(
        "AWS.CognitoIdentityServiceProvider:",
        typeof AWS.CognitoIdentityServiceProvider,
      );

      this.cognito = new AWS.CognitoIdentityServiceProvider();
      this.logger.log("Cognito initialized successfully");

      this.dynamoDb = new AWS.DynamoDB.DocumentClient();
      this.logger.log("DynamoDB initialized successfully");

      this.logger.log("AuthService constructor completed");
    } catch (error) {
      this.logger.error("FATAL: AuthService constructor failed:", error);
      throw error;
    }
  }

  // purpose statement: registers an user into cognito and dynamodb
  // use case: new employee is joining
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

    if (!userPoolId) {
      this.logger.error(
        "Cognito User Pool ID is not defined in environment variables.",
      );
      throw new InternalServerErrorException("Server configuration error");
    }

    if (!tableName) {
      this.logger.error(
        "DynamoDB User Table Name is not defined in environment variables.",
      );
      throw new InternalServerErrorException("Server configuration error");
    }

    if (!email || !this.isValidEmail(email)) {
      this.logger.error("Registration failed: Valid email address is required");
      throw new BadRequestException("Valid email address is required");
    }

    if (!password || password.length < 8) {
      this.logger.error(
        "Registration failed: Password must be at least 8 characters long",
      );
      throw new BadRequestException(
        "Password must be at least 8 characters long",
      );
    }

    this.logger.log(`Starting registration for email: ${email}`);

    try {
      // Step 1: Create user in Cognito using email as the username
      let cognitoSub: string | undefined;
      let cognitoUserCreated = false;

      try {
        const createUserResponse = await this.cognito
          .adminCreateUser({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
              { Name: "email", Value: email },
              { Name: "email_verified", Value: "true" },
            ],
            MessageAction: "SUPPRESS",
          })
          .promise();

        // Extract the sub from the created user's attributes
        cognitoSub = createUserResponse.User?.Attributes?.find(
          (attr) => attr.Name === "sub",
        )?.Value;

        if (!cognitoSub) {
          throw new InternalServerErrorException(
            "Failed to retrieve user ID after creation",
          );
        }

        cognitoUserCreated = true;
        this.logger.log(
          `✓ Cognito user created successfully for ${email}, sub: ${cognitoSub}`,
        );
      } catch (cognitoError: any) {
        if (cognitoError instanceof HttpException) throw cognitoError;
        this.logger.error(
          `Cognito user creation failed for ${email}:`,
          cognitoError,
        );

        if (cognitoError.code === "UsernameExistsException") {
          throw new ConflictException(
            "An account with this email already exists",
          );
        } else if (cognitoError.code === "InvalidPasswordException") {
          throw new BadRequestException(
            "Password does not meet security requirements",
          );
        } else if (cognitoError.code === "InvalidParameterException") {
          throw new BadRequestException(
            `Invalid registration parameters: ${cognitoError.message}`,
          );
        } else {
          throw new InternalServerErrorException(
            "Failed to create user account",
          );
        }
      }

      // Step 2: Set user password
      try {
        await this.cognito
          .adminSetUserPassword({
            UserPoolId: userPoolId,
            Username: email,
            Password: password,
            Permanent: true,
          })
          .promise();

        this.logger.log(`✓ Password set successfully for ${email}`);
      } catch (passwordError: any) {
        this.logger.error(
          `Failed to set password for ${email}:`,
          passwordError,
        );

        if (cognitoUserCreated) {
          await this.rollbackCognitoUser(userPoolId, email);
        }

        if (passwordError.code === "InvalidPasswordException") {
          throw new BadRequestException(
            "Password does not meet requirements: must be at least 8 characters with uppercase, lowercase, and numbers",
          );
        }
        throw new InternalServerErrorException("Failed to set user password");
      }

      // Step 3: Add user to Inactive group
      try {
        await this.cognito
          .adminAddUserToGroup({
            GroupName: "Inactive",
            UserPoolId: userPoolId,
            Username: email,
          })
          .promise();

        this.logger.log(`✓ User ${email} added to Inactive group`);
      } catch (groupError: any) {
        this.logger.error(
          `Failed to add ${email} to Inactive group:`,
          groupError,
        );
        await this.rollbackCognitoUser(userPoolId, email);

        if (groupError.code === "ResourceNotFoundException") {
          throw new InternalServerErrorException(
            "User group 'Inactive' does not exist in the system",
          );
        }
        throw new InternalServerErrorException("Failed to assign user group");
      }

      // Step 4: Save user to DynamoDB using email as the key
      const user: User = {
        position: UserStatus.Inactive,
        email: email,
        firstName: firstName,
        lastName: lastName,
      };

      try {
        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: user,
          })
          .promise();

        this.logger.log(`✓ User ${email} saved to DynamoDB successfully`);
      } catch (dynamoError: any) {
        this.logger.error(`Failed to save ${email} to DynamoDB:`, dynamoError);
        await this.rollbackCognitoUser(userPoolId, email);
        throw new InternalServerErrorException(
          "Failed to save user data to database",
        );
      }

      this.logger.log(`✅ Registration completed successfully for ${email}`);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        this.logger.error(
          `Unexpected error during registration for ${email}:`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Unknown error during registration for ${email}:`,
          error,
        );
      }

      throw new InternalServerErrorException("Internal Server Error");
    }
  }

  // Helper to avoid repeating rollback logic
  private async rollbackCognitoUser(
    userPoolId: string,
    email: string,
  ): Promise<void> {
    this.logger.warn(`Rolling back: Deleting Cognito user ${email}...`);
    try {
      await this.cognito
        .adminDeleteUser({
          UserPoolId: userPoolId,
          Username: email,
        })
        .promise();
      this.logger.log(`Rollback successful: Cognito user ${email} deleted`);
    } catch (rollbackError) {
      this.logger.error(
        `Rollback failed: Could not delete Cognito user ${email}`,
        rollbackError,
      );
      this.logger.error(
        `CRITICAL: User ${email} exists in Cognito but not in DynamoDB - manual cleanup required`,
      );
    }
  }

  // Helper method for email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // purpose statement: logs in an user via cognito and retrieves user data from dynamodb
  // use case: employee is trying to access the app, needs to have an account already

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token?: string;
    refreshToken?: string;
    user: User;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    message?: string;
    idToken?: string;
  }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error("Cognito Client ID or Secret is not defined.");
      throw new Error("Cognito Client ID or Secret is not defined.");
    }

    if (!email || email.trim().length === 0) {
      this.logger.error("Login failed: Email is required");
      throw new BadRequestException("Email is required");
    }

    if (!password || password.length === 0) {
      this.logger.error("Login failed: Password is required");
      throw new BadRequestException("Password is required");
    }

    // Cognito uses email as the USERNAME when pool is configured with username-attributes: email
    const hatch = this.computeHatch(email, clientId, clientSecret);

    const authParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: hatch,
      },
    };

    try {
      const response = await this.cognito.initiateAuth(authParams).promise();

      this.logger.debug(
        `Cognito Response: ${JSON.stringify(response, null, 2)}`,
      );

      if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        this.logger.warn(`ChallengeName: ${response.ChallengeName}`);
        const requiredAttributes = JSON.parse(
          response.ChallengeParameters?.requiredAttributes || "[]",
        );

        return {
          challenge: "NEW_PASSWORD_REQUIRED",
          session: response.Session,
          requiredAttributes,
          user: {} as User,
        };
      }

      if (
        !response.AuthenticationResult ||
        !response.AuthenticationResult.IdToken ||
        !response.AuthenticationResult.AccessToken
      ) {
        this.logger.error(
          "Authentication failed: Missing IdToken or AccessToken",
        );
        throw new Error(
          "Authentication failed: Missing IdToken or AccessToken",
        );
      }

      const accessToken = response.AuthenticationResult.AccessToken;
      const refreshToken = response.AuthenticationResult.RefreshToken;
      const idToken = response.AuthenticationResult.IdToken;

      if (!accessToken) {
        throw new Error("Access token is undefined.");
      }

      const getUserResponse = await this.cognito
        .getUser({ AccessToken: accessToken })
        .promise();

      // Pull the Cognito sub (unique user ID) to use as DynamoDB key
      let sub: string | undefined;
      let resolvedEmail: string | undefined;

      for (const attribute of getUserResponse.UserAttributes) {
        if (attribute.Name === "sub") sub = attribute.Value;
        if (attribute.Name === "email") resolvedEmail = attribute.Value;
      }

      if (!resolvedEmail) {
        throw new Error("Failed to retrieve user email from Cognito.");
      }

      if (!sub) {
        throw new Error("Failed to retrieve user sub from Cognito.");
      }

      const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

      // Use sub as the DynamoDB key instead of username
      const params = {
        TableName: tableName,
        Key: {
          email: email,
        },
      };

      const userResult = await this.dynamoDb.get(params).promise();
      let user = userResult.Item as User;

      if (!user) {
        const newUser: User = {
          email: resolvedEmail,
          position: UserStatus.Inactive,
          firstName: "",
          lastName: "",
        };

        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: newUser,
          })
          .promise();

        user = newUser;
      }

      return {
        access_token: accessToken,
        user,
        refreshToken,
        idToken,
        message: "Login Successful!",
      };
    } catch (error: unknown) {
      const cognitoError = error as AwsCognitoError;

      if (cognitoError.code) {
        switch (cognitoError.code) {
          case "NotAuthorizedException":
            this.logger.error(`Login failed: ${cognitoError.message}`);
            throw new UnauthorizedException("Incorrect email or password.");
          default:
            this.logger.error(
              `Login failed: ${cognitoError.message}`,
              cognitoError.stack,
            );
            throw new InternalServerErrorException(
              "An error occurred during login.",
            );
        }
      } else if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof Error) {
        this.logger.error("Login failed", error.stack);
        throw new InternalServerErrorException(
          error.message || "Login failed.",
        );
      }

      this.logger.error(
        `Login failed for user ${email} with unknown error type`,
        error,
      );
      throw new InternalServerErrorException(
        "An unknown error occurred during login.",
      );
    }
  }

  // purpose statement: sets a new password for an user in cognito
  // use case: employee changing password after forgetting password
  async setNewPassword(
    newPassword: string,
    session: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error("Cognito Client ID or Secret is not defined.");
      throw new Error("Cognito Client ID or Secret is not defined.");
    }

    // Validate input parameters for newPassword, session, and username
    if (!newPassword || newPassword.length === 0) {
      this.logger.error("Set New Password failed: New password is required");
      throw new BadRequestException("New password is required");
    }

    if (!session || session.length === 0) {
      this.logger.error("Set New Password failed: Session is required");
      throw new BadRequestException("Session is required");
    }

   

    const hatch = this.computeHatch(email, clientId, clientSecret);

    const challengeResponses: any = {
      USERNAME: email,
      NEW_PASSWORD: newPassword,
      SECRET_HASH: hatch,
    };

    if (email) {
      this.logger.log("Including email in challenge responses");
      challengeResponses.email = email;
    }

    const params = {
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId: clientId,
      ChallengeResponses: challengeResponses,
      Session: session,
    };

    try {
      const response = await this.cognito
        .respondToAuthChallenge(params)
        .promise();
      this.logger.log("Responded to auth challenge for new password");

      if (
        !response.AuthenticationResult ||
        !response.AuthenticationResult.IdToken
      ) {
        throw new Error("Failed to set new password");
      }

      const token = response.AuthenticationResult.IdToken;
      this.logger.log(`New password set successfully for user ${email}`);
      return { access_token: token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error("Setting new password failed", error.stack);
        throw new Error(error.message || "Setting new password failed");
      }
      throw new Error("An unknown error occurred");
    }
  }

  // purpose statement: updates user profile info in dynamodb
  // use case: employee is updating their profile information
  async updateProfile(email: string, position_or_role: string) {
    // Validate input parameters for username, email, and position_or_role

    if (!email || email.trim().length === 0 || !this.isValidEmail(email)) {
      this.logger.error("Update Profile failed: Email is required");
      throw new BadRequestException("Email is required");
    }

    if (!position_or_role || position_or_role.trim().length === 0) {
      this.logger.error("Update Profile failed: Position or role is required");
      throw new BadRequestException("Position or role is required");
    }
    this.logger.log(`Updating profile for user ${email}`);
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

    const params = {
      TableName: tableName,
      Key: { email: email },
      // Update both fields in one go:
      UpdateExpression:
        "SET email = :email, position_or_role = :position_or_role",
      ExpressionAttributeValues: {
        ":email": email,
        ":position_or_role": position_or_role,
      },
      // Optional: return the newly updated item if you want to use it
      // ReturnValues: 'ALL_NEW',
    };

    try {
      await this.dynamoDb.update(params).promise();
      this.logger.log(`User ${email} updated user profile.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error("Updating the profile failed", error.stack);
        throw new Error(error.message || "Updating the profile failed");
      }
      throw new Error("An unknown error occurred");
    }
  }

  // Add this to auth.service.ts

  // purpose statement: validates a user's session token via cognito and retrieves user data from dynamodb
  // use case: employee is accessing the app with an existing session token
  async validateSession(accessToken: string): Promise<any> {
    try {
      const getUserResponse = await this.cognito
        .getUser({ AccessToken: accessToken })
        .promise();

      let email: string | undefined;

      // Extract email from user attributes
      for (const attribute of getUserResponse.UserAttributes) {
        if (attribute.Name === "email") {
          email = attribute.Value;
          break;
        }
      }

      if (!email) {
        this.logger.error(
          "Failed to extract email from Cognito user attributes",
        );
        throw new Error("Failed to retrieve user email from token");
      }

      // Get user from DynamoDB using email as the partition key
      const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";
      const params = {
        TableName: tableName,
        Key: {
          email: email,
        },
      };

      const userResult = await this.dynamoDb.get(params).promise();
      const user = userResult.Item;

      if (!user) {
        this.logger.error(`User not found in database for email: ${email}`);
        throw new Error("User not found in database");
      }

      this.logger.log(`Session validated successfully for user ${email}`);
      return user;
    } catch (error: unknown) {
      this.logger.error("Session validation failed", error);

      const cognitoError = error as AwsCognitoError;
      if (cognitoError.code === "NotAuthorizedException") {
        throw new UnauthorizedException("Session expired or invalid");
      }

      throw new UnauthorizedException("Failed to validate session");
    }
  }
}
