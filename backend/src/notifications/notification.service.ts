import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Notification } from '../../../middle-layer/types/Notification';

@Injectable()
export class NotificationService {

  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private ses = new AWS.SES({ region: process.env.AWS_REGION });
    private readonly logger = new Logger(NotificationService.name);


  // function to create a notification
  // Should this have a check to prevent duplicate notifications?
  async createNotification(notification: Notification): Promise<Notification> {

    const alertTime = new Date(notification.alertTime); // ensures a Date can be created from the given alertTime

    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      Item: {
        ...notification,
        alertTime: alertTime.toISOString(),
        sent: false // initialize sent to false when creating a new notification
      },
    };
    await this.dynamoDb.put(params).promise();
    return notification;
  }

  async  getCurrentNotificationsByUserId(userId: string): Promise<Notification[]> {
    const notifactions = await this.getNotificationByUserId(userId);
    
    const currentTime = new Date();

    return notifactions.filter(notification => new Date(notification.alertTime) <= currentTime);
  }


  // function that returns array of notifications by user id (sorted by most recent notifications first)
  async getNotificationByUserId(userId: string): Promise<Notification[]> {

    // KeyConditionExpression specifies the query condition
    // ExpressionAttributeValues specifies the actual value of the key
    // IndexName specifies our Global Secondary Index, which was created in the BCANNotifs table to 
    // allow for querying by userId, as it is not a primary/partition key
    const notificationTableName = process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;
    this.logger.log(`Fetching notifications for userId: ${userId} from table: ${notificationTableName}`);

        if (!notificationTableName) {
            this.logger.error('DYNAMODB_NOTIFICATION_TABLE_NAME is not defined in environment variables');
            throw new Error("Internal Server Error")
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

      return data.Items as Notification[];
    } catch (error) {
      this.logger.error(`Error retrieving notifications for userId: ${userId}`, error as string);
      throw new Error('Failed to retrieve notifications.');
    }
  }

  


  // function that returns array of notifications by notification id
  // should this exist?
  async getNotificationByNotificationId(notificationId: string): Promise<Notification[]> {

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
        throw new Error('No notifications with notification id ' + notificationId + ' found.');
      }


      return data.Items as Notification[];
    } catch (error) {
      console.log(error)
      throw new Error('Failed to retrieve notification.');
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
      return await this.ses.sendEmail(params).promise();
    } catch (err: unknown) {
      console.error('Error sending email: ', err);
      const errMessage = (err instanceof Error) ? err.message : 'Generic'; 
      throw new Error(`Failed to send email: ${errMessage}`);
    }
  }

  // function to update notification by its id
  async updateNotification(notificationId: string, updates: Partial<Notification>): Promise<string> {
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
      return JSON.stringify(result);
  } catch(err) {
      console.log(err);
      throw new Error(`Failed to update Notification ${notificationId}`)
  }
  }
  

  /**
   * Deletes the notification with the given id from the database and returns a success message if the deletion was successful
   * @param notificationId the id of the notification to delete
   */
  async deleteNotification(notificationId: string): Promise<string> {
    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      Key: {
        notificationId,
      },
      ConditionExpression: 'attribute_exists(notificationId)'
    }

    try {
      await this.dynamoDb.delete(params).promise()
      return `Notification with id ${notificationId} successfully deleted`
    } catch (error: any) {
      if (error.code === "ConditionalCheckFailedException") {
        throw new Error(`Notification with id ${notificationId} not found`)
      }

      console.error(error)
      throw new Error(`Failed to delete notification with id ${notificationId}`)
    }
  }
}