import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notifcation.service';

@Module({
 providers: [NotificationService], // providers perform business logic
 controllers: [NotificationController], // controllers directly take in http requests
 // and are the starting point for anything happening
 exports: [NotificationService], // by putting it under exports, this service is available
 // to other modules outside of this
})
export class NotificationsModule {}