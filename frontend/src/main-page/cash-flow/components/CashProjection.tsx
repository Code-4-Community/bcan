import { CashflowKPIs, ChartDataPoint } from "../projection";
import CashProjectionChart from "./CashProjectionChart";

type ProjectionProps = {
  data: ChartDataPoint[];
  kpis: CashflowKPIs;
};

export default function CashProjection({ data, kpis }: ProjectionProps) {
  // replace with actual data
  const cards = [
    {
      field: "Final ProjectedBalance",
      value: kpis.finalBalance,
      color: "text-blue",
    },
    {
      field: "Lowest Point",
      value: kpis.lowestBalancePoint,
      color: "text-grey",
    },
    { field: "Total Revenue", value: kpis.totalRevenue, color: "text-green" },
    { field: "Total Costs", value: kpis.totalCosts, color: "text-primary" },
  ];

  return (
    <div className="chart-container col-span-2 h-full flex flex-col">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"36-Month Cash Flow Projection"}
      </div>
      <CashProjectionChart data={data} />
      <div className="flex-wrap gap-2 items-center grid grid-cols-2 xl:grid-cols-4 mt-1">
        {cards.map((c) => (
          <div
            key={c.field}
            className="bg-grey-150 rounded px-2 py-2 min-w-0 flex-1 flex flex-col h-full text-sm lg:text-base"
          >
            <div className={`font-semibold mb-auto ${c.color}`}>{c.field}</div>
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
