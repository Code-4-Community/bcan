import { Controller, Post, Body, Get, Query, Param, Patch, Put, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../../../middle-layer/types/Notification';


@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) { }

  // allows to create a new notification
  @Post()
  async create(@Body() notification: Partial<Notification>): Promise<Notification> {
    // call the service's createNotification method and return the result
    return await this.notificationService.createNotification(notification as Notification);
  }

  // gets notifications based on the noticationId
  @Get(':notificationId')
  async findByNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.getNotificationByNotificationId(notificationId);
  }

  // gets notifications by user id (sorted by most recent notifications first)
  @Get('/user/:userId')
  async findByUser(@Param('userId') userId: string) {
    console.log("HERE")
    return await this.notificationService.getNotificationByUserId(userId);
  }

  // updates notification by its id
  @Put(':notificationId')
  async updateNotification(@Param('notificationId') notificationId: string, 
  @Body() notification: Partial<Notification>){
    return await this.notificationService.updateNotification(notificationId, notification);
  }


  /**
   * Deletes the notification with the given id from the database, if it exists.
   * 
   * @param notificationId the id of the notification to delete
   */
  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.deleteNotification(notificationId);
  }
}