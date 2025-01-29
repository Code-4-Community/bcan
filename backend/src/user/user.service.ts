import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk'

@Injectable()
export class UserService {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
    };

    try {
      const data = await this.dynamoDb.scan(params).promise();
      return data.Items;
    } catch (error) {
      throw new Error('Could not retrieve users.');
    }
  }

  async getUserById(userId: string): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
      Key: {
        userId,
      },
    };

    try {
      const data = await this.dynamoDb.get(params).promise();
      return data.Item;
    } catch (error) {
      throw new Error('Could not retrieve user.');
    }
  }
}