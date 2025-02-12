import { Injectable,Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Grant } from './grant.model'

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
     * Given primary key, attribute name, and the content to update, queries database to update
     * that info. Returns true if operation was successful. Assumes inputs are valid.
     * @param grantId
     * @param attributeName
     * @param newValue
     */
    async updateGrant(grantId: number, attributeName: string, newValue: string): Promise<void> {
        // TODO when new grant is added in the updates field needs to be put in as well and init as just emnpty array
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId
            },
            UpdateExpression: `set #s = :newValue`,
            ExpressionAttributeNames: {
                '#s': attributeName,
            },
            ExpressionAttributeValues: {
                ":newValue": newValue,
            },
            ReturnValues: "UPDATED_NEW",
        }
        console.log(params);

        const updateJSONparams = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId
            },
            AttributesToGet: [
                'updates'
            ]
        }



        try {
            const result = await this.dynamoDb.update(params).promise();
            console.log("Attribute update result:", result);
    
            const updateJSON = await this.dynamoDb.get(updateJSONparams).promise();
            let updatesArray = updateJSON.Item?.updates || [];
    
            const newUpdate = {
                date: new Date().toISOString(),
                updates: [
                    {
                        attribute: attributeName,
                        new_value: newValue,
                    },
                ],
            };
            updatesArray.push(newUpdate);
    
            const updateUpdatesParams = {
                TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
                Key: {
                    grantId: grantId,
                },
                UpdateExpression: `set updates = :updatesArray`,
                ExpressionAttributeValues: {
                    ":updatesArray": updatesArray,
                },
                ReturnValues: "UPDATED_NEW",
            };
    
            const updateResult = await this.dynamoDb.update(updateUpdatesParams).promise();
            console.log("Updates field update result:", updateResult);
        } catch(err) {
            console.log(err);
            throw new Error(`Failed to update Grant ${grantId} attribute 
                ${attributeName} with ${newValue}`);
        }
    }
}