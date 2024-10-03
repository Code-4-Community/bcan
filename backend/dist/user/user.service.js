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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamodb = new aws_sdk_1.default.DynamoDB.DocumentClient();
let UserService = class UserService {
    async getAllUsers() {
        const params = {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
        };
        try {
            const data = await dynamodb.scan(params).promise();
            return data.Items;
        }
        catch (error) {
            throw new Error('Could not retrieve users');
        }
    }
    async getUserById(userId) {
        const params = {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                userId,
            },
        };
        try {
            const data = await dynamodb.get(params).promise();
            return data.Item;
        }
        catch (error) {
            throw new Error('Could not retrieve user');
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
exports.UserService = UserService;
