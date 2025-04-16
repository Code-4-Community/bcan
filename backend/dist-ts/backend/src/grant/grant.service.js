"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GrantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrantService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
let GrantService = GrantService_1 = class GrantService {
    constructor() {
        this.logger = new common_1.Logger(GrantService_1.name);
        this.dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient();
    }
    // function to retrieve all grants in our database
    async getAllGrants() {
        // loads in the environment variable for the table now
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };
        try {
            const data = await this.dynamoDb.scan(params).promise();
            return data.Items || [];
        }
        catch (error) {
            console.log(error);
            throw new Error('Could not retrieve grants.');
        }
    }
    // function to retrieve a grant by its ID
    async getGrantById(grantId) {
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId,
            },
        };
        try {
            const data = await this.dynamoDb.get(params).promise();
            if (!data.Item) {
                throw new Error('No grant with id ' + grantId + ' found.');
            }
            return data.Item;
        }
        catch (error) {
            console.log(error);
            throw new Error('Failed to retrieve grant.');
        }
    }
    // Method to archive grants takes in array 
    async unarchiveGrants(grantIds) {
        let successfulUpdates = [];
        for (const grantId of grantIds) {
            const params = {
                TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
                Key: {
                    grantId: grantId,
                },
                UpdateExpression: "set isArchived = :archived",
                ExpressionAttributeValues: { ":archived": false },
                ReturnValues: "UPDATED_NEW",
            };
            try {
                const res = await this.dynamoDb.update(params).promise();
                console.log(res);
                if (res.Attributes && res.Attributes.isArchived === false) {
                    console.log(`Grant ${grantId} successfully archived.`);
                    successfulUpdates.push(grantId);
                }
                else {
                    console.log(`Grant ${grantId} update failed or no change in status.`);
                }
            }
            catch (err) {
                console.log(err);
                throw new Error(`Failed to update Grant ${grantId} status.`);
            }
        }
        ;
        return successfulUpdates;
    }
    /**
     * Will push or overwrite new grant data to database
     * @param grantData
     */
    async updateGrant(grantData) {
        // dynamically creates the update expression/attribute names based on names of grant interface
        // assumption: grant interface field names are exactly the same as db storage naming
        this.logger.warn('here' + grantData.status);
        const updateKeys = Object.keys(grantData).filter(key => key != 'grantId');
        const UpdateExpression = "SET " + updateKeys.map((key) => `#${key} = :${key}`).join(", ");
        const ExpressionAttributeNames = updateKeys.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [`#${key}`]: key })), {});
        const ExpressionAttributeValues = updateKeys.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [`:${key}`]: grantData[key] })), {});
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || "TABLE_FAILURE",
            Key: { grantId: grantData.grantId },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: "UPDATED_NEW",
        };
        try {
            const result = await this.dynamoDb.update(params).promise();
            return JSON.stringify(result); // returns the changed attributes stored in db
        }
        catch (err) {
            console.log(err);
            throw new Error(`Failed to update Grant ${grantData.grantId}`);
        }
    }
    // Add a new grant using the new CreateGrantDto.
    async addGrant(grant) {
        // Generate a unique grant ID (using Date.now() for simplicity, needs proper UUID)
        const newGrantId = Date.now();
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Item: {
                grantId: newGrantId,
                organization: grant.organization,
                description: grant.description,
                /*bcan_poc: grant.bcan_poc,*/
                grantmaker_poc: grant.grantmaker_poc,
                application_deadline: grant.application_deadline,
                notification_date: grant.notification_date,
                report_deadline: grant.report_deadline,
                timeline: grant.timeline,
                estimated_completion_time: grant.estimated_completion_time,
                does_bcan_qualify: grant.does_bcan_qualify,
                status: grant.status,
                amount: grant.amount,
                attachments: grant.attachments,
            }
        };
        try {
            await this.dynamoDb.put(params).promise();
            this.logger.log(`Uploaded grant from ${grant.organization}`);
        }
        catch (error) {
            this.logger.error(`Failed to upload new grant from ${grant.organization}`, error.stack);
            throw new Error(`Failed to upload new grant from ${grant.organization}`);
        }
        return newGrantId;
    }
};
GrantService = GrantService_1 = __decorate([
    (0, common_1.Injectable)()
], GrantService);
exports.GrantService = GrantService;
