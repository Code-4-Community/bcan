// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notifcation.service';


@Module({
 providers: [NotificationService],
 controllers: [NotificationController],
 exports: [NotificationService],
})
export class NotificationsModule {}