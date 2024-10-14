import { Module } from '@nestjs/common';
import { GrantService } from './grant.service';
import { GrantController } from './grant.controller';

@Module({
    controllers: [GrantController],
    providers: [GrantService],
})
export class GrantModule { }