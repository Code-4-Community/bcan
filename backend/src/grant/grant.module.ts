import { Module } from '@nestjs/common';
import { GrantService } from './grant.service';
import { GrantController } from './grant.controller';
import { NotificationsModule } from '../notifications/notification.module';
@Module({
    imports: [NotificationsModule],
    controllers: [GrantController],
    providers: [GrantService]
})
export class GrantModule { }