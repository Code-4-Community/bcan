import CashProjectionChart from "./CashProjectionChart";

export default function CashProjection() {

  // replace with actual data
  const cards = [
    { field: "Final Balance", value: 38784, color: "text-blue" },
    { field: "Lowest Point", value: 38784, color: "text-grey" },
    { field: "Total Revenue", value: 20000, color: "text-green" },
    { field: "36-Mo Costs", value: 31212, color: "text-primary" },
  ];

  return (
    <div className="chart-container col-span-2 h-full flex flex-col">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"36-Month Cash Flow Projection"}
      </div>
      <CashProjectionChart />
      <div className="flex-wrap gap-2 items-center grid grid-cols-2 lg:grid-cols-4 mt-1">
        {cards.map((c) => (
          <div
            key={c.field}
            className="bg-grey-150 rounded px-2 py-2 min-w-0 flex-1 flex flex-col h-full"
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
