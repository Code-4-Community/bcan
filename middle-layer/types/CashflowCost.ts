import { CostType } from "./CostType";



export interface CashflowCost {
    amount: number;
    type : CostType;
    name : string;
}