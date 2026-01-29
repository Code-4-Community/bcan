import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as AWS from 'aws-sdk'; 
import { Grant } from '../../../middle-layer/types/Grant';
import { NotificationService } from '../notifications/notification.service';
import { Notification } from '../../../middle-layer/types/Notification';
import { TDateISO } from '../utils/date';
import { Status } from '../../../middle-layer/types/Status';
@Injectable()
export class GrantService {
    private readonly logger = new Logger(GrantService.name);
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    constructor(private readonly notificationService: NotificationService) {}

    // Retrieves all grants from the database and automatically inactivates expired grants
    async getAllGrants(): Promise<Grant[]> {
      this.logger.log('Starting to retrieve all grants from database');
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };

        try {
          this.logger.debug(`Scanning DynamoDB table: ${params.TableName}`);
          const data = await this.dynamoDb.scan(params).promise();
          const grants = (data.Items as Grant[]) || [];
          this.logger.log(`Retrieved ${grants.length} grants from database`);
          
          const inactiveGrantIds: number[] = [];
          const now = new Date();
  
          this.logger.debug('Checking for expired active grants');
          for (const grant of grants) {
              if (grant.status === "Active") {
                  const startDate = new Date(grant.grant_start_date);
  
                  // add timeline years to start date
                  const endDate = new Date(startDate);
                  endDate.setFullYear(
                      endDate.getFullYear() + grant.timeline
                  );
  
                  if (now >= endDate) {
                      this.logger.warn(`Grant ${grant.grantId} has expired and will be marked inactive`);
                      inactiveGrantIds.push(grant.grantId);
                      let newGrant = this.makeGrantsInactive(grant.grantId)
                      grants.filter(g => g.grantId !== grant.grantId);
                      grants.push(await newGrant);

                  }
                }
              }
              
          if (inactiveGrantIds.length > 0) {
            this.logger.log(`Automatically inactivated ${inactiveGrantIds.length} expired grants`);
          }
          
          this.logger.log(`Successfully retrieved ${grants.length} grants`);
          return grants;
        } catch (error) {
            this.logger.error('Failed to retrieve grants from database', error instanceof Error ? error.stack : undefined);
            throw new Error('Could not retrieve grants.');
        }
    }

    // Retrieves a single grant from the database by its unique grant ID
    async getGrantById(grantId: number): Promise<Grant> {
      this.logger.log(`Retrieving grant with ID: ${grantId}`);
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId,
            },
        };

        try {
            this.logger.debug(`Querying DynamoDB for grant ID: ${grantId}`);
            const data = await this.dynamoDb.get(params).promise();

            if (!data.Item) {
                this.logger.warn(`Grant with ID ${grantId} not found in database`);
                throw new NotFoundException('No grant with id ' + grantId + ' found.');
            }

            this.logger.log(`Successfully retrieved grant ${grantId} from database`);
            return data.Item as Grant;
        } catch (error) {
            if (error instanceof NotFoundException) {
              this.logger.warn(`Grant ${grantId} not found: ${error.message}`);
              throw error;
            }
            
            this.logger.error(`Failed to retrieve grant ${grantId}`, error instanceof Error ? error.stack : undefined);
            throw new Error('Failed to retrieve grant.');
        }
    }

    // Marks a grant as inactive by updating its status in the database
    async makeGrantsInactive(grantId: number): Promise<Grant> {
      this.logger.log(`Marking grant ${grantId} as inactive`);
      let updatedGrant: Grant = {} as Grant;

      const params = {
          TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || "TABLE_FAILURE",
          Key: { grantId },
          UpdateExpression: "SET #status = :inactiveStatus",
          ExpressionAttributeNames: {
              "#status": "status",
          },
          ExpressionAttributeValues: {
              ":inactiveStatus": Status.Inactive as String,
          },
          ReturnValues: "ALL_NEW",
      };

      try {
          this.logger.debug(`Updating grant ${grantId} status to inactive in DynamoDB`);
          const res = await this.dynamoDb.update(params).promise();
      
          if (res.Attributes?.status === Status.Inactive) {
              this.logger.log(`Grant ${grantId} successfully marked as inactive`);
              const currentGrant = res.Attributes as Grant;
              updatedGrant = currentGrant;
          } else {
              this.logger.warn(`Grant ${grantId} update failed or no change in status`);
          }
      } catch (err) {
          this.logger.error(`Failed to update grant ${grantId} status to inactive`, err instanceof Error ? err.stack : undefined);
          throw new Error(`Failed to update Grant ${grantId} status.`);
      }

      return updatedGrant;
    }


    // Updates an existing grant in the database with new grant data
    async updateGrant(grantData: Grant): Promise<string> {
      this.logger.log(`Updating grant with ID: ${grantData.grantId}`);
      
      const updateKeys = Object.keys(grantData).filter(
          key => key != 'grantId'
      );
      
      this.logger.debug(`Updating ${updateKeys.length} fields for grant ${grantData.grantId}: ${updateKeys.join(', ')}`);
      
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
          this.logger.debug(`Executing DynamoDB update for grant ${grantData.grantId}`);
          const result = await this.dynamoDb.update(params).promise();
          this.logger.log(`Successfully updated grant ${grantData.grantId} in database`);
          //await this.updateGrantNotifications(grantData);
          return JSON.stringify(result);
      } catch(err: unknown) {
          this.logger.error(`Failed to update grant ${grantData.grantId} in DynamoDB`, err instanceof Error ? err.stack : undefined);
          this.logger.error(`Error details: ${JSON.stringify(err)}`);
          throw new Error(`Failed to update Grant ${grantData.grantId}`);
      }
  }
    
    // Creates a new grant in the database and generates a unique grant ID
    async addGrant(grant: Grant): Promise<number> {
      this.logger.log(`Creating new grant for organization: ${grant.organization}`);
      // Generate a unique grant ID (using Date.now() for simplicity, needs proper UUID)
      const newGrantId = Date.now();
      this.logger.debug(`Generated grant ID: ${newGrantId}`);

      const params = {
        TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        Item: {
          grantId: newGrantId,
          organization: grant.organization,
          does_bcan_qualify: grant.does_bcan_qualify,
          status: grant.status,
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
        this.logger.debug(`Inserting grant ${newGrantId} into DynamoDB`);
        await this.dynamoDb.put(params).promise();
        this.logger.log(`Successfully created grant ${newGrantId} for organization: ${grant.organization}`);
        
        const userId = grant.bcan_poc.POC_email;
        this.logger.debug(`Preparing to create notifications for user: ${userId}`);
        
        //await this.createGrantNotifications({ ...grant, grantId: newGrantId }, userId);
        
        this.logger.log(`Successfully created grant ${newGrantId} with all associated data`);
      } catch (error: any) {
        this.logger.error(`Failed to create new grant for organization: ${grant.organization}`);
        this.logger.error(`Error details: ${error.message}`);
        this.logger.error(`Stack trace: ${error.stack}`);
        throw new Error(`Failed to upload new grant from ${grant.organization}`);
      }

      return newGrantId;
    }

  // Deletes a grant from the database by its grant ID
  async deleteGrantById(grantId: number): Promise<string> {
    this.logger.log(`Deleting grant with ID: ${grantId}`);
    const params = {
        TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || "TABLE_FAILURE",
        Key: { grantId: Number(grantId) },
        ConditionExpression: "attribute_exists(grantId)", // ensures grant exists
    };

    try {
        this.logger.debug(`Executing DynamoDB delete for grant ${grantId}`);
        await this.dynamoDb.delete(params).promise();
        this.logger.log(`Successfully deleted grant ${grantId} from database`);
        return `Grant ${grantId} deleted successfully`;
    } catch (error: any) {
        if (error.code === "ConditionalCheckFailedException") {
            this.logger.warn(`Grant ${grantId} does not exist in database`);
            throw new Error(`Grant ${grantId} does not exist`);
        }
        this.logger.error(`Failed to delete grant ${grantId}`, error.stack);
        throw new Error(`Failed to delete Grant ${grantId}`);
    }
  }

  // Calculates notification times for a deadline (14, 7, and 3 days before)
  private getNotificationTimes(deadlineISO: string): string[] {
    const deadline = new Date(deadlineISO);
    const daysBefore = [14, 7, 3];
    return daysBefore.map(days => {
      const d = new Date(deadline);
      d.setDate(deadline.getDate() - days);
      return d.toISOString();
    });
  }

  // Creates notifications for a grant's application and report deadlines
  private async createGrantNotifications(grant: Grant, userId: string) {
    const { grantId, organization, application_deadline, report_deadlines } = grant;
    this.logger.log(
      `Creating notifications for grant ${grantId} (${organization}) for user ${userId}`,
    );

    // Application deadline notifications
    if (application_deadline) {
      this.logger.debug(
        `Creating application deadline notifications for grant ${grantId} with deadline ${application_deadline}`,
      );
      const alertTimes = this.getNotificationTimes(application_deadline);
      for (const alertTime of alertTimes) {
        this.logger.debug(
          `Creating application notification for grant ${grantId} at alertTime ${alertTime}`,
        );
        const message = `Application due in ${this.daysUntil(alertTime, application_deadline)} days for ${organization}`;
        const notification: Notification = {
          notificationId: `${grantId}-app`,
          userId,
          message,
          alertTime: alertTime as TDateISO,
          sent: false,
        };
        await this.notificationService.createNotification(notification);
      }
    } else {
      this.logger.debug(
        `No application_deadline found for grant ${grantId}; skipping application notifications`,
      );
    }

    // Report deadlines notifications
    if (report_deadlines && Array.isArray(report_deadlines)) {
      this.logger.debug(
        `Creating report deadline notifications for grant ${grantId} with ${report_deadlines.length} report_deadlines`,
      );
      for (const reportDeadline of report_deadlines) {
        const alertTimes = this.getNotificationTimes(reportDeadline);
        for (const alertTime of alertTimes) {
          this.logger.debug(
            `Creating report notification for grant ${grantId} at alertTime ${alertTime} (report deadline ${reportDeadline})`,
          );
          const message = `Report due in ${this.daysUntil(alertTime, reportDeadline)} days for ${organization}`;
          const notification: Notification = {
            notificationId: `${grantId}-report`,
            userId,
            message,
            alertTime: alertTime as TDateISO,
            sent: false,
          };
          await this.notificationService.createNotification(notification);
        }
      }
    } else {
      this.logger.debug(
        `No report_deadlines configured for grant ${grantId}; skipping report notifications`,
      );
    }

    this.logger.log(
      `Finished creating notifications for grant ${grantId} (${organization}) for user ${userId}`,
    );
  }

  // Updates notifications for a grant's application and report deadlines
  private async updateGrantNotifications(grant: Grant) {
    const { grantId, organization, application_deadline, report_deadlines } = grant;
    this.logger.log(
      `Updating notifications for grant ${grantId} (${organization})`,
    );

    // Application notifications
    if (application_deadline) {
      this.logger.debug(
        `Updating application deadline notifications for grant ${grantId} with deadline ${application_deadline}`,
      );
      const alertTimes = this.getNotificationTimes(application_deadline);
      for (const alertTime of alertTimes) {
        const notificationId = `${grantId}-app`;
        const message = `Application due in ${this.daysUntil(alertTime, application_deadline)} days for ${organization}`;

        this.logger.debug(
          `Updating application notification ${notificationId} for grant ${grantId} to alertTime ${alertTime}`,
        );
        await this.notificationService.updateNotification(notificationId, {
          message,
          alertTime: alertTime as TDateISO,
        });
      }
    } else {
      this.logger.debug(
        `No application_deadline found for grant ${grantId}; skipping application notification updates`,
      );
    }

    // Report notifications
    if (report_deadlines && Array.isArray(report_deadlines)) {
      this.logger.debug(
        `Updating report deadline notifications for grant ${grantId} with ${report_deadlines.length} report_deadlines`,
      );
      for (const reportDeadline of report_deadlines) {
        const alertTimes = this.getNotificationTimes(reportDeadline);
        for (const alertTime of alertTimes) {
          const notificationId = `${grantId}-report`;
          const message = `Report due in ${this.daysUntil(alertTime, reportDeadline)} days for ${organization}`;

          this.logger.debug(
            `Updating report notification ${notificationId} for grant ${grantId} to alertTime ${alertTime} (report deadline ${reportDeadline})`,
          );
          await this.notificationService.updateNotification(notificationId, {
            message,
            alertTime: alertTime as TDateISO,
          });
        }
      }
    } else {
      this.logger.debug(
        `No report_deadlines configured for grant ${grantId}; skipping report notification updates`,
      );
    }

    this.logger.log(
      `Finished updating notifications for grant ${grantId} (${organization})`,
    );
  }

  // Calculates the number of days between an alert time and deadline
  private daysUntil(alertTime: string, deadline: string): number {
    const diffMs = +new Date(deadline) - +new Date(alertTime);
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
}