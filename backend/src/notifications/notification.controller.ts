import { Controller, Post, Body, Get, Query, Param, Patch, Put, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../../../middle-layer/types/Notification';
import { VerifyUserGuard } from '../guards/auth.guard';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NotificationBody } from './types/notification.types';


@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) { }

  /** 
  * allows to create a new notification
  */
  @Post()
  @ApiResponse({
    status: 201,
    description: "Notification created successfully"
  })

  @ApiResponse({
    status: 400,
    description: "{Error encountered}"
  })

  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })

  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })

  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async create(@Body() notification: NotificationBody): Promise<Notification> {
    // call the service's createNotification method and return the result
    return await this.notificationService.createNotification(notification as Notification);
  }

  /**
   * gets notifications based on the noticationId
  */ 
  @ApiResponse({
    status: 200,
    description: "Notification successfully retrieved"
  })
  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @Get(':notificationId')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async findByNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.getNotificationByNotificationId(notificationId);
  }

  /**
   * gets the current notifications for user based on the user id 
   */
  @ApiResponse({
    status: 200,
    description: "Retrieved current notifications for user"
  })
  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @Get('/user/:userId/current')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async findCurrentByUser(@Param('userId') userId: string) {
    return await this.notificationService.getCurrentNotificationsByUserId(userId);
  }

  /**
   * gets notifications by user id (sorted by most recent notifications first)
  */ 
  @ApiResponse({
    status: 200,
    description: "Notification successfully retrieved"
  })
  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @Get('/user/:userId')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async findByUser(@Param('userId') userId: string) {
    console.log("HERE")
    return await this.notificationService.getNotificationByUserId(userId);
  }

  /**
   * updates notification by its id
  */ 
  @ApiResponse({
    status: 200,
    description: "Notification updated"
  })
  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @Put(':notificationId')
  @ApiBody({ type: NotificationBody})
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async updateNotification(@Param('notificationId') notificationId: string, 
  @Body() notification: Partial<NotificationBody>){
    return await this.notificationService.updateNotification(notificationId, notification);
  }


  /**
   * Deletes the notification with the given id from the database, if it exists.
   * 
   * @param notificationId the id of the notification to delete
   */
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully"
  })
  @ApiResponse({
    status: 401,
    description: "{Error encountered}"
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden resource"
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error"
  })
  @Delete(':notificationId')
  @UseGuards(VerifyUserGuard)
  @ApiBearerAuth()
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.deleteNotification(notificationId);
  }
}