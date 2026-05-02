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
    this.logger.log(`Starting notification creation for user: ${notification.userEmail}`);

    // validate required fields
    if (!notification.userEmail || !notification.notificationId) {
      this.logger.error('Missing required fields in notification');
      throw new BadRequestException('user and notificationId are required');
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
    this.logger.error(`Failed to create notification for userEmail ${notification.userEmail}:`, error);
    throw new InternalServerErrorException('Failed to create notification');
  }
}

  // Function that retreives all current notifications for a user
  async  getCurrentNotificationsByEmail(userEmail: string): Promise<Notification[]> {
    this.logger.log(`Fetching current notifications for userEmail: ${userEmail}`);
    
    try {const notifactions = await this.getNotificationByUserEmail(userEmail);
    
    const currentTime = new Date();

    this.logger.log(`Found current notifications for userEmail ${userEmail}`);

    const currentNotifications = notifactions.filter(notification => new Date(notification.alertTime) <= currentTime);
    this.logger.log(`Filtered current notifications for userEmail ${userEmail}, count: ${currentNotifications.length}`);
    return currentNotifications;
  } catch (error) {
    this.logger.error("Failed to notifications by user id error: " + error)
    throw error;
    }
  }


  // Function that returns array of notifications by user email (sorted by most recent notifications first)
  async getNotificationByUserEmail(email: string): Promise<Notification[]> {

    // KeyConditionExpression specifies the query condition
    // ExpressionAttributeValues specifies the actual value of the key
    // IndexName specifies our Global Secondary Index, which was created in the BCANNotifs table to 
    // allow for querying by userEmail, as it is not a primary/partition key
    const notificationTableName = process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;
    this.logger.log(`Fetching notifications for userEmail: ${email} from table: ${notificationTableName}`);

        if (!notificationTableName) {
            this.logger.error('DYNAMODB_NOTIFICATION_TABLE_NAME is not defined in environment variables');
            throw new InternalServerErrorException("Internal Server Error")
        }
    const params = {
      TableName: notificationTableName,
      IndexName: 'userEmail-alertTime-index',
      KeyConditionExpression: 'userEmail = :userEmail',
      ExpressionAttributeValues: {
        ':userEmail': email,
      },
      ScanIndexForward: false // sort in descending order
    };

    try {

      
      const data = await this.dynamoDb.query(params).promise();

      // This is never hit, because no present userEmail throws an error
      if (!data || !data.Items || data.Items.length == 0) {
        this.logger.warn(`No notifications found for user : ${email}`);
        return [] as Notification[];
      }

      this.logger.log(`Retrieved ${data.Items.length} notifications for user ${email}`);
      this.logger.debug("Notifications retrieved: ", data.Items.map(item => item.message));
      return data.Items as Notification[];
    } catch (error) {
      this.logger.error(`Error retrieving notifications for user : ${email}`, error as string);
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
     'invalid-email-address';

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
  

  // Function to get all notifications belonging to a given grant
  async getNotificationsByGrantId(grantId: number): Promise<Notification[]> {
    this.logger.log(`Fetching notifications for grantId: ${grantId}`);
    const tableName = process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE';

    const results: Notification[] = [];
    let lastEvaluatedKey: AWS.DynamoDB.DocumentClient.Key | undefined = undefined;

    try {
      do {
        const params: AWS.DynamoDB.DocumentClient.ScanInput = {
          TableName: tableName,
          FilterExpression: 'grantId = :grantId',
          ExpressionAttributeValues: { ':grantId': grantId },
          ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
        };

        const data = await this.dynamoDb.scan(params).promise();
        results.push(...((data.Items || []) as Notification[]));
        lastEvaluatedKey = data.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      this.logger.log(`Found ${results.length} notifications for grantId: ${grantId}`);
      return results;
    } catch (error) {
      this.logger.error(`Failed to retrieve notifications for grantId: ${grantId}`, error);
      throw new InternalServerErrorException('Failed to retrieve notifications by grant');
    }
  }

  // Updates the userEmail and organization on all notifications belonging to a grant
  async updateNotificationsEmailAndOrgByGrantId(grantId: number, newEmail: string, newOrg: string): Promise<void> {
    this.logger.log(`Updating userEmail to ${newEmail} and organization to ${newOrg} for all notifications of grantId: ${grantId}`);

    const notifications = await this.getNotificationsByGrantId(grantId);

    for (const n of notifications) {
      const updates: Partial<Notification> = {};

      if (n.userEmail !== newEmail) {
        updates.userEmail = newEmail;
      }

      const updatedMessage = n.message.replace(/ for .+$/, ` for ${newOrg}`);
      if (updatedMessage !== n.message) {
        updates.message = updatedMessage;
      }
      
      if (Object.keys(updates).length > 0) {
        await this.updateNotification(n.notificationId, updates);
      }
    }

    this.logger.log(`Updated ${notifications.length} notifications for grantId: ${grantId}`);
  }

  // Deletes all notifications for a given user email
  async deleteNotificationsByUserEmail(email: string): Promise<void> {
    const notifications = await this.getNotificationByUserEmail(email);
    if (notifications.length === 0) {
      this.logger.log(`No notifications to delete for user ${email}`);
      return;
    }

    const tableName = process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE';
    for (let i = 0; i < notifications.length; i += 25) {
      const chunk = notifications.slice(i, i + 25);
      const deleteRequests = chunk.map(n => ({
        DeleteRequest: { Key: { notificationId: n.notificationId } },
      }));
      await this.dynamoDb.batchWrite({
        RequestItems: { [tableName]: deleteRequests },
      }).promise();
    }

    this.logger.log(`Deleted ${notifications.length} notifications for user ${email}`);
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