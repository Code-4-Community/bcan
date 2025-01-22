// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Notification } from './notification.model';



AWS.config.update({ region: 'us-east-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();


@Injectable()
export class NotificationService {


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
    await dynamodb.put(params).promise();
    return notification;
  }


  // function that returns array of notifications by user id (sorted by most recent notifications first)
  async getNotificationByUserId(userId: string): Promise<Notification[]> {

    console.log("USER ID", userId)

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
      console.log("HERE1")
      const data = await dynamodb.query(params).promise();
      console.log("HERE2")


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

    console.log("NOTIF ID", notificationId)

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
      const data = await dynamodb.query(params).promise();


      if (!data.Items) {
        throw new Error('No notifications with notification id ' + notificationId + ' found.');
      }


      return data.Items as Notification[];
    } catch (error) {
      console.log(error)
      throw new Error('Failed to retrieve notification.');
    }
  }

}