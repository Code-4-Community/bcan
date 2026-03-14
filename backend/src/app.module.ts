import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GrantModule } from './grant/grant.module';
import { NotificationsModule } from './notifications/notification.module';
import { CashflowModule } from './cashflow/cashflow.module';

@Module({
  imports: [AuthModule, UserModule, GrantModule, NotificationsModule,CashflowModule],
})
export class AppModule {}