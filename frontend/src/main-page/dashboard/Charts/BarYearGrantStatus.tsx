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
      <div className="">
        <div className="flex flex-row w-full justify-between">
          <div>
            {/* Title */}
            <div className="text-md lg:text-lg w-full text-left font-semibold align">
              Grant Status
            </div>
            {/* Year */}
            <div className="text-sm w-full text-left align">{recentYear}</div>
          </div>
          {/* Toggle */}
          <div className="mt-2">
            <label className="inline-flex items-center mb-5 cursor-pointer">
              <span className="me-3 text-sm font-medium text-gray-900">
                Count
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="sr-only peer"
                style={{display:"none"}}
              />
              <div className=" bg-primary-700 relative w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-allpeer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">
                Money
              </span>
            </label>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150} min-width={400}>
          <BarChart
            data={checked ? data_money : data_count}
            layout="horizontal"
            margin={{ top: 25, right: 20, left: 20, bottom: 0 }}
          >
            <XAxis
              axisLine={false}
              type="category"
              dataKey="name"
              tickLine={false}
              style={{fontSize: "var(--font-size-sm)"}}
            />
            <YAxis
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
              fill="var(--color-primary-900)"
              strokeWidth={2}
              name="Grants"
              radius={[15, 15, 15, 15]}
            >
              <LabelList
                dataKey="value"
                position="top"
                style={{fontSize: "var(--font-size-xs)", fill: "var(--color-grey-600)"}}
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
