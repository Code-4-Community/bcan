import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class UserService {
  async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE || 'UsersTable',
    };

    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items;
    } catch (error) {
      throw new Error('Could not retrieve users');
    }
  }

  async getUserById(userId: string): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE || 'UsersTable',
      Key: {
        userId,
      },
    };

    try {
      const data = await dynamodb.get(params).promise();
      return data.Item;
    } catch (error) {
      throw new Error('Could not retrieve user');
    }
  }
}