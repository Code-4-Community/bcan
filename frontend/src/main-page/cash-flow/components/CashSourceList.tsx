import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { deleteCost, deleteRevenue } from "../processCashflowDataEditSave";
import CashEditLineItem from "./CashEditLineItem";
import CashEditCost from "./CashEditCost";

type SourceProps = {
  type: "Revenue" | "Cost";
  lineItems: CashflowRevenue[] | CashflowCost[];
};

export const formatMoney = (amount: number) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export default function CashSourceList({ type, lineItems }: SourceProps) {
  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {type}
        {" Sources"}
      </div>
      {/* map over list of source and put casheditlineitem for each */}
      <div className="flex flex-col gap-2">
        {lineItems.map((item) => (
          <div key={item.name}>
            <CashEditLineItem
              cardText={
                <div className="flex flex-col text-sm lg:text-base gap-1">
                  <div className="font-semibold">{item.type}</div>
                  {type === "Cost" && (
                    <div>
                      <div>
                        {formatMoney(item.amount)}
                        {"/year"}
                      </div>
                      <div>
                        {formatMoney(item.amount / 12)}
                        {"/month"}
                      </div>
                    </div>
                  )}
                  {type === "Revenue" && (
                    <div>{/* Revenue card info here */}</div>
                  )}
                </div>
              }
              sourceName={item.name}
              onRemove={() =>
                type === "Cost"
                  ? deleteCost(item.name)
                  : deleteRevenue(item.name)
              }
            >
              {(onClose) =>
                type === "Cost" && (
                  <CashEditCost
                    costItem={item as CashflowCost}
                    onClose={onClose}
                  />
                )
              }
            </CashEditLineItem>
          </div>
        ))}
      </div>
    </div>
  );
}
