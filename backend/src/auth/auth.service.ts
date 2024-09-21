import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto'; // Correctly import crypto

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION || 'us-east-2',
  });

  private computeSecretHash(username: string, clientId: string, clientSecret: string): string {
    return crypto.createHmac('SHA256', clientSecret).update(username + clientId).digest('base64');
  }

  async login(username: string, password: string): Promise<{ access_token?: string; session?: string; challenge?: string; requiredAttributes?: string[]; username?: string }> {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error('Cognito Client ID or Secret is not defined.');
      throw new Error('Cognito Client ID or Secret is not defined.');
    }

    const secretHash = this.computeSecretHash(username, clientId, clientSecret);

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    try {
      const response = await this.cognito.initiateAuth(params).promise();

      this.logger.debug(`Cognito Response: ${JSON.stringify(response, null, 2)}`);

      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        this.logger.warn(`ChallengeName: ${response.ChallengeName}`);
        const requiredAttributes = JSON.parse(response.ChallengeParameters?.requiredAttributes || '[]');
        
        return {
          challenge: 'NEW_PASSWORD_REQUIRED',
          session: response.Session,
          requiredAttributes,
          username, // Add username here
        };
      }

      if (!response.AuthenticationResult || !response.AuthenticationResult.IdToken) {
        this.logger.error('Authentication failed: Missing IdToken');
        throw new Error('Authentication failed: Missing IdToken');
      }

      const token = response.AuthenticationResult.IdToken;
      return { access_token: token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Login failed', error.stack);
        throw new Error(error.message || 'Login failed');
      }
      throw new Error('An unknown error occurred during login');
    }
  }

  async setNewPassword(newPassword: string, session: string, username: string, email?: string): Promise<{ access_token: string }> {
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
      challengeResponses.email = email; // Add email only if it's provided
    }

    const params = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: clientId,
      ChallengeResponses: challengeResponses,
      Session: session,
    };

    try {
      const response = await this.cognito.respondToAuthChallenge(params).promise();

      if (!response.AuthenticationResult || !response.AuthenticationResult.IdToken) {
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