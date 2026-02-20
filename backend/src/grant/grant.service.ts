import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk'; 
import { Grant } from '../../../middle-layer/types/Grant';
import { NotificationService } from '../notifications/notification.service';
import { Notification } from '../../../middle-layer/types/Notification';
import { TDateISO } from '../utils/date';
import { Status } from '../../../middle-layer/types/Status';

interface AWSError extends Error {
    code?: string;
    statusCode?: number;
    requestId?: string;
    retryable?: boolean;
}

@Injectable()
export class GrantService {
    private readonly logger = new Logger(GrantService.name);
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    constructor(private readonly notificationService: NotificationService) {}

    /**
     * Helper method to check if an error is an AWS error and extract relevant information
     */
    private isAWSError(error: unknown): error is AWSError {
        return (
            typeof error === 'object' &&
            error !== null &&
            ('code' in error || 'statusCode' in error || 'requestId' in error)
        );
    }

    /**
     * Helper method to handle AWS errors and throw appropriate NestJS exceptions
     */
    private handleAWSError(error: AWSError, operation: string, context?: string): never {
        const errorContext = context ? ` (${context})` : '';
        const errorDetails = {
            code: error.code,
            message: error.message,
            requestId: error.requestId,
            retryable: error.retryable,
        };

        this.logger.error(`AWS Error during ${operation}${errorContext}:`, {
            ...errorDetails,
            stack: error.stack,
        });

        // Handle specific AWS error codes
        switch (error.code) {
            case 'ResourceNotFoundException':
                throw new BadRequestException(
                    `AWS DynamoDB Error: Table or resource not found. ${error.message}`
                );
            case 'ValidationException':
                throw new BadRequestException(
                    `AWS DynamoDB Validation Error: Invalid request parameters. ${error.message}`
                );
            case 'ProvisionedThroughputExceededException':
                throw new InternalServerErrorException(
                    `AWS DynamoDB Error: Request rate too high. Please retry later. ${error.message}`
                );
            case 'ThrottlingException':
                throw new InternalServerErrorException(
                    `AWS DynamoDB Error: Request throttled. Please retry later. ${error.message}`
                );
            case 'ConditionalCheckFailedException':
                throw new BadRequestException(
                    `AWS DynamoDB Error: Conditional check failed. ${error.message}`
                );
            case 'ItemCollectionSizeLimitExceededException':
                throw new BadRequestException(
                    `AWS DynamoDB Error: Item collection size limit exceeded. ${error.message}`
                );
            default:
                throw new InternalServerErrorException(
                    `AWS DynamoDB Error during ${operation}: ${error.message || 'Unknown AWS error'}`
                );
        }
    }

    // Retrieves all grants from the database and automatically inactivates expired grants
    async getAllGrants(): Promise<Grant[]> {
      this.logger.log('Starting to retrieve all grants from database');
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
        };

        // Validate table name
        if (params.TableName === 'TABLE_FAILURE') {
            this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
            throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
        }

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
                      try {
                          let newGrant = await this.makeGrantsInactive(grant.grantId);
                          grants.filter(g => g.grantId !== grant.grantId);
                          grants.push(newGrant);
                      } catch (inactiveError) {
                          this.logger.error(`Failed to inactivate expired grant ${grant.grantId}`, inactiveError instanceof Error ? inactiveError.stack : undefined);
                          // Continue processing other grants even if one fails to inactivate
                      }
                  }
                }
              }
              
          if (inactiveGrantIds.length > 0) {
            this.logger.log(`Automatically inactivated ${inactiveGrantIds.length} expired grants`);
          }
          
          this.logger.log(`Successfully retrieved ${grants.length} grants`);
          return grants;
        } catch (error) {
            if (this.isAWSError(error)) {
                this.handleAWSError(error, 'getAllGrants', `table: ${params.TableName}`);
            }
            
            // Handle application logic errors
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            
            // Generic error fallback
            this.logger.error('Failed to retrieve grants from database', error instanceof Error ? error.stack : undefined);
            throw new InternalServerErrorException(`Failed to retrieve grants: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Retrieves a single grant from the database by its unique grant ID
    async getGrantById(grantId: number): Promise<Grant> {
      this.logger.log(`Retrieving grant with ID: ${grantId}`);
      
      // Validate input
      if (!grantId || isNaN(Number(grantId))) {
          this.logger.error(`Invalid grant ID provided: ${grantId}`);
          throw new BadRequestException(`Invalid grant ID: ${grantId}. Grant ID must be a valid number.`);
      }
      
        const params = {
            TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || 'TABLE_FAILURE',
            Key: {
                grantId: grantId,
            },
        };

        // Validate table name
        if (params.TableName === 'TABLE_FAILURE') {
            this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
            throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
        }

        try {
            this.logger.debug(`Querying DynamoDB for grant ID: ${grantId}`);
            const data = await this.dynamoDb.get(params).promise();

            if (!data.Item) {
                this.logger.warn(`Grant with ID ${grantId} not found in database`);
                throw new NotFoundException(`No grant with id ${grantId} found.`);
            }

            this.logger.log(`Successfully retrieved grant ${grantId} from database`);
            return data.Item as Grant;
        } catch (error) {
            // Re-throw NestJS exceptions
            if (error instanceof NotFoundException) {
              this.logger.warn(`Grant ${grantId} not found: ${error.message}`);
              throw error;
            }
            
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            
            // Handle AWS errors
            if (this.isAWSError(error)) {
                this.handleAWSError(error, 'getGrantById', `grantId: ${grantId}`);
            }
            
            // Generic error fallback
            this.logger.error(`Failed to retrieve grant ${grantId}`, error instanceof Error ? error.stack : undefined);
            throw new InternalServerErrorException(`Failed to retrieve grant ${grantId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Marks a grant as inactive by updating its status in the database
    async makeGrantsInactive(grantId: number): Promise<Grant> {
      this.logger.log(`Marking grant ${grantId} as inactive`);
      
      // Validate input
      if (!grantId || isNaN(Number(grantId))) {
          this.logger.error(`Invalid grant ID provided: ${grantId}`);
          throw new BadRequestException(`Invalid grant ID: ${grantId}. Grant ID must be a valid number.`);
      }
      
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

      // Validate table name
      if (params.TableName === 'TABLE_FAILURE') {
          this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
          throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
      }

      try {
          this.logger.debug(`Updating grant ${grantId} status to inactive in DynamoDB`);
          const res = await this.dynamoDb.update(params).promise();
      
          if (!res.Attributes) {
              this.logger.warn(`Grant ${grantId} update returned no attributes - grant may not exist`);
              throw new NotFoundException(`Grant with id ${grantId} not found or could not be updated.`);
          }
          
          if (res.Attributes.status === Status.Inactive) {
              this.logger.log(`Grant ${grantId} successfully marked as inactive`);
              updatedGrant = res.Attributes as Grant;
          } else {
              this.logger.warn(`Grant ${grantId} update completed but status is ${res.Attributes.status}, expected ${Status.Inactive}`);
              updatedGrant = res.Attributes as Grant;
          }
      } catch (error) {
          // Re-throw NestJS exceptions
          if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
              throw error;
          }
          
          // Handle AWS errors
          if (this.isAWSError(error)) {
              this.handleAWSError(error, 'makeGrantsInactive', `grantId: ${grantId}`);
          }
          
          // Generic error fallback
          this.logger.error(`Failed to update grant ${grantId} status to inactive`, error instanceof Error ? error.stack : undefined);
          throw new InternalServerErrorException(`Failed to update grant ${grantId} status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return updatedGrant;
    }


    // Updates an existing grant in the database with new grant data
    async updateGrant(grantData: Grant): Promise<string> {
      // Validate input - check for null/undefined first
      if (!grantData) {
          this.logger.error('Invalid grant data provided for update');
          throw new BadRequestException('Invalid grant data: grant object is required.');
      }
      
      this.logger.log(`Updating grant with ID: ${grantData.grantId}`);
      
      if (!grantData.grantId) {
          this.logger.error('Invalid grant data provided for update');
          throw new BadRequestException('Invalid grant data: grantId is required.');
      }
      
      if (isNaN(Number(grantData.grantId))) {
          this.logger.error(`Invalid grant ID provided: ${grantData.grantId}`);
          throw new BadRequestException(`Invalid grant ID: ${grantData.grantId}. Grant ID must be a valid number.`);
      }
      
      const updateKeys = Object.keys(grantData).filter(
          key => key != 'grantId'
      );
      
      if (updateKeys.length === 0) {
          this.logger.warn(`No fields to update for grant ${grantData.grantId}`);
          throw new BadRequestException('No fields provided to update. At least one field besides grantId is required.');
      }
      
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

      // Validate table name
      if (params.TableName === 'TABLE_FAILURE') {
          this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
          throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
      }

      try {
          this.logger.debug(`Executing DynamoDB update for grant ${grantData.grantId}`);
          const result = await this.dynamoDb.update(params).promise();
          this.logger.log(`Successfully updated grant ${grantData.grantId} in database`);
          //await this.updateGrantNotifications(grantData);
          return JSON.stringify(result);
      } catch(error: unknown) {
          // Re-throw NestJS exceptions
          if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
              throw error;
          }
          
          // Handle AWS errors
          if (this.isAWSError(error)) {
              this.handleAWSError(error, 'updateGrant', `grantId: ${grantData.grantId}`);
          }
          
          // Generic error fallback
          this.logger.error(`Failed to update grant ${grantData.grantId} in DynamoDB`, error instanceof Error ? error.stack : undefined);
          this.logger.error(`Error details: ${JSON.stringify(error)}`);
          throw new InternalServerErrorException(`Failed to update grant ${grantData.grantId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  }
    
    // Creates a new grant in the database and generates a unique grant ID
    async addGrant(grant: Grant): Promise<number> {
      // Validate input - check for null/undefined first
      if (!grant) {
          this.logger.error('Invalid grant data provided');
          throw new BadRequestException('Invalid grant data: grant object is required.');
      }
      
      this.logger.log(`Creating new grant for organization: ${grant.organization}`);
      
      if (!grant.organization || grant.organization.trim() === '') {
          this.logger.error('Invalid organization name provided');
          throw new BadRequestException('Invalid grant data: organization is required.');
      }
      
      if (!grant.bcan_poc || !grant.bcan_poc.POC_email) {
          this.logger.error('Invalid bcan_poc provided');
          throw new BadRequestException('Invalid grant data: bcan_poc with POC_email is required.');
      }
      
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

      // Validate table name
      if (params.TableName === 'TABLE_FAILURE') {
          this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
          throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
      }

      try {
        this.logger.debug(`Inserting grant ${newGrantId} into DynamoDB`);
        await this.dynamoDb.put(params).promise();
        this.logger.log(`Successfully created grant ${newGrantId} for organization: ${grant.organization}`);
        
        const userId = grant.bcan_poc.POC_email;
        this.logger.debug(`Preparing to create notifications for user: ${userId}`);
        
        //await this.createGrantNotifications({ ...grant, grantId: newGrantId }, userId);
        
        this.logger.log(`Successfully created grant ${newGrantId} with all associated data`);
      } catch (error: unknown) {
          // Re-throw NestJS exceptions
          if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
              throw error;
          }
          
          // Handle AWS errors
          if (this.isAWSError(error)) {
              this.handleAWSError(error, 'addGrant', `organization: ${grant.organization}, grantId: ${newGrantId}`);
          }
          
          // Generic error fallback
          this.logger.error(`Failed to create new grant for organization: ${grant.organization}`);
          this.logger.error(`Error details: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
          this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : undefined}`);
          throw new InternalServerErrorException(`Failed to create grant for organization ${grant.organization}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return newGrantId;
    }

  // Deletes a grant from the database by its grant ID
  async deleteGrantById(grantId: number): Promise<string> {
    this.logger.log(`Deleting grant with ID: ${grantId}`);
    
    // Validate input
    if (!grantId || isNaN(Number(grantId))) {
        this.logger.error(`Invalid grant ID provided: ${grantId}`);
        throw new BadRequestException(`Invalid grant ID: ${grantId}. Grant ID must be a valid number.`);
    }
    
    const params = {
        TableName: process.env.DYNAMODB_GRANT_TABLE_NAME || "TABLE_FAILURE",
        Key: { grantId: Number(grantId) },
        ConditionExpression: "attribute_exists(grantId)", // ensures grant exists
    };

    // Validate table name
    if (params.TableName === 'TABLE_FAILURE') {
        this.logger.error('DYNAMODB_GRANT_TABLE_NAME environment variable is not set');
        throw new InternalServerErrorException('Server configuration error: DynamoDB table name not configured');
    }

    try {
        this.logger.debug(`Executing DynamoDB delete for grant ${grantId}`);
        await this.dynamoDb.delete(params).promise();
        this.logger.log(`Successfully deleted grant ${grantId} from database`);
        return `Grant ${grantId} deleted successfully`;
    } catch (error: unknown) {
        // Re-throw NestJS exceptions
        if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
            throw error;
        }
        
        // Handle AWS errors
        if (this.isAWSError(error)) {
            // ConditionalCheckFailedException means the grant doesn't exist
            if (error.code === "ConditionalCheckFailedException") {
                this.logger.warn(`Grant ${grantId} does not exist in database`);
                throw new BadRequestException(`Grant ${grantId} does not exist`);
            }
            this.handleAWSError(error, 'deleteGrantById', `grantId: ${grantId}`);
        }
        
        // Generic error fallback
        this.logger.error(`Failed to delete grant ${grantId}`, error instanceof Error ? error.stack : undefined);
        throw new InternalServerErrorException(`Failed to delete grant ${grantId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  private async createGrantNotifications(grant: Grant, email: string) {
    const { grantId, organization, application_deadline, report_deadlines } = grant;
    this.logger.log(
      `Creating notifications for grant ${grantId} (${organization}) for user ${email}`,
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
          userEmail: email,
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
            userEmail: email,
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
      `Finished creating notifications for grant ${grantId} (${organization}) for user ${email}`,
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