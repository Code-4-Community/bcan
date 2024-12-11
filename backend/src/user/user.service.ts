import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-2' });      // need to explicitly mention the region here otherwise an error is thrown for some reason

const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class UserService {
  async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || 'TABLE_FAILURE',
    };

    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items;
    } catch (error) {
      console.log(error)
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
      const data = await dynamodb.get(params).promise();
      return data.Item;
    } catch (error) {
      console.log(error)
      throw new Error('Could not retrieve user.');
    }
  }
}