import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { CashflowSettings } from "../../../../../middle-layer/types/CashflowSettings";
import { buildCashflowProjection } from "../projection";
import CashProjectionChart from "./CashProjectionChart";

type ProjectionProps = {
  costs: CashflowCost[];
  revenues: CashflowRevenue[];
  settings: CashflowSettings;
};

export default function CashProjection({
  costs,
  revenues,
  settings,
}: ProjectionProps) {
  // replace with actual data, filter for 36 months
  const { chartData, kpis } = buildCashflowProjection(
    revenues,
    costs,
    settings,
  );

  // replace with actual data
  const cards = [
    { field: "Final Balance", value: kpis.finalBalance, color: "text-blue" },
    {
      field: "Lowest Point",
      value: kpis.lowestBalancePoint,
      color: "text-grey",
    },
    { field: "Total Revenue", value: kpis.totalRevenue, color: "text-green" },
    { field: "36-Mo Costs", value: kpis.totalCosts, color: "text-primary" },
  ];

  return (
    <div className="chart-container col-span-2 h-full flex flex-col">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"36-Month Cash Flow Projection"}
      </div>
      <CashProjectionChart data={chartData} />
      <div className="flex-wrap gap-2 items-center grid grid-cols-2 xl:grid-cols-4 mt-1">
        {cards.map((c) => (
          <div
            key={c.field}
            className="bg-grey-150 rounded px-2 py-2 min-w-0 flex-1 flex flex-col h-full text-sm lg:text-base"
          >
            <div className={`font-semibold ${c.color}`}>{c.field}</div>
            <div>
              {c.value.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
