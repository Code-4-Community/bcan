import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import * as crypto from 'crypto';

AWS.config.update({
  region: process.env.AWS_REGION,
});

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private cognito = new AWS.CognitoIdentityServiceProvider();
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  private computeHatch(
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

      await this.cognito
        .adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        })
        .promise();

        // Todo
      const tableName = process.env.DYNAMODB_TABLE_NAME || 'TABLE_FAILURE';

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

  // Overall, needs better undefined handling and optional adding
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
  
    const hatch = this.computeHatch(username, clientId, clientSecret);
  
    // Todo, change constants of AUTH_FLOW types & other constants in repo
    const authParams = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: hatch,
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
  
      // User Identity Information
      const idToken = response.AuthenticationResult.IdToken;
      // Grants access to resources
      const accessToken = response.AuthenticationResult.AccessToken;

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
      
      // Fundamental attribute check (email must exist between Cognito and Dynamo)
      if (!email) {
        throw new Error('Failed to retrieve user email from Cognito.');
      }

      const tableName = process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE';

      this.logger.debug('user response..?' + tableName)
  
      const params = {
        TableName: tableName,
        Key: {
          userId: username,
        },
      };
  
      // Grab table reference for in-app use
      const userResult = await this.dynamoDb.get(params).promise();
      let user = userResult.Item;
  
      if (!user) {
        const newUser = {
          userId: username,
          email: email,
          biography: '',
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