import { TDateISO } from "../../utils/date";

export interface DefaultValuesResponse {
  startingCash: number;
  benefitsIncrease: number;
  salaryIncrease: number;
  startDate: TDateISO;
}

export interface UpdateDefaultValueBody {
  key: string;
  value: number | TDateISO;
}
