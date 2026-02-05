import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Notification } from '../../../middle-layer/types/Notification';

@Injectable()
export class NotificationService {

  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private ses = new AWS.SES({ region: process.env.AWS_REGION });
    private readonly logger = new Logger(NotificationService.name);


  // Function to create a notification in DynamoDB for a specific user
  // Should this have a check to prevent duplicate notifications?
  async createNotification(notification: Notification): Promise<Notification> {
    this.logger.log(`Starting notification creation for userId: ${notification.userId}`);

    // validate required fields
    if (!notification.userId || !notification.notificationId) {
      this.logger.error('Missing required fields in notification');
      throw new BadRequestException('userId and notificationId are required');
    }

    // validate and parse alertTime
    const alertTime = new Date(notification.alertTime); // ensures a Date can be created from the given alertTime
    if (isNaN(alertTime.getTime())) {
      this.logger.error(`Invalid alertTime provided: ${notification.alertTime}`);
      throw new BadRequestException('Invalid alertTime format');
    }

    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      Item: {
        ...notification,
        alertTime: alertTime.toISOString(),
        sent: false // initialize sent to false when creating a new notification
      },
    };

    try {
    await this.dynamoDb.put(params).promise();
    this.logger.log(`Notification created successfully with Id: ${notification.notificationId}`);
    return notification;
  } catch (error) {
    this.logger.error(`Failed to create notification for userId ${notification.userId}:`, error);
    throw new InternalServerErrorException('Failed to create notification');
  }
}

  // Function that retreives all current notifications for a user
  async  getCurrentNotificationsByUserId(userId: string): Promise<Notification[]> {
    this.logger.log(`Fetching current notifications for userID: ${userId}`);
    
    try {const notifactions = await this.getNotificationByUserId(userId);
    
    const currentTime = new Date();

    this.logger.log(`Found current notifications for userID ${userId}`);
    return notifactions.filter(notification => new Date(notification.alertTime) <= currentTime);
  } catch (error) {
    this.logger.error("Failed to notifications by user id error: " + error)
    throw error;
    }
  }


  // Function that returns array of notifications by user id (sorted by most recent notifications first)
  async getNotificationByUserId(userId: string): Promise<Notification[]> {

    // KeyConditionExpression specifies the query condition
    // ExpressionAttributeValues specifies the actual value of the key
    // IndexName specifies our Global Secondary Index, which was created in the BCANNotifs table to 
    // allow for querying by userId, as it is not a primary/partition key
    const notificationTableName = process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;
    this.logger.log(`Fetching notifications for userId: ${userId} from table: ${notificationTableName}`);

        if (!notificationTableName) {
            this.logger.error('DYNAMODB_NOTIFICATION_TABLE_NAME is not defined in environment variables');
            throw new InternalServerErrorException("Internal Server Error")
        }
    const params = {
      TableName: notificationTableName,
      IndexName: 'userId-alertTime-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false // sort in descending order
    };

    try {

      
      const data = await this.dynamoDb.query(params).promise();

      // This is never hit, because no present userId throws an error
      if (!data || !data.Items || data.Items.length == 0) {
        this.logger.warn(`No notifications found for userId: ${userId}`);
        return [] as Notification[];
      }

      this.logger.log(`Retrieved ${data.Items.length} notifications for userId ${userId}`);
      return data.Items as Notification[];
    } catch (error) {
      this.logger.error(`Error retrieving notifications for userId: ${userId}`, error as string);
      throw new InternalServerErrorException('Failed to retrieve notifications.');
    }
  }

  


  // Function that returns array of notifications by notification id
  // should this exist?
  async getNotificationByNotificationId(notificationId: string): Promise<Notification[]> {
    this.logger.log(`Fetching notification with notificationId: ${notificationId}`)

    // key condition expression specifies the query condition
    // expression attribute values specifies the actual value of the key
    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      KeyConditionExpression: 'notificationId = :notificationId',
      ExpressionAttributeValues: {
        ':notificationId': notificationId,
      },
    };


    try {
      const data = await this.dynamoDb.query(params).promise();


      if (!data.Items) {
        this.logger.error(`No notifications found with notification id: ${notificationId}`);
        throw new NotFoundException('No notifications with notification id ' + notificationId + ' found.');
      }

      this.logger.log(`Successfully retrieved ${data.Items.length} notification(s) for notification id: ${notificationId}`);
      return data.Items as Notification[];
    } catch (error) {
      // if error is already NotFoundException, we re-throw it
      if (error instanceof NotFoundException) {
        this.logger.error("Could not find notifaction error: ", error)
        throw error;
      }
      this.logger.error(`Failed to retrieve notification with notificationId: ${notificationId}`, error);
      throw new InternalServerErrorException('Failed to retrieve notification.');
    }
  }

  /**
   * Send an email using AWS SES
   * @param to The recipient email address
   * @param subject The email subject
   * @param body The email body
   */
  async sendEmailNotification(
    to: string,
    subject: string,
    body: string
  ): Promise<AWS.SES.SendEmailResponse> {
    // Default to an invalid email to prevent non-verified sender mails
    // if BCAN's is not defined in the environment
    this.logger.log(`Sending email notification to: ${to}, subject: ${subject}`);
    const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER ||
     'u&@nveR1ified-failure@dont-send.com';

    const params: AWS.SES.SendEmailRequest = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        // UTF-8 is a top reliable way to define special characters and symbols in emails
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: {
          Text: { Charset: 'UTF-8', Data: body },
        },
      },
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      this.logger.log(`Email sent successfully to ${to}`);
      return result
    } catch (err: unknown) {
      this.logger.error('Error sending email: ', err);
      throw new InternalServerErrorException(`Internal Server Error`);
    }
  }

  // Function to update notification by its id
  async updateNotification(notificationId: string, updates: Partial<Notification>): Promise<string> {
    this.logger.log(`Starting update for notificationId: ${notificationId}`);
    const updateKeys = Object.keys(updates);
    const UpdateExpression = "SET " + updateKeys.map(k => `#${k} = :${k}`).join(", ");
    const ExpressionAttributeNames = updateKeys.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
    const ExpressionAttributeValues = updateKeys.reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key as keyof Notification] }), {});
    
    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME!,
      Key: { notificationId },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };
  
    try {
      const result = await this.dynamoDb.update(params).promise();
      this.logger.log(`Notification with notificationId: ${notificationId} updated successfully`)
      return JSON.stringify(result);
  } catch(err) {
      this.logger.error(`Failed to update notification ${notificationId}:`, err as string);
      throw new InternalServerErrorException(`Failed to update Notification ${notificationId}`)
  }
  }
  

  /**
   * Deletes the notification with the given id from the database and returns a success message if the deletion was successful
   * @param notificationId the id of the notification to delete
   */
  async deleteNotification(notificationId: string): Promise<string> {
    this.logger.log(`Starting notification deletion for notificationId: ${notificationId}`);
    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      Key: {
        notificationId,
      },
      ConditionExpression: 'attribute_exists(notificationId)'
    }

    try {
      await this.dynamoDb.delete(params).promise()
      this.logger.log(`NotificationId ${notificationId} successfully deleted`);
      return `Notification with id ${notificationId} successfully deleted`
    } catch (error: any) {
      if (error.code === "ConditionalCheckFailedException") {
        this.logger.error(`Notification with id ${notificationId} not found for deletion`);
        throw new NotFoundException(`Notification with id ${notificationId} not found`)
      }

      this.logger.error(`Failed to delete notification ${notificationId}:`, error as string);
      throw new InternalServerErrorException(`Failed to delete notification with id ${notificationId}`)
    }
  }
}