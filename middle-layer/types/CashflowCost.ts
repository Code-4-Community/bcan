import { TDateISO } from "../../backend/src/utils/date";
import { CostType } from "./CostType";

// Type defintion of a cost object of the cashflow portion of the app
export interface CashflowCost {
    name: string;
    amount: number;
    type: CostType;
    date: TDateISO;
}