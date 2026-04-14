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
import { ChartDataPoint } from "../projection";

type ProjectionProps = {
  data: ChartDataPoint[];
};

const formatMonthYear = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
};

const CashProjectionChart = observer(({ data }: ProjectionProps) => {
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
            dataKey="cashBalance"
            stroke="var(--color-blue)"
            strokeWidth={1.5}
            dot={{ r: 2.5 }}
            name="Cash Balance"
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-green)"
            strokeWidth={1.5}
            dot={{ r: 2.5 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="costs"
            stroke="var(--color-primary)"
            strokeWidth={1.5}
            dot={{ r: 2.5 }}
            name="Costs"
          />
          <XAxis
            dataKey="month"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            dy={10}
            style={{ fontSize: "var(--font-size-sm)" }}
            tickFormatter={formatMonthYear}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            dx={-10}
            className="axis"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "1rem",
              backgroundColor: "white",
              border: "1px solid lightgray",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "left",
            }}
            labelFormatter={formatMonthYear}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default CashProjectionChart;
