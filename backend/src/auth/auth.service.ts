import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import * as crypto from 'crypto';
import { BADFAMILY } from 'dns/promises';

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private cognito = new AWS.CognitoIdentityServiceProvider();
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  private computeSecretHash(
    username: string,
    clientId: string,
    clientSecret: string,
  ): string {
    const hatch = process.env.FISH_EYE_LENS
    if (!hatch) {
      throw new EvalError("Corrupted")
    }
    return crypto
      .createHmac(hatch, clientSecret)
      .update(username + clientId)
      .digest('base64');
  }

  async register(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!userPoolId) {
      this.logger.error('Cognito User Pool ID is not defined.');
      throw new Error('Cognito User Pool ID is not defined.');
    }

    try {
      // Create the user in Cognito
      await this.cognito
        .adminCreateUser({
          UserPoolId: userPoolId,
          Username: username,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        })
        .promise();

      // Set the user's password
      await this.cognito
        .adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        })
        .promise();

      // Create a new user record in DynamoDB
      const tableName = process.env.DYNAMODB_TABLE_NAME || 'BCANBeings';

      const params = {
        TableName: tableName,
        Item: {
          userId: username,
          email: email,
          biography: '',
        },
      };

      await this.dynamoDb.put(params).promise();

      this.logger.log(
        `User ${username} registered successfully and added to DynamoDB.`,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Registration failed', error.stack);
        throw new Error(error.message || 'Registration failed');
      }
      throw new Error('An unknown error occurred during registration');
    }
  }

  async login(username: string, password: string): Promise<{
    access_token?: string;
    user?: any;
    session?: string;
    challenge?: string;
    requiredAttributes?: string[];
    username?: string;
  }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  
    if (!clientId || !clientSecret) {
      this.logger.error('Cognito Client ID or Secret is not defined.');
      throw new Error('Cognito Client ID or Secret is not defined.');
    }
  
    const secretHash = this.computeSecretHash(username, clientId, clientSecret);
  
    const authParams = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };
  
    try {
      const response = await this.cognito.initiateAuth(authParams).promise();
  
      this.logger.debug(`Cognito Response: ${JSON.stringify(response, null, 2)}`);
  
      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        this.logger.warn(`ChallengeName: ${response.ChallengeName}`);
        const requiredAttributes = JSON.parse(
          response.ChallengeParameters?.requiredAttributes || '[]',
        );
  
        return {
          challenge: 'NEW_PASSWORD_REQUIRED',
          session: response.Session,
          requiredAttributes,
          username,
        };
      }
  
      if (
        !response.AuthenticationResult ||
        !response.AuthenticationResult.IdToken ||
        !response.AuthenticationResult.AccessToken
      ) {
        this.logger.error('Authentication failed: Missing IdToken or AccessToken');
        throw new Error('Authentication failed: Missing IdToken or AccessToken');
      }
  
      const idToken = response.AuthenticationResult.IdToken;
      const accessToken = response.AuthenticationResult.AccessToken;

      // Retrieve user's email using getUser if AccessToken is valid
      if (!accessToken) {
        throw new Error('Access token is undefined.');
      }

      const getUserResponse = await this.cognito
        .getUser({ AccessToken: accessToken })
        .promise();
  
      let email: string | undefined;
  
      for (const attribute of getUserResponse.UserAttributes) {
        if (attribute.Name === 'email') {
          email = attribute.Value;
          break;
        }
      }
  
      if (!email) {
        throw new Error('Failed to retrieve user email from Cognito.');
      }
  
      // Fetch user data from DynamoDB
      const tableName = process.env.DYNAMODB_TABLE_NAME || 'BCANBeings';
  
      const params = {
        TableName: tableName,
        Key: {
          userId: username, // Ensure this matches the DynamoDB table's partition key (adjust if necessary)
        },
      };
  
      const userResult = await this.dynamoDb.get(params).promise();
      let user = userResult.Item;
  
      if (!user) {
        // User not found, create a new user record
        const newUser = {
          userId: username, // Ensure this matches the partition key name in your DynamoDB schema
          email: email,     // Store email as well
          biography: '',    // Initialize biography as empty
        };
  
        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: newUser,
          })
          .promise();
  
        user = newUser;
      }
  
      return { access_token: idToken, user };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Login failed', error.stack);
        throw new Error(error.message || 'Login failed');
      }
      throw new Error('An unknown error occurred during login');
    }
  }

  async setNewPassword(
    newPassword: string,
    session: string,
    username: string,
    email?: string,
  ): Promise<{ access_token: string }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error('Cognito Client ID or Secret is not defined.');
      throw new Error('Cognito Client ID or Secret is not defined.');
    }

    const secretHash = this.computeSecretHash(username, clientId, clientSecret);

    const challengeResponses: any = {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
      SECRET_HASH: secretHash,
    };

    if (email) {
      challengeResponses.email = email;
    }

    const params = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
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
        throw new Error('Failed to set new password');
      }

      const token = response.AuthenticationResult.IdToken;
      return { access_token: token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Setting new password failed', error.stack);
        throw new Error(error.message || 'Setting new password failed');
      }
      throw new Error('An unknown error occurred');
    }
  }
}