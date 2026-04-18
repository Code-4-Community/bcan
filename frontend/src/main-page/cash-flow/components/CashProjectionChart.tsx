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

const formatMonthYear = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

const generateMonthlyTicks = (data: ChartDataPoint[]) => {
  if (!data.length) return [];

  const sorted = [...data].sort((a, b) => a.month - b.month);

  const start = new Date(sorted[0].month);
  const end = new Date(sorted[sorted.length - 1].month);

  // normalize to first of month
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  const ticks: number[] = [];

  while (current <= end) {
    ticks.push(current.getTime());
    current.setMonth(current.getMonth() + 1);
  }

  const filteredTicks = ticks.filter((_, i) => i % 6 === 0)

  return filteredTicks;
};

const CashProjectionChart = observer(({ data }: ProjectionProps) => {

  const normalizeToMonthStart = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};

const normalizedData = data.map(d => ({
  ...d,
  month: normalizeToMonthStart(d.month),
}));


  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={normalizedData}
          margin={{ top: 20, right: 60, left: 30, bottom: 20 }}
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
            name="End Balance"
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
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={generateMonthlyTicks(data)}
            axisLine={true}
            tickLine={true}
            tickFormatter={formatMonthYear}
            interval="preserveStart"
            tick={{ fontSize: 12, dy: 10, textAnchor: "middle" }}
            className="axis"
          />
          <YAxis
            axisLine={true}
            tickLine={true}
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
            formatter={(value: number) =>
              `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default CashProjectionChart;
