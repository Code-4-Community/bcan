"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const crypto = __importStar(require("crypto"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
});
let AuthService = AuthService_1 = class AuthService {
    constructor() {
        this.logger = new common_1.Logger(AuthService_1.name);
        this.cognito = new aws_sdk_1.default.CognitoIdentityServiceProvider();
        this.dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient();
    }
    computeSecretHash(username, clientId, clientSecret) {
        return crypto
            .createHmac('SHA256', clientSecret)
            .update(username + clientId)
            .digest('base64');
    }
    async register(username, password, email) {
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
                    biography: '', // Initialize biography as empty
                },
            };
            await this.dynamoDb.put(params).promise();
            this.logger.log(`User ${username} registered successfully and added to DynamoDB.`);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Registration failed', error.stack);
                throw new Error(error.message || 'Registration failed');
            }
            throw new Error('An unknown error occurred during registration');
        }
    }
    async login(username, password) {
        var _a;
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
                const requiredAttributes = JSON.parse(((_a = response.ChallengeParameters) === null || _a === void 0 ? void 0 : _a.requiredAttributes) || '[]');
                return {
                    challenge: 'NEW_PASSWORD_REQUIRED',
                    session: response.Session,
                    requiredAttributes,
                    username,
                };
            }
            if (!response.AuthenticationResult ||
                !response.AuthenticationResult.IdToken ||
                !response.AuthenticationResult.AccessToken) {
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
            let email;
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
                    userId: username,
                    email: email,
                    biography: '', // Initialize biography as empty
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
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Login failed', error.stack);
                throw new Error(error.message || 'Login failed');
            }
            throw new Error('An unknown error occurred during login');
        }
    }
    async setNewPassword(newPassword, session, username, email) {
        const clientId = process.env.COGNITO_CLIENT_ID;
        const clientSecret = process.env.COGNITO_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            this.logger.error('Cognito Client ID or Secret is not defined.');
            throw new Error('Cognito Client ID or Secret is not defined.');
        }
        const secretHash = this.computeSecretHash(username, clientId, clientSecret);
        const challengeResponses = {
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
            if (!response.AuthenticationResult ||
                !response.AuthenticationResult.IdToken) {
                throw new Error('Failed to set new password');
            }
            const token = response.AuthenticationResult.IdToken;
            return { access_token: token };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error('Setting new password failed', error.stack);
                throw new Error(error.message || 'Setting new password failed');
            }
            throw new Error('An unknown error occurred');
        }
    }
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)()
], AuthService);
exports.AuthService = AuthService;
