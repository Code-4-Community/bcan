import { ApiProperty } from "@nestjs/swagger";
import { CashflowRevenue } from "../../../../middle-layer/types/CashflowRevenue";
import { Installment } from "../../../../middle-layer/types/Installment";
import { RevenueType } from "../../../../middle-layer/types/RevenueType";
export class CashflowRevenueDTO implements CashflowRevenue {
  @ApiProperty({ description: "The revenue amount", example: 1000 })
  amount!: number;

  @ApiProperty({ description: "The type of revenue", enum: RevenueType })
  type!: RevenueType;

  @ApiProperty({
    description: "The name of the revenue item",
    example: "Q1 Sales",
  })
  name!: string;

  @ApiProperty({
    description: "List of installments",
    example: [{ amount: 30000, date: "2026-03-14T00:00:00.000Z" }],
  })
  installments!: Installment[];
}
