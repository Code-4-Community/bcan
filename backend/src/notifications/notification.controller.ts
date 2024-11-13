// src/notifications/notifications.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { NotificationService } from './notifcation.service';
import { Notification } from './notification.model';

@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  async create(@Body() notification: Partial<Notification>): Promise<Notification> {
    // Call the service's createNotification method and return the result
    return await this.notificationService.createNotification(notification as Notification);
  }

  @Get(':userId')
  async findByUser(@Query('userId') userId: string) {
    return await this.notificationService.getNotificationByUserId(userId);
  }

}