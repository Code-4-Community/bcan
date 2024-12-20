import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Grant } from './grant.model'

// TODO: set up the region elsewhere - code does not work without the line below
AWS.config.update({ region: 'us-east-2' });      
const dynamodb = new AWS.DynamoDB.DocumentClient();


@Injectable()
export class GrantService {

    // function to retrieve all grants in our database
    async getAllGrants(): Promise<Grant[]> {
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };

        try {
            const data = await dynamodb.scan(params).promise();

            return data.Items as Grant[] || [];
        } catch (error) {
            console.log(error)
            throw new Error('Could not retrieve grants.');
        }
    }

    // function to retrieve a grant by its ID
    async getGrantById(grantId: number): Promise<Grant> {

        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId,
            },
        };

        try {
            const data = await dynamodb.get(params).promise();

            if (!data.Item) {
                throw new Error('No grant with id ' + grantId + ' found.');
            }

            return data.Item as Grant;
        } catch (error) {
            console.log(error)
            throw new Error('Failed to retrieve grant.');
        }
    }
}