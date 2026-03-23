import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { observer } from "mobx-react-lite";
import "../../dashboard/styles/Dashboard.css";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";

type ChartProps = {
  costs: CashflowCost[];
  revenues: CashflowRevenue[];
};

const CashProjectionChart = observer(({}: ChartProps) => {

  // replace with actual data, filter for 36 months
  const data = [
    { date: new Date(), cash_balance: 68333, revenue: 10000, costs: 833 },
    {
      date: new Date("2026-04-20"),
      cash_balance: 7856,
      revenue: 19000,
      costs: 793,
    },
    {
      date: new Date("2026-05-19"),
      cash_balance: 98000,
      revenue: 16789,
      costs: 1000,
    },
  ];

  // Sort by date to ensure correct line order
  data.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="lightgray"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="cash_balance"
            stroke="var(--color-blue)"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Cash Balance"
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-green)"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="costs"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Costs"
          />
          <XAxis
            dataKey="date"
            type="number"
            domain={["auto", "auto"]}
            scale="time"
            dy={10}
            style={{ fontSize: "var(--font-size-sm)" }}
            tickFormatter={(date: Date) => date.getMonth().toLocaleString() + "/" + date.getFullYear()}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width="auto"
            dx={-10}
            className="axis"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              backgroundColor: "white",
              border: "1px solid lightgray",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            labelFormatter={(date: Date) =>
              date.getMonth().toLocaleString() + "/" + date.getFullYear()
            }
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default CashProjectionChart;
