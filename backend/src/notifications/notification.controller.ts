import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { NotificationService } from './notifcation.service';
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


}