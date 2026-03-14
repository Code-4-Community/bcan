import { Module } from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { CashflowController } from './cashflow.controller';


@Module({
  controllers: [CashflowController],
  providers: [CashflowService],
})
export class CashflowModule {}