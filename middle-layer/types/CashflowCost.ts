import { TDateISO } from "../utils/date";
import { CostType } from "./CostType";

export interface CashflowCost {
    name: string;
    amount: number;
    type: CostType;
    date: TDateISO;
}