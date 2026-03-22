import { Module } from '@nestjs/common';
import { DefaultValuesController } from './default-values.controller';
import { DefaultValuesService } from './default-values.service';

@Module({
  controllers: [DefaultValuesController],
  providers: [DefaultValuesService],
})
export class DefaultValuesModule {}
