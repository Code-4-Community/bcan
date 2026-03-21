import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GrantModule } from './grant/grant.module';
import { NotificationsModule } from './notifications/notification.module';
import { CashflowModule } from './cashflow/cashflow.module';
import { RevenueModule } from './revenue/revenue.module';

@Module({
  imports: [AuthModule, UserModule, GrantModule, NotificationsModule, CashflowModule, RevenueModule],
})
export class AppModule {}