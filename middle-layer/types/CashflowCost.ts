import { TDateISO } from "../../backend/src/utils/date";
import { CostType } from "./CostType";
import { Frequency } from "./Frequency";

// Type defintion of a cost object of the cashflow portion of the app
export interface CashflowCost {
    name: string;
    amount: number;
    type: CostType;
    date: TDateISO;
    frequency: Frequency;
    interval: number; // Only applicable for recurring costs, represents the number of months between each occurrence
}