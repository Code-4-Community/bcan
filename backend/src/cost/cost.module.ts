import { Module } from '@nestjs/common';
import { CostController } from './cost.controller';
import { CostService } from './cost.service';

@Module({
  controllers: [CostController],
  providers: [CostService],
})
export class CostModule {}
