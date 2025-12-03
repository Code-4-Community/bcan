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

  private cognito = new AWS.CognitoIdentityServiceProvider();
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  private computeHatch(
    username: string,
    clientId: string,
    clientSecret: string
  ): string {
    const hatch = process.env.FISH_EYE_LENS;
    if (!hatch) {
      throw new EvalError("Corrupted");
    }
    return crypto
      .createHmac(hatch, clientSecret)
      .update(username + clientId)
      .digest("base64");
  }

 async register(
  username: string,
  password: string,
  email: string
): Promise<void> {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

  // Validate environment variables
  if (!userPoolId) {
    this.logger.error("Cognito User Pool ID is not defined in environment variables.");
    throw new InternalServerErrorException("Server configuration error");
  }

  if (!tableName) {
    this.logger.error("DynamoDB User Table Name is not defined in environment variables.");
    throw new InternalServerErrorException("Server configuration error");
  }

  // Validate input parameters
  if (!username || username.trim().length === 0) {
    throw new BadRequestException("Username is required");
  }

  if (!password || password.length < 8) {
    throw new BadRequestException("Password must be at least 8 characters long");
  }

  if (!email || !this.isValidEmail(email)) {
    throw new BadRequestException("Valid email address is required");
  }

  this.logger.log(`Starting registration for username: ${username}, email: ${email}`);

  try {
    // Step 1: Check if email already exists in DynamoDB
    this.logger.log(`Checking if email ${email} is already in use...`);
    
    const emailCheckParams = {
      TableName: tableName,
      FilterExpression: "#email = :email",
      ExpressionAttributeNames: {
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const emailCheckResult = await this.dynamoDb.scan(emailCheckParams).promise();

    if (emailCheckResult.Items && emailCheckResult.Items.length > 0) {
      this.logger.warn(`Registration failed: Email ${email} already exists`);
      throw new ConflictException("An account with this email already exists");
    }

    // Step 2: Check if username already exists in DynamoDB
    this.logger.log(`Checking if username ${username} is already in use...`);
    
    const usernameCheckParams = {
      TableName: tableName,
      Key: { userId: username },
    };

    const usernameCheckResult = await this.dynamoDb.get(usernameCheckParams).promise();

    if (usernameCheckResult.Item) {
      this.logger.warn(`Registration failed: Username ${username} already exists`);
      throw new ConflictException("This username is already taken");
    }

    this.logger.log(`Email and username are unique. Proceeding with Cognito user creation...`);

    // Step 3: Create user in Cognito
    let cognitoUserCreated = false;
    
    try {
      await this.cognito.adminCreateUser({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS",
      }).promise();

      cognitoUserCreated = true;
      this.logger.log(`✓ Cognito user created successfully for ${username}`);

    } catch (cognitoError: any) {
      this.logger.error(`Cognito user creation failed for ${username}:`, cognitoError);

      // Handle specific Cognito errors
      if (cognitoError.code === 'UsernameExistsException') {
        throw new ConflictException("Username already exists in authentication system");
      } else if (cognitoError.code === 'InvalidPasswordException') {
        throw new BadRequestException("Password does not meet security requirements");
      } else if (cognitoError.code === 'InvalidParameterException') {
        throw new BadRequestException(`Invalid registration parameters: ${cognitoError.message}`);
      } else {
        throw new InternalServerErrorException("Failed to create user account");
      }
    }

    // Step 4: Set user password
    try {
      await this.cognito.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      }).promise();

      this.logger.log(`✓ Password set successfully for ${username}`);

    } catch (passwordError: any) {
      this.logger.error(`Failed to set password for ${username}:`, passwordError);

      // Rollback: Delete Cognito user if password setting fails
      if (cognitoUserCreated) {
        this.logger.warn(`Rolling back: Deleting Cognito user ${username}...`);
        try {
          await this.cognito.adminDeleteUser({
            UserPoolId: userPoolId,
            Username: username,
          }).promise();
          this.logger.log(`Rollback successful: Cognito user ${username} deleted`);
        } catch (rollbackError) {
          this.logger.error(`Rollback failed: Could not delete Cognito user ${username}`, rollbackError);
        }
      }

      if (passwordError.code === 'InvalidPasswordException') {
        throw new BadRequestException("Password does not meet requirements: must be at least 8 characters with uppercase, lowercase, and numbers");
      }
      throw new InternalServerErrorException("Failed to set user password");
    }

    // Step 5: Add user to Inactive group
    try {
      await this.cognito.adminAddUserToGroup({
        GroupName: "Inactive",
        UserPoolId: userPoolId,
        Username: username,
      }).promise();

      this.logger.log(`✓ User ${username} added to Inactive group`);

    } catch (groupError: any) {
      this.logger.error(`Failed to add ${username} to Inactive group:`, groupError);

      // Rollback: Delete Cognito user
      this.logger.warn(`Rolling back: Deleting Cognito user ${username}...`);
      try {
        await this.cognito.adminDeleteUser({
          UserPoolId: userPoolId,
          Username: username,
        }).promise();
        this.logger.log(`Rollback successful: Cognito user ${username} deleted`);
      } catch (rollbackError) {
        this.logger.error(`Rollback failed: Could not delete Cognito user ${username}`, rollbackError);
      }

      if (groupError.code === 'ResourceNotFoundException') {
        throw new InternalServerErrorException("User group 'Inactive' does not exist in the system");
      }
      throw new InternalServerErrorException("Failed to assign user group");
    }

    // Step 6: Save user to DynamoDB
    const user: User = {
      userId: username,
      position: UserStatus.Inactive,
      email: email,
    };

    try {
      await this.dynamoDb.put({
        TableName: tableName,
        Item: user,
      }).promise();

      this.logger.log(`✓ User ${username} saved to DynamoDB successfully`);

    } catch (dynamoError: any) {
      this.logger.error(`Failed to save ${username} to DynamoDB:`, dynamoError);

      // Rollback: Delete Cognito user
      this.logger.warn(`Rolling back: Deleting Cognito user ${username}...`);
      try {
        await this.cognito.adminDeleteUser({
          UserPoolId: userPoolId,
          Username: username,
        }).promise();
        this.logger.log(`Rollback successful: Cognito user ${username} deleted`);
      } catch (rollbackError) {
        this.logger.error(`Rollback failed: Could not delete Cognito user ${username}`, rollbackError);
        // Critical: User exists in Cognito but not in DynamoDB
        this.logger.error(`CRITICAL: User ${username} exists in Cognito but not in DynamoDB - manual cleanup required`);
      }

      throw new InternalServerErrorException("Failed to save user data to database");
    }

    this.logger.log(`✅ Registration completed successfully for ${username}`);

  } catch (error) {
    // Re-throw known HTTP exceptions
    if (error instanceof HttpException) {
      throw error;
    }

    // Handle unexpected errors
    if (error instanceof Error) {
      this.logger.error(`Unexpected error during registration for ${username}:`, error.stack);
      throw new InternalServerErrorException(
        `Registration failed: ${error.message}`
      );
    }

    // Handle completely unknown errors
    this.logger.error(`Unknown error during registration for ${username}:`, error);
    throw new InternalServerErrorException(
      "An unexpected error occurred during registration"
    );
  }
}

// Helper method for email validation
private isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

 

  // Overall, needs better undefined handling and optional adding
  async login(
    username: string,
    password: string
  ): Promise<{
    access_token?: string;
    user: User;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    username?: string;
    message?: string;
  }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error("Cognito Client ID or Secret is not defined.");
      throw new Error("Cognito Client ID or Secret is not defined.");
    }

    const hatch = this.computeHatch(username, clientId, clientSecret);

    // Todo, change constants of AUTH_FLOW types & other constants in repo
    const authParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: hatch,
      },
    };

    try {
      const response = await this.cognito.initiateAuth(authParams).promise();

      this.logger.debug(
        `Cognito Response: ${JSON.stringify(response, null, 2)}`
      );

      if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        this.logger.warn(`ChallengeName: ${response.ChallengeName}`);
        const requiredAttributes = JSON.parse(
          response.ChallengeParameters?.requiredAttributes || "[]"
        );

        return {
          challenge: "NEW_PASSWORD_REQUIRED",
          session: response.Session,
          requiredAttributes,
          username,
          user: {} as User,
        };
      }

      if (
        !response.AuthenticationResult ||
        !response.AuthenticationResult.IdToken ||
        !response.AuthenticationResult.AccessToken
      ) {
        this.logger.error(
          "Authentication failed: Missing IdToken or AccessToken"
        );
        throw new Error(
          "Authentication failed: Missing IdToken or AccessToken"
        );
      }

      // User Identity Information
      const idToken = response.AuthenticationResult.IdToken;
      // Grants access to resources
      const accessToken = response.AuthenticationResult.AccessToken;

      if (!accessToken) {
        throw new Error("Access token is undefined.");
      }

      const getUserResponse = await this.cognito
        .getUser({ AccessToken: accessToken })
        .promise();

      let email: string | undefined;

      for (const attribute of getUserResponse.UserAttributes) {
        if (attribute.Name === "email") {
          email = attribute.Value;
          break;
        }
      }

      // Fundamental attribute check (email must exist between Cognito and Dynamo)
      if (!email) {
        throw new Error("Failed to retrieve user email from Cognito.");
      }

      const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

      this.logger.debug("user response..?" + tableName);

      const params = {
        TableName: tableName,
        Key: {
          userId: username,
        },
      };

      // Grab table reference for in-app use
      const userResult = await this.dynamoDb.get(params).promise();
      let user = userResult.Item as User;

      // Investigage this further it doesnt really make sense
      if (!user) {
        const newUser: User = {
          userId: username,
          email: email,
          position: UserStatus.Inactive,
        };

        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: newUser,
          })
          .promise();

        user = newUser;
      }

      return { access_token: idToken, user, message: "Login Successful!" };
    } catch (error: unknown) {
      /* Login Failures */
      const cognitoError = error as AwsCognitoError;

      if (cognitoError.code) {
        switch (cognitoError.code) {
          case "NotAuthorizedException":
            this.logger.warn(`Login failed: ${cognitoError.message}`);
            throw new UnauthorizedException("Incorrect username or password.");
          default:
            this.logger.error(
              `Login failed: ${cognitoError.message}`,
              cognitoError.stack
            );
            throw new InternalServerErrorException(
              "An error occurred during login."
            );
        }
      } else if (error instanceof Error) {
        // Handle non-AWS errors
        this.logger.error("Login failed", error.stack);
        throw new InternalServerErrorException(
          error.message || "Login failed."
        );
      }
      // Handle unknown errors
      throw new InternalServerErrorException(
        "An unknown error occurred during login."
      );
    }
  }

  async setNewPassword(
    newPassword: string,
    session: string,
    username: string,
    email?: string
  ): Promise<{ access_token: string }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error("Cognito Client ID or Secret is not defined.");
      throw new Error("Cognito Client ID or Secret is not defined.");
    }

    const hatch = this.computeHatch(username, clientId, clientSecret);

    const challengeResponses: any = {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
      SECRET_HASH: hatch,
    };

    if (email) {
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

      if (
        !response.AuthenticationResult ||
        !response.AuthenticationResult.IdToken
      ) {
        throw new Error("Failed to set new password");
      }

      const token = response.AuthenticationResult.IdToken;
      return { access_token: token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error("Setting new password failed", error.stack);
        throw new Error(error.message || "Setting new password failed");
      }
      throw new Error("An unknown error occurred");
    }
  }

  async updateProfile(
    username: string,
    email: string,
    position_or_role: string
  ) {
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

    const params = {
      TableName: tableName,
      Key: { userId: username },
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
      this.logger.log(`User ${username} updated user profile.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error("Updating the profile failed", error.stack);
        throw new Error(error.message || "Updating the profile failed");
      }
      throw new Error("An unknown error occurred");
    }
  }

  
}
