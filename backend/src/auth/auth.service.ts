import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import AWS from "aws-sdk";
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

    if (!userPoolId) {
      this.logger.error("Cognito User Pool ID is not defined.");
      throw new Error("Cognito User Pool ID is not defined.");
    }

    try {
      // Check to see if the inputted email already exists in the user table
      this.logger.log(`Checking if email ${email} is already in use.`);
      const paramEmailCheck = {
        TableName: process.env.DYNAMODB_USER_TABLE_NAME as string,
        FilterExpression: "#email = :email",
        ExpressionAttributeNames: {
          "#email": "email",
        },
        ExpressionAttributeValues: {
          ":email": email,
        },
      };
      let uniqueEmailCheck = await this.dynamoDb
        .scan(paramEmailCheck)
        .promise();

      if (uniqueEmailCheck.Items && uniqueEmailCheck.Items.length > 0) {
        throw new ConflictException("Email already in use."); // 409 status
      }
      this.logger.log(`Email ${email} is unique. Proceeding with registration.`);
      let createUserRes = await this.cognito
        .adminCreateUser({
          UserPoolId: userPoolId,
          Username: username,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
          ],
          MessageAction: "SUPPRESS",
        })
        .promise();
        this.logger.log(`Cognito user created:`);
      await this.cognito
        .adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        })
        .promise();
        this.logger.log(`Password set for user ${username}.`);
      await this.cognito.adminAddUserToGroup({
        GroupName: "Inactive",
        UserPoolId: userPoolId,
        Username: username,
      });
      this.logger.log(`User ${username} added to Inactive group.`);
      const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

      // Change this so it adds a user object
      const user: User = {
        userId: username,
        position: UserStatus.Inactive,
        email: email,
        name: "",
      };

      // Spread operator to add the user object
      const params = {
        TableName: tableName,
        Item: {
          ...user,
        },
      };

      await this.dynamoDb.put(params).promise();

      this.logger.log(
        `User ${username} registered successfully and added to DynamoDB.`
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.error("Email already in user", error.stack);
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error("Registration failed", error.stack);
        throw new Error(error.message || "Registration failed");
      }
      throw new Error("An unknown error occurred during registration");
    }
  }

  async addUserToGroup(username: string, groupName: string, requestedBy : string): Promise<void> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (
      groupName !== "Employee" &&
      groupName !== "Admin" &&
      groupName !== "Inactive"
    ) {
      throw new Error(
        "Invalid group name. Must be Employee, Admin, or Inactive."
      );
    }
    try {
      await this.cognito.adminAddUserToGroup({
        GroupName: groupName,
        UserPoolId: userPoolId || "POOL_FAILURE",
        Username: username,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("Registration failed", error.stack);
        throw new Error(error.message || "Registration failed");
      }
      throw new Error("An unknown error occurred during registration");
    }
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
          name: "",
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

  async deleteUser(username: string): Promise<void> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE";

    if (!userPoolId) {
      this.logger.error("Cognito User Pool ID is not defined.");
      throw new Error("Cognito User Pool ID is not defined.");
    }
    try {
      await this.cognito.adminDeleteUser({
        UserPoolId: userPoolId,
        Username: username,
      });
      const params = {
        TableName: tableName,
        Key: {
          userId: username, // Your partition key
        },
      };

      await this.dynamoDb.delete(params).promise();
      this.logger.log(
        `User ${username} deleted successfully from Cognito and DynamoDB.`
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("Deletion failed", error.stack);
        throw new Error(error.message || "Deletion failed");
      }
    }
  }
}
