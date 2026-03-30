import { Module } from '@nestjs/common';
import { RevenueService } from './cashflow-revenue.service';
import { RevenueController } from './cashflow-revenue.controller';


@Module({
  controllers: [RevenueController],
  providers: [RevenueService],
})
export class RevenueModule {}