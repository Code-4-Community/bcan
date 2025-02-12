import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Notification } from './notification.model';

@Injectable()
export class NotificationService {

  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private ses = new AWS.SES({ region: process.env.AWS_REGION });

  // function to create a notification
  async createNotification(notification: Notification): Promise<Notification> {

    const alertTime = new Date(notification.alertTime); // ensures a Date can be created from the given alertTime

    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      Item: {
        ...notification,
        alertTime: alertTime.toISOString(),
      },
    };
    await this.dynamoDb.put(params).promise();
    return notification;
  }


  // function that returns array of notifications by user id (sorted by most recent notifications first)
  async getNotificationByUserId(userId: string): Promise<Notification[]> {

    // KeyConditionExpression specifies the query condition
    // ExpressionAttributeValues specifies the actual value of the key
    // IndexName specifies our Global Secondary Index, which was created in the BCANNotifs table to 
    // allow for querying by userId, as it is not a primary/partition key
    const params = {
      TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
      IndexName: 'userId-alertTime-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false // sort in descending order
    };

    try {
      const data = await this.dynamoDb.query(params).promise();

      if (!data.Items) {
        throw new Error('No notifications with user id ' + userId + ' found.');
      }

      return data.Items as Notification[];
    } catch (error) {
      console.log(error)
      throw new Error('Failed to retrieve notifications.');
    }
  }


  // function that returns array of notifications by notification id
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
    const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER
     || 'bcanEMAILMANE';

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

}