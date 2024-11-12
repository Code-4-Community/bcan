// src/notifications/notifications.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  // constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() notification: Partial<Notification>) {
    // return this.notificationsService.create(notification);
  }

  @Get()
  async findByUser(@Query('userId') userId: string) {
    // return this.notificationsService.findByUser(userId);
  }
}