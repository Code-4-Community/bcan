import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { deleteCost, deleteRevenue } from "../processCashflowDataEditSave";
import CashEditLineItem from "./CashEditLineItem";
import CashEditRevenue from "./CashEditRevenue";
import { formatMoney } from "../CashFlowPage";
import { useNavigate } from "react-router-dom";
import CashAddEditCost from "./CashAddEditCost";

type SourceProps = {
  type: "Revenue" | "Cost";
  lineItems: CashflowRevenue[] | CashflowCost[];
};

const formatInstallmentDate = (dateValue: Date | string) => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  

  return parsedDate.toLocaleDateString();
};

export default function CashSourceList({ type, lineItems }: SourceProps) {
  const navigate = useNavigate();

  return (
    <div className="chart-container col-span-2 h-fit">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {type}
        {" Sources"}
      </div>
      {/* map over list of source and put casheditlineitem for each */}
      <div className="flex flex-col gap-2">
        {lineItems.map((item) => {
          const isGrantPageGrantRevenue = type === "Revenue" && (item as any).isGrantBased === true;

          return (
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
                      <div>
                        {(item as CashflowRevenue).installments.map((installment, index) => (
                          <div key={`${item.name}-installment-${index}`}>
                            {formatMoney(installment.amount)}
                            {" • "}
                            {formatInstallmentDate(installment.date)}
                          </div>
                        ))}
                        <div className="font-semibold pt-1">
                          {"Total: "}{formatMoney(item.amount)}
                        </div>
                      </div>
                    )}
                  </div>
                }
                sourceName={item.name}
                onRemove={() =>
                  type === "Cost"
                    ? deleteCost(item.name)
                    : deleteRevenue(item.name)
                }
                isReadOnly={isGrantPageGrantRevenue}
                onReadOnlyAction={() => {
                  if (isGrantPageGrantRevenue) {
                    const grantId = (item as any).grantId;
                    if (typeof grantId === "number") {
                      navigate("/main/all-grants", {
                        state: { selectedGrantId: grantId },
                      });
                    }
                  }
                }}
              >
                {(onClose) =>
                  type === "Cost" ? (
                    <CashAddEditCost
                      costItem={item as CashflowCost}
                      onClose={onClose}
                    />
                  ) : (
                    <CashEditRevenue
                      revenueItem={item as CashflowRevenue}
                      onClose={onClose}
                    />
                  )
                }
              </CashEditLineItem>
            </div> 
          )
        })}
      </div>
    </div>
  );
}
