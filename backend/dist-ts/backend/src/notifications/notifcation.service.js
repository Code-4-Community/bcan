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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const AWS = __importStar(require("aws-sdk"));
let NotificationService = class NotificationService {
    constructor() {
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
        this.ses = new AWS.SES({ region: process.env.AWS_REGION });
    }
    // function to create a notification
    async createNotification(notification) {
        const alertTime = new Date(notification.alertTime); // ensures a Date can be created from the given alertTime
        const params = {
            TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
            Item: Object.assign(Object.assign({}, notification), { alertTime: alertTime.toISOString() }),
        };
        await this.dynamoDb.put(params).promise();
        return notification;
    }
    // function that returns array of notifications by user id (sorted by most recent notifications first)
    async getNotificationByUserId(userId) {
        // KeyConditionExpression specifies the query condition
        // ExpressionAttributeValues specifies the actual value of the key
        // IndexName specifies our Global Secondary Index, which was created in the BCANNotifs table to 
        // allow for querying by userId, as it is not a primary/partition key
        const params = {
            TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
            IndexName: 'userId-alertTime-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: false // sort in descending order
        };
        try {
            const data = await this.dynamoDb.query(params).promise();
            if (!data.Items) {
                throw new Error('No notifications with user id ' + userId + ' found.');
            }
            return data.Items;
        }
        catch (error) {
            console.log(error);
            throw new Error('Failed to retrieve notifications.');
        }
    }
    // function that returns array of notifications by notification id
    async getNotificationByNotificationId(notificationId) {
        // key condition expression specifies the query condition
        // expression attribute values specifies the actual value of the key
        const params = {
            TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
            KeyConditionExpression: 'notificationId = :notificationId',
            ExpressionAttributeValues: {
                ':notificationId': notificationId,
            },
        };
        try {
            const data = await this.dynamoDb.query(params).promise();
            if (!data.Items) {
                throw new Error('No notifications with notification id ' + notificationId + ' found.');
            }
            return data.Items;
        }
        catch (error) {
            console.log(error);
            throw new Error('Failed to retrieve notification.');
        }
    }
    /**
     * Send an email using AWS SES
     * @param to The recipient email address
     * @param subject The email subject
     * @param body The email body
     */
    async sendEmailNotification(to, subject, body) {
        // Default to an invalid email to prevent non-verified sender mails
        // if BCAN's is not defined in the environment
        const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER ||
            'u&@nveR1ified-failure@dont-send.com';
        const params = {
            Source: fromEmail,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                // UTF-8 is a top reliable way to define special characters and symbols in emails
                Subject: { Charset: 'UTF-8', Data: subject },
                Body: {
                    Text: { Charset: 'UTF-8', Data: body },
                },
            },
        };
        try {
            return await this.ses.sendEmail(params).promise();
        }
        catch (err) {
            console.error('Error sending email: ', err);
            const errMessage = (err instanceof Error) ? err.message : 'Generic';
            throw new Error(`Failed to send email: ${errMessage}`);
        }
    }
};
NotificationService = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
exports.NotificationService = NotificationService;
