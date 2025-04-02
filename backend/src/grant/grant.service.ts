import { Injectable,Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Grant } from '../../../middle-layer/types/Grant';
import { CreateGrantDto } from './dto/create-grant.dto';

@Injectable()
export class GrantService {
    private readonly logger = new Logger(GrantService.name);
      private dynamoDb = new AWS.DynamoDB.DocumentClient();

    // function to retrieve all grants in our database
    async getAllGrants(): Promise<Grant[]> {
        // loads in the environment variable for the table now
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };

        try {
            const data = await this.dynamoDb.scan(params).promise();

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
            const data = await this.dynamoDb.get(params).promise();

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
                const res = await this.dynamoDb.update(params).promise();
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

    /**
     * Will push or overwrite new grant data to database
     * @param grantData
     */
    async updateGrant(grantData: Grant): Promise<string> {
        // dynamically creates the update expression/attribute names based on names of grant interface
        // assumption: grant interface field names are exactly the same as db storage naming

        const updateKeys = Object.keys(grantData).filter(
            key => key != 'grantId'
        );
        const UpdateExpression = "SET " + updateKeys.map((key) => `#${key} = :${key}`).join(", ");
        const ExpressionAttributeNames = updateKeys.reduce((acc, key) =>
            ({ ...acc, [`#${key}`]: key }), {});
        const ExpressionAttributeValues = updateKeys.reduce((acc, key) =>
            ({ ...acc, [`:${key}`]: grantData[key as keyof typeof grantData] }), {});

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
        } catch(err) {
            console.log(err);
            throw new Error(`Failed to update Grant ${grantData.grantId}`)
        }
    }
    
    // Add a new grant using the new CreateGrantDto.
  async addGrant(grant: CreateGrantDto): Promise<number> {
    // Generate a unique grant ID (using Date.now() for simplicity, needs proper UUID)
    const newGrantId = Date.now();

    const params = {
      TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
      Item: {
        grantId: newGrantId,
        organization: grant.organization,
        description: grant.description,
        bcan_poc: grant.bcan_poc,
        grant_provider_poc: grant.grant_provider_poc,
        application_date: grant.application_date,
        grant_start_date: grant.grant_start_date,
        report_date: grant.report_date,
        timeline_in_years: grant.timeline_in_years,
        estimated_completion_time_in_hours: grant.estimated_completion_time_in_hours,
        does_bcan_qualify: grant.does_bcan_qualify,
        status: grant.status, // Expected to be 0 (Potential), 1 (Active), or 2 (Inactive)
        amount: grant.amount,
        attached_resources: grant.attached_resources,
      }
    };

    try {
      await this.dynamoDb.put(params).promise();
      this.logger.log(`Uploaded grant from ${grant.organization}`);
    } catch (error: any) {
      this.logger.error(`Failed to upload new grant from ${grant.organization}`, error.stack);
      throw new Error(`Failed to upload new grant from ${grant.organization}`);
    }

    return newGrantId;
  }
}