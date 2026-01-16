import { Controller, Post, Body, Get, Query, Param, Patch, Put, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../../../middle-layer/types/Notification';
import { VerifyUserGuard } from '../guards/auth.guard';


@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) { }

  // allows to create a new notification
  @Post()
  @UseGuards(VerifyUserGuard)
  async create(@Body() notification: Partial<Notification>): Promise<Notification> {
    // call the service's createNotification method and return the result
    return await this.notificationService.createNotification(notification as Notification);
  }

  // gets notifications based on the noticationId
  @Get(':notificationId')
  @UseGuards(VerifyUserGuard)
  async findByNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.getNotificationByNotificationId(notificationId);
  }

  @Get('/user/:userId/current')
  @UseGuards(VerifyUserGuard)
  async findCurrentByUser(@Param('userId') userId: string) {
    return await this.notificationService.getCurrentNotificationsByUserId(userId);
  }

  // gets notifications by user id (sorted by most recent notifications first)
  @Get('/user/:userId')
  @UseGuards(VerifyUserGuard)
  async findByUser(@Param('userId') userId: string) {
    console.log("HERE")
    return await this.notificationService.getNotificationByUserId(userId);
  }

  // updates notification by its id
  @Put(':notificationId')
  @UseGuards(VerifyUserGuard)
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
  @UseGuards(VerifyUserGuard)
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.deleteNotification(notificationId);
  }
}