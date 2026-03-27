import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { CashflowCost } from '../../../../middle-layer/types/CashflowCost';
import { CostType } from '../../../../middle-layer/types/CostType';
import { TDateISO } from '../../utils/date';

export class CashflowCostDTO implements CashflowCost {
  @ApiProperty({ description: 'The name of the cost item', example: 'PM Salary' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The amount for the cost item', example: 12000 })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'The type of cost', enum: CostType, example: CostType.Salary })
  @IsEnum(CostType)
  type!: CostType;

  @ApiProperty({ description: 'Cost date in ISO 8601 format', example: '2026-03-14T00:00:00.000Z' })
  @IsDateString()
  date!: TDateISO;
}