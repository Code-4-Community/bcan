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
import {
  aggregateCountGrantsByYear,
  aggregateMoneyGrantsByYear,
  YearAmount,
} from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { useState } from "react";
import tailwindConfig from "../../../../tailwind.config";

const BarYearGrantStatus = observer(
  ({ recentYear, grants }: { recentYear: number; grants: Grant[] }) => {
    const [checked, setChecked] = useState(true);

    // Filtering data for most receny year
    const recentData = grants.filter(
      (grant) =>
        new Date(grant.application_deadline).getFullYear() == recentYear
    );

    // Formatting data for chart
    const data_money = aggregateMoneyGrantsByYear(recentData, "status")
      .flatMap((grant: YearAmount) =>
        Object.entries(grant.data).map(([key, value]) => ({
          name: key,
          value,
        }))
      )
      .sort((a, b) => b.value - a.value);

    const data_count = aggregateCountGrantsByYear(recentData, "status")
      .flatMap((grant: YearAmount) =>
        Object.entries(grant.data).map(([key, value]) => ({
          name: key,
          value,
        }))
      )
      .sort((a, b) => b.value - a.value);

    return (
      <div className="chart-container">
        <div className="flex flex-row w-full justify-between">
          <div>
            {/* Title */}
            <div className="text-lg w-full text-left font-semibold align">
              Year Grant Status
            </div>
            {/* Year */}
            <div className="text-sm w-full text-left align">{recentYear}</div>
          </div>
          {/* Toggle */}
          <div className="mt-2">
            <label className="inline-flex items-center mb-5 cursor-pointer">
              <span className="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Count
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="sr-only peer"
                style={{display:"none"}}
              />
              <div className=" bg-light-orange relative w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-dark-orange rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-allpeer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Money
              </span>
            </label>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={450} min-width={400}>
          <BarChart
            data={checked ? data_money : data_count}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 40, bottom: 30 }}
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
              tickFormatter={(value: number) =>
                checked ? `$${value / 1000}k` : `${value}`
              }
            />
            <Bar
              type="monotone"
              stackId="a"
              dataKey="value"
              fill={tailwindConfig.theme.colors["medium-orange"]}
              strokeWidth={2}
              name="Grants"
              radius={[15, 15, 15, 15]}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(label: any) =>
                  typeof label === "number"
                    ? checked
                      ? `$${label / 1000}k`
                      : `${label}`
                    : label
                }
              />
            </Bar>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                backgroundColor: "white",
                border: "1px solid lightgray",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) =>
                checked ? `$${value.toLocaleString()}` : `${value}`
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

export default BarYearGrantStatus;
