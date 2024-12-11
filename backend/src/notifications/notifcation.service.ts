// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Notification } from './notification.model'; // Adjust the path as needed




AWS.config.update({ region: 'us-east-1' });  
// AWS.config.update({ region: 'us-east-2' });   
const dynamodb = new AWS.DynamoDB.DocumentClient();


@Injectable()
export class NotificationService {


 // Function to create a notification
 async createNotification(notification: Notification): Promise<Notification> {
 
   const alertTime = new Date(notification.alertTime); // Ensures a Date can be created from the given alertTime


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


 // function to find notifications by notification id
 async getNotificationByUserId(userId: string): Promise<Notification> {


   const params = {
       TableName: process.env.DYNAMODB_NOTIFICATION_TABLE_NAME || 'TABLE_FAILURE',
       Key: {
           userId : userId
       },
   };


   try {
       const data = await dynamodb.get(params).promise();


       if (!data.Item) {
           throw new Error('No notification with user id ' + userId + ' found.');
       }


       return data.Item as Notification;
   } catch (error) {
       console.log(error)
       throw new Error('Failed to retrieve notification.');
   }
}
}
