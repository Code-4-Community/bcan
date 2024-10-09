import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Grant } from './grant.model'

// TODO: set up the region elsewhere - code does not work without the line below
AWS.config.update({ region: 'us-east-2' });      
const dynamodb = new AWS.DynamoDB.DocumentClient();


// TODO: make return type a Grant object
@Injectable()
export class GrantService {
    async getAllGrants(): Promise<any> {
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };

        try {
            const data = await dynamodb.scan(params).promise();
            return data.Items;
        } catch (error) {
            console.log(error)
            throw new Error('Could not retrieve grants.');
        }
    }

    async getGrantById(userId: string): Promise<any> {
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                userId,
            },
        };

        try {
            const data = await dynamodb.get(params).promise();
            return data.Item;
        } catch (error) {
            throw new Error('Could not retrieve grant.');
        }
    }
}