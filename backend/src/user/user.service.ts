import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

/**
 * File could use safer 'User' typing after grabbing users, verifying type after the scan.
 */
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