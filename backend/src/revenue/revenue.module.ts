import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { NotificationsModule } from '../notifications/notification.module';
@Module({
    imports: [NotificationsModule],
    controllers: [RevenueController],
    providers: [RevenueService],
})
export class RevenueModule { }