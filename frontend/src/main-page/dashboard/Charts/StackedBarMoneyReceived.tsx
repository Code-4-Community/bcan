import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { observer } from "mobx-react-lite";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { getListApplied } from "../../../../../middle-layer/types/Status";

const StackedBarMoneyReceived = observer(({ grants }: { grants: Grant[] }) => {
  // Wrap Legend with a React component type to satisfy JSX typing
  const LegendComp = Legend as unknown as React.ComponentType<any>;

  // Formatting data for chart
  const data = aggregateMoneyGrantsByYear(grants, "status").map(
    (grant: YearAmount) => {
      const received = Object.entries(grant.data)
        .filter(([status]) => getListApplied(true).includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      const unreceived = Object.entries(grant.data)
        .filter(([status]) => getListApplied(false).includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      return {
        name: grant.year.toString(),
        received,
        unreceived,
      };
    }
  );

  return (
    <div className="h-full flex-col">
      {/* Title */}
      <div className="text-lg w-full text-left font-semibold align">
        Money Received by Year
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <LegendComp
            wrapperStyle={{ paddingBottom: 15 }}
            iconType="circle"
            verticalAlign="top"
            align="left"
            formatter={(
              value:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined
            ) => (
              <span
                className="text-grey-700 text-sm ml-1 mr-5"
              >
                {value}
              </span>
            )}
          />
          <CartesianGrid vertical={false} stroke="lightgray" strokeDasharray="5 5" />
          <Bar
            type="monotone"
            stackId="a"
            dataKey="unreceived"
            fill="var(--color-primary-700)"
            strokeWidth={2}
            name="Unreceived"
            radius={[15, 15, 15, 15]}
          >
            <LabelList
              dataKey="unreceived"
              position="insideTop"
              style={{ fontSize: "var(--font-size-xs)" }}
              formatter={(label: any) =>
                typeof label === "number" && label > 0
                  ? `$${label / 1000}k`
                  : ""
              }
            />
          </Bar>
          <Bar
            type="monotone"
            stackId="a"
            dataKey="received"
            fill="var(--color-primary-900)"
            strokeWidth={2}
            name="Received"
            radius={[15, 15, 15, 15]}
          >
            <LabelList
              dataKey="received"
              position="insideTop"
              style={{ fontSize: "var(--font-size-xs)" }}
              formatter={(label: any) =>
                typeof label === "number" && label > 0
                  ? `$${label / 1000}k`
                  : ""
              }
            />
          </Bar>
          <XAxis dataKey="name" axisLine={true} dy={10} tickLine={false}  style={{fontSize: "var(--font-size-xs)"}}/>
          
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              backgroundColor: "white",
              border: "1px solid lightgray",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default StackedBarMoneyReceived;
