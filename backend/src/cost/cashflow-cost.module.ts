import { Module } from '@nestjs/common';
import { CostController } from './cashflow-cost.controller';
import { CostService } from './cashflow-cost.service';

@Module({
  controllers: [CostController],
  providers: [CostService],
})
export class CostModule {}
