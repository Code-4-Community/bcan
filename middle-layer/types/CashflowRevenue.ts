import { RevenueType } from "./RevenueType";
import { Installment } from "./Installment"



export interface CashflowRevenue {
    amount: number;
    type : RevenueType;
    name : string;
    installments: Installment[];

}