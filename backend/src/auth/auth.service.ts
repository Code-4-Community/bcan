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

  // purpose statement: logs out a user by invalidating their Cognito session
  async logout(accessToken: string): Promise<void> {
    try {
      await this.cognito
        .globalSignOut({
          AccessToken: accessToken,
        })
        .promise();

      this.logger.log('User signed out successfully from Cognito');
    } catch (error) {
      this.logger.error('Error during Cognito sign out:', error);
      // Don't throw error since we still clear cookies in controller
      // This handles cases where token is already expired
    }
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

  // purpose statement: changes the password for a logged-in user in Cognito
  // use case: employee updates their password from the settings page
  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!accessToken || accessToken.trim().length === 0) {
      this.logger.error("Change Password failed: Access token is required");
      throw new BadRequestException("Access token is required");
    }

    if (!currentPassword || currentPassword.length === 0) {
      this.logger.error("Change Password failed: Current password is required");
      throw new BadRequestException("Current password is required");
    }

    if (!newPassword || newPassword.length < 8) {
      this.logger.error(
        "Change Password failed: New password must be at least 8 characters long",
      );
      throw new BadRequestException(
        "New password must be at least 8 characters long",
      );
    }

    try {
      await this.cognito
        .changePassword({
          AccessToken: accessToken,
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword,
        })
        .promise();

      this.logger.log("Password changed successfully for current user");
    } catch (error: any) {
      this.logger.error("Error changing password in Cognito:", error);

      if (error.code === "NotAuthorizedException") {
        throw new UnauthorizedException("Current password is incorrect");
      }

      if (error.code === "InvalidPasswordException") {
        throw new BadRequestException(
          "New password does not meet security requirements",
        );
      }

      throw new InternalServerErrorException("Failed to change password");
    }
  }

  // purpose statement: updates user's email in Cognito and email/firstName/lastName in DynamoDB
  // use case: employee is updating their profile information
async updateProfile(
  accessToken: string,
  newEmail: string,
  firstName: string,
  lastName: string,
) {
  if (!accessToken || accessToken.trim().length === 0) {
    this.logger.error("Update Profile failed: Access token is required");
    throw new BadRequestException("Access token is required");
  }

  if (
    !newEmail ||
    newEmail.trim().length === 0 ||
    !this.isValidEmail(newEmail)
  ) {
    this.logger.error("Update Profile failed: Valid email is required");
    throw new BadRequestException("Valid email is required");
  }

  if (!firstName || firstName.trim().length === 0) {
    this.logger.error("Update Profile failed: First name is required");
    throw new BadRequestException("First name is required");
  }

  if (!lastName || lastName.trim().length === 0) {
    this.logger.error("Update Profile failed: Last name is required");
    throw new BadRequestException("Last name is required");
  }

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

  if (!userPoolId) {
    this.logger.error("Cognito User Pool ID is not defined in environment variables.");
    throw new InternalServerErrorException("Server configuration error");
  }

  if (!tableName) {
    this.logger.error("DynamoDB User Table Name is not defined in environment variables.");
    throw new InternalServerErrorException("Server configuration error");
  }

  try {
    const getUserResponse = await this.cognito
      .getUser({ AccessToken: accessToken })
      .promise();

    // Extract the stable Cognito username (never changes, even when email changes)
    const cognitoUsername = getUserResponse.Username;

    let currentEmail: string | undefined;
    for (const attribute of getUserResponse.UserAttributes) {
      if (attribute.Name === "email") {
        currentEmail = attribute.Value;
        break;
      }
    }

    if (!currentEmail) {
      this.logger.error("Failed to extract current email from Cognito user attributes");
      throw new InternalServerErrorException(
        "Failed to retrieve current email from authentication system",
      );
    }

    this.logger.log(`Updating profile for user. cognitoUsername=${cognitoUsername}, currentEmail=${currentEmail}, newEmail=${newEmail}`);

    const existingUserResult = await this.dynamoDb
      .get({
        TableName: tableName,
        Key: { email: currentEmail },
      })
      .promise();

    if (!existingUserResult.Item) {
      this.logger.error(`User not found in DynamoDB for email: ${currentEmail}`);
      throw new BadRequestException("User not found in database");
    }

    const existingUser = existingUserResult.Item as User;
    const normalizedCurrentEmail = currentEmail.toLowerCase();
    const normalizedNewEmail = newEmail.toLowerCase();
    const isEmailChanging = normalizedNewEmail !== normalizedCurrentEmail;

    // ── Step 1: Update Cognito first ──────────────────────────────────────────
    if (isEmailChanging) {
      try {
        // Update the email attribute using the user's access token
        await this.cognito
          .updateUserAttributes({
            AccessToken: accessToken,
            UserAttributes: [{ Name: "email", Value: newEmail }],
          })
          .promise();

        this.logger.log(`✓ Cognito email attribute updated from ${currentEmail} to ${newEmail}`);

        // Mark email as verified using admin call with the stable cognitoUsername
        await this.cognito
          .adminUpdateUserAttributes({
            UserPoolId: userPoolId,
            Username: cognitoUsername,
            UserAttributes: [{ Name: "email_verified", Value: "true" }],
          })
          .promise();

        this.logger.log(`✓ Cognito email_verified set to true for ${cognitoUsername}`);
      } catch (cognitoError: any) {
        this.logger.error(
          `Failed to update Cognito email from ${currentEmail} to ${newEmail}:`,
          cognitoError,
        );

        if (cognitoError.code === "UsernameExistsException") {
          throw new ConflictException("An account with this email already exists");
        } else if (cognitoError.code === "AliasExistsException") {
          throw new ConflictException("This email is already in use by another account");
        } else if (cognitoError.code === "InvalidParameterException") {
          throw new BadRequestException(`Invalid email: ${cognitoError.message}`);
        }

        throw new InternalServerErrorException(
          "Failed to update email in authentication system",
        );
      }
    }

    // ── Step 2: Update DynamoDB ───────────────────────────────────────────────
    const updatedUser: User = {
      ...existingUser,
      email: newEmail,
      firstName,
      lastName,
    };

    this.logger.log(`PRE-TRANSACTION: currentEmail=${currentEmail}, newEmail=${newEmail}`);
    this.logger.log(`PRE-TRANSACTION: updatedUser=${JSON.stringify(updatedUser)}`);

    try {
      if (!isEmailChanging) {
        await this.dynamoDb
          .update({
            TableName: tableName,
            Key: { email: currentEmail },
            UpdateExpression: "SET firstName = :firstName, lastName = :lastName",
            ExpressionAttributeValues: {
              ":firstName": firstName,
              ":lastName": lastName,
            },
            ReturnValues: "NONE",
          })
          .promise();

        this.logger.log(`✓ DynamoDB updated name fields for ${currentEmail}`);
      } else {
        try {
          const result = await this.dynamoDb
            .transactWrite({
              TransactItems: [
                {
                  Put: {
                    TableName: tableName,
                    Item: updatedUser,
                    ConditionExpression: "attribute_not_exists(email)",
                  },
                },
                {
                  Delete: {
                    TableName: tableName,
                    Key: { email: currentEmail },
                    ConditionExpression: "attribute_exists(email)",
                  },
                },
              ],
            })
            .promise();

          this.logger.log(`✓ TRANSACTION SUCCESS: ${JSON.stringify(result)}`);
        } catch (transactionError: any) {
          this.logger.error(`✗ TRANSACTION FAILED: code=${transactionError.code}`);
          this.logger.error(`✗ TRANSACTION FAILED: message=${transactionError.message}`);
          if (transactionError.CancellationReasons) {
            this.logger.error(
              `✗ CANCELLATION REASONS: ${JSON.stringify(transactionError.CancellationReasons)}`,
            );
          }
          throw transactionError;
        }
      }

      this.logger.log(`✓ User profile updated in DynamoDB for email ${newEmail}`);
    } catch (dynamoError: any) {
      this.logger.error(
        `✗ Failed to update DynamoDB for ${currentEmail} -> ${newEmail}:`,
        dynamoError,
      );

      // ── Rollback Cognito if email was changed ─────────────────────────────
      if (isEmailChanging) {
        this.logger.log(`Attempting Cognito rollback: reverting email back to ${currentEmail}`);
        try {
          // Revert the email attribute back to the original
          await this.cognito
            .updateUserAttributes({
              AccessToken: accessToken,
              UserAttributes: [{ Name: "email", Value: currentEmail }],
            })
            .promise();

          this.logger.log(`✓ Cognito email reverted to ${currentEmail}`);

          // Re-verify the original email using stable cognitoUsername
          await this.cognito
            .adminUpdateUserAttributes({
              UserPoolId: userPoolId,
              Username: cognitoUsername,
              UserAttributes: [{ Name: "email_verified", Value: "true" }],
            })
            .promise();

          this.logger.log(`✓ Rollback successful: Cognito email fully reverted to ${currentEmail}`);
        } catch (rollbackError: any) {
          this.logger.error(
            `✗ CRITICAL: Rollback failed - Cognito has ${newEmail} but DynamoDB still has ${currentEmail}. Manual sync required.`,
            rollbackError,
          );
          throw new InternalServerErrorException(
            "A critical sync error occurred. Please contact support.",
          );
        }
      }

      // Throw appropriate error after rollback
      if (dynamoError.code === "TransactionCanceledException") {
        const reasons = dynamoError.CancellationReasons ?? [];
        const putFailed = reasons[0]?.Code !== "None";
        const deleteFailed = reasons[1]?.Code !== "None";

        if (putFailed) {
          throw new ConflictException(
            "An account with this email already exists in the database",
          );
        }
        if (deleteFailed) {
          throw new InternalServerErrorException(
            "Failed to remove old user record during email update",
          );
        }
        throw new ConflictException(
          "User data was modified by another process or new email already exists",
        );
      } else if (dynamoError.code === "ResourceNotFoundException") {
        this.logger.error("DynamoDB table does not exist");
        throw new InternalServerErrorException("Database table not found");
      } else if (dynamoError.code === "ValidationException") {
        this.logger.error("Invalid DynamoDB update parameters");
        throw new BadRequestException("Invalid update parameters");
      }

      throw new InternalServerErrorException("Failed to update user data in database");
    }
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Error) {
      this.logger.error("Updating the profile failed", error.stack);
      throw new InternalServerErrorException(
        error.message || "Updating the profile failed",
      );
    }

    throw new InternalServerErrorException("Updating the profile failed");
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

  // purpose statement: uses a valid refresh token to get a new access & id token
  // use case: a logged in user's access token has expired and needs to be refreshed
  // without re-athenticating
  async refreshTokens(refreshToken: string, cognitoUsername: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken?: string;
}> {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    this.logger.error('Cognito Client ID or Secret is not defined.');
    throw new InternalServerErrorException('Server configuration error');
  }

  if (!refreshToken) {
    this.logger.error('Token refresh failed: no refresh token provided');
    throw new UnauthorizedException('No refresh token provided');
  }

  if (!cognitoUsername) {
    this.logger.error('Token refresh failed: could not determine user identity');
    throw new UnauthorizedException('Could not determine user identity');
  }

  this.logger.log(`Starting token refresh for user: ${cognitoUsername}`);

  const hatch = this.computeHatch(cognitoUsername, clientId, clientSecret);

  const params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      SECRET_HASH: hatch,
    },
  };

  try {
    const response = await this.cognito.initiateAuth(params).promise();

    this.logger.debug(`Cognito refresh response: ${JSON.stringify(response, null, 2)}`);

    if (
      !response.AuthenticationResult?.AccessToken ||
      !response.AuthenticationResult?.IdToken
    ) {
      this.logger.error('Token refresh failed: Cognito response missing AccessToken or IdToken');
      throw new InternalServerErrorException('Failed to refresh tokens');
    }

    this.logger.log(`Tokens refreshed successfully for user: ${cognitoUsername}`);

    const newRefreshToken = response.AuthenticationResult?.RefreshToken;

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: newRefreshToken,
    };
  } catch (error: unknown) {
    const cognitoError = error as AwsCognitoError;

    if (cognitoError.code === 'NotAuthorizedException') {
      this.logger.error(`Token refresh failed for ${cognitoUsername}: refresh token is expired or invalid`);
      throw new UnauthorizedException('Refresh token is expired or invalid');
    }

    this.logger.error(`Token refresh for ${cognitoUsername}`, (error as Error).stack);
    throw new InternalServerErrorException('Failed to refresh tokens');
  }
}
}
