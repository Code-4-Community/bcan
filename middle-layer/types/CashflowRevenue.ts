import { RevenueType } from "./RevenueType";
import { Installment } from "./Installment"



export interface CashflowRevenue {
    amount: number;
    type : RevenueType;
    name : string;
    installments: Installment[];

}

export interface GrantPageGrant extends CashflowRevenue {
isGrantBased: true; // Required to be true
grantId: number; // Required when isGrantBased is true
}