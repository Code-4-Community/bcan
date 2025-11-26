import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Grant } from '../../../middle-layer/types/Grant';
import { NotificationService } from '.././notifications/notifcation.service';
import { Notification } from '../../../middle-layer/types/Notification';
import { TDateISO } from '../utils/date';
@Injectable()
export class GrantService {
    private readonly logger = new Logger(GrantService.name);
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    constructor(private readonly notificationService: NotificationService) {}

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
                throw new NotFoundException('No grant with id ' + grantId + ' found.');
            }

            return data.Item as Grant;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            
            console.log(error)
            throw new Error('Failed to retrieve grant.');
        }
    }

    // Method to unarchive grants takes in array 
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
                    console.log(`Grant ${grantId} successfully un-archived.`);
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
        this.logger.warn('here' + grantData.status);
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
            await this.updateGrantNotifications(grantData);
            return JSON.stringify(result); // returns the changed attributes stored in db
        } catch(err) {
            console.log(err);
            throw new Error(`Failed to update Grant ${grantData.grantId}`)
        }
    }
    
    // Add a new grant using the Grant interface from middleware.
  async addGrant(grant: Grant): Promise<number> {
    // Generate a unique grant ID (using Date.now() for simplicity, needs proper UUID)
    const newGrantId = Date.now();

    const params = {
      TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
      Item: {
        grantId: newGrantId,
        organization: grant.organization,
        does_bcan_qualify: grant.does_bcan_qualify,
        status: grant.status, // Expected to be 0 (Potential), 1 (Active), or 2 (Inactive)
        amount: grant.amount,
        grant_start_date: grant.grant_start_date,
        application_deadline: grant.application_deadline,
        report_deadlines: grant.report_deadlines,
        description: grant.description,
        timeline: grant.timeline,
        estimated_completion_time: grant.estimated_completion_time,
        grantmaker_poc: grant.grantmaker_poc,
        bcan_poc: grant.bcan_poc,
        attachments: grant.attachments,
        isRestricted: grant.isRestricted,
      }
    };

    try {
      await this.dynamoDb.put(params).promise();
      this.logger.log(`Uploaded grant from ${grant.organization}`);
      const userId = grant.bcan_poc.POC_email;
      await this.createGrantNotifications({ ...grant, grantId: newGrantId }, userId);
    } catch (error: any) {
      this.logger.error(`Failed to upload new grant from ${grant.organization}`, error.stack);
      throw new Error(`Failed to upload new grant from ${grant.organization}`);
    }

    return newGrantId;
  }

  /* Deletes a grant from database based on its grant ID number
  * @param grantId
  */
  async deleteGrantById(grantId: string): Promise<string> {
    const params = {
        TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || "TABLE_FAILURE",
        Key: { grantId: grantId },
        ConditionExpression: "attribute_exists(grantId)", // ensures grant exists
    };

    try {
        await this.dynamoDb.delete(params).promise();
        this.logger.log(`Grant ${grantId} deleted successfully`);
        return 'Grant ${grantId} deleted successfully';
    } catch (error: any) {
        if (error.code === "ConditionalCheckFailedException") {
            throw new Error(`Grant ${grantId} does not exist`);
        }
        this.logger.error(`Failed to delete Grant ${grantId}`, error.stack);
        throw new Error(`Failed to delete Grant ${grantId}`);
    }
    
  }

  /*
    Helper method that takes in a deadline in ISO format and returns an array of ISO strings representing the notification times
    for 14 days, 7 days, and 3 days before the deadline.
  */
  private getNotificationTimes(deadlineISO: string): string[] {
    const deadline = new Date(deadlineISO);
    const daysBefore = [14, 7, 3];
    return daysBefore.map(days => {
      const d = new Date(deadline);
      d.setDate(deadline.getDate() - days);
      return d.toISOString();
    });
  }

  /**
   * Helper method that creates notifications for a grant's application and report deadlines
   * @param grant represents the grant of which we want to create a notification for
   * @param userId represents the user to whom we want to send the notification
   */
  private async createGrantNotifications(grant: Grant, userId: string) {
    const { grantId, organization, application_deadline, report_deadlines } = grant;
  
    // Application deadline notifications
    if (application_deadline) {
      const alertTimes = this.getNotificationTimes(application_deadline);
      for (const alertTime of alertTimes) {
        const message = `Application due in ${this.daysUntil(alertTime, application_deadline)} days for ${organization}`;
        const notification: Notification = {
          notificationId: `${grantId}-app`,
          userId,
          message,
          alertTime: alertTime as TDateISO,
        };
        await this.notificationService.createNotification(notification);
      }
    }
  
    // Report deadlines notifications
    if (report_deadlines && Array.isArray(report_deadlines)) {
      for (const reportDeadline of report_deadlines) {
        const alertTimes = this.getNotificationTimes(reportDeadline);
        for (const alertTime of alertTimes) {
          const message = `Report due in ${this.daysUntil(alertTime, reportDeadline)} days for ${organization}`;
          const notification: Notification = {
            notificationId: `${grantId}-report`,
            userId,
            message,
            alertTime: alertTime as TDateISO,
          };
          await this.notificationService.createNotification(notification);
        }
      }
    }
  }

  /**
   * Helper method to update notifications for a grant's application and report deadlines
   * @param grant represents the grant of which we want to update notifications for
   */
  private async updateGrantNotifications(grant: Grant) {
    const { grantId, organization, application_deadline, report_deadlines } = grant;
  
    // Application notifications
    if (application_deadline) {
      const alertTimes = this.getNotificationTimes(application_deadline);
      for (const alertTime of alertTimes) {
        const notificationId = `${grantId}-app`;
        const message = `Application due in ${this.daysUntil(alertTime, application_deadline)} days for ${organization}`;
  
        await this.notificationService.updateNotification(notificationId, {
          message,
          alertTime: alertTime as TDateISO,
        });
      }
    }
  
    // Report notifications
    if (report_deadlines && Array.isArray(report_deadlines)) {
      for (const reportDeadline of report_deadlines) {
        const alertTimes = this.getNotificationTimes(reportDeadline);
        for (const alertTime of alertTimes) {
          const notificationId = `${grantId}-report`;
          const message = `Report due in ${this.daysUntil(alertTime, reportDeadline)} days for ${organization}`;
  
          await this.notificationService.updateNotification(notificationId, {
            message,
            alertTime: alertTime as TDateISO,
          });
        }
      }
    }
  }
  
  /*
    Helper method that calculates the number of days between alert time and deadline
  */
  private daysUntil(alertTime: string, deadline: string): number {
    const diffMs = +new Date(deadline) - +new Date(alertTime);
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }


  
}