import { TDateISO } from "../../backend/src/utils/date";

export interface CashflowSettings {
  startingCash: number;
  salaryIncrease: number;
  benefitsIncrease: number;
  startDate: TDateISO;
}