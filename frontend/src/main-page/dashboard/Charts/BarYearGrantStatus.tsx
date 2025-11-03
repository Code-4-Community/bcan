import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { observer } from "mobx-react-lite";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";

const BarYearGrantStatus = observer(
  ({ recentYear, grants }: { recentYear: number; grants: Grant[] }) => {

    // Filtering data for most receny year
    const recentData = grants.filter(
      (grant) =>
        new Date(grant.application_deadline).getFullYear() == recentYear
    );

    // Formatting data for chart
    const data = aggregateMoneyGrantsByYear(recentData, "status")
      .flatMap((grant: YearAmount) =>
        Object.entries(grant.data).map(([key, value]) => ({
          name: key,
          value,
        }))
      )
      .sort((a, b) => b.value - a.value);

    return (
      <div className="chart-container">
        {/* Title */}
        <div className="text-lg w-full text-left font-semibold align">
          Year Grant Status
        </div>
        {/* Year */}
        <div className="text-sm w-full text-left align">{recentYear}</div>
        <ResponsiveContainer width="100%" height={300} min-width={400}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 20, bottom: 30 }}
          >
            <YAxis
              axisLine={false}
              type="category"
              dx={-10}
              dataKey="name"
              tickLine={false}
            />
            <XAxis
              type="number"
              width="auto"
              hide
              key={grants.length}
              tickFormatter={(value: number) => `$${value / 1000}k`}
            />
            <Bar
              type="monotone"
              stackId="a"
              dataKey="value"
              fill="#F58D5C"
              strokeWidth={2}
              name="Active Grants"
              radius={[15, 15, 15, 15]}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(label: any) =>
                  typeof label === "number" ? `$${label / 1000}k` : label
                }
              />
            </Bar>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

export default BarYearGrantStatus;
