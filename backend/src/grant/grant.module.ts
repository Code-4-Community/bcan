import { Module } from '@nestjs/common';
import { GrantService } from './grant.service';
import { GrantController } from './grant.controller';
import { NotificationsModule } from '../notifications/notification.module';
@Module({
    controllers: [GrantController],
    providers: [GrantService],
    imports: [NotificationsModule],
})
export class GrantModule { }