import { Injectable,Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import Grant from './grant.model'
import { CreateGrantDto } from './dto/grant.dto';

// TODO: set up the region elsewhere - code does not work without the line below
AWS.config.update({ region: 'us-east-2' });      
const dynamodb = new AWS.DynamoDB.DocumentClient();


@Injectable()
export class GrantService {
    private readonly logger = new Logger(GrantService.name);

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

    // Method to archive grants takes in array 
    async unarchiveGrants(grantIds :number[]) : Promise<number[]> {
        let successfulUpdates: number[] = [];
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

              try{
                const res = await dynamodb.update(params).promise();
                console.log(res)

                if (res.Attributes && res.Attributes.isArchived === false) {
                    console.log(`Grant ${grantId} successfully archived.`);
                    successfulUpdates.push(grantId);
                } else {
                    console.log(`Grant ${grantId} update failed or no change in status.`);
                }
              }
              catch(err){
                console.log(err);
                throw new Error(`Failed to update Grant ${grantId} status.`);
              }
        };
        return successfulUpdates;
    }


    async addGrant(grant : CreateGrantDto) : Promise<number> {
        // When it comes to processing the resources I need a custom decorator
        // Did it hoe
        // TODO Could possibly do more validation like theres a grant with that name already and such
        console.log(grant)
        // TODO unique grantId
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Item: {
                grantId: 1000,
                organization_name: grant.organization_name,
                description: grant.description,
                is_bcan_qualifying : grant.is_bcan_qualifying,
                status : grant.status,
                amount: grant.amount,
                deadline : grant.deadline,
                notifications_on_for_user: grant.notifications_on_for_user,
                reporting_requirements: grant.reporting_requirements,
                restrictions: grant.restrictions,
                point_of_contacts: grant.point_of_contacts,
                attached_resources: grant.attached_resources,
                comments:grant.comments
            }
        };

        try {
            const res = await dynamodb.put(params).promise();
            console.log(`Uploaded grant from ${grant.organization_name}`)
            // Check if the operation was succesful
        } catch (error) {
            console.log(error)
            throw new Error(`Failed to upload new grant from ${grant.organization_name}`)
        }

        return 0
    }
}