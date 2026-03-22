import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GrantModule } from './grant/grant.module';
import { NotificationsModule } from './notifications/notification.module';
import { CashflowModule } from './cashflow/cashflow.module';
import { CostModule } from './cost/cashflow-cost.module';
import { DefaultValuesModule } from './default-values/default-values.module';

@Module({
  imports: [AuthModule, UserModule, GrantModule, NotificationsModule, CashflowModule, CostModule, DefaultValuesModule],
})
export class AppModule {}