import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GrantModule } from './grant/grant.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, UserModule, GrantModule, NotificationsModule],
})
export class AppModule {}