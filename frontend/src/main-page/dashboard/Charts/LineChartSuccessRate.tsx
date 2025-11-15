import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { observer } from "mobx-react-lite";
import {
  aggregateMoneyGrantsByYear,
  aggregateCountGrantsByYear,
  YearAmount,
} from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { getListApplied } from "../../../../../middle-layer/types/Status";

const LineChartSuccessRate = observer(({ grants }: { grants: Grant[] }) => {
  // Wrap Legend with a React component type to satisfy JSX typing
  const LegendComp = Legend as unknown as React.ComponentType<any>;

  // Get status lists for received and unreceived
  const moneyReceived = getListApplied(true);
  const moneyUnreceived = getListApplied(false);

  // Formatting money data
  const data_money = aggregateMoneyGrantsByYear(grants, "status").map(
    (grant: YearAmount) => {
      const received = Object.entries(grant.data)
        .filter(([status]) => moneyReceived.includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      const unreceived = Object.entries(grant.data)
        .filter(([status]) => moneyUnreceived.includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      const captured =
        received + unreceived > 0 ? received / (received + unreceived) : 0;

      // Convert year to date for time series
      return {
        date: new Date(`${grant.year}-01-03`),
        money_captured: Number(captured.toFixed(2)),
      };
    }
  );

  // Formatting count data
  const data_count = aggregateCountGrantsByYear(grants, "status").map(
    (grant: YearAmount) => {
      const received = Object.entries(grant.data)
        .filter(([status]) => moneyReceived.includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      const unreceived = Object.entries(grant.data)
        .filter(([status]) => moneyUnreceived.includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

      const captured =
        received + unreceived > 0 ? received / (received + unreceived) : 0;

      // Convert year to date for time series
      return {
        date: new Date(`${grant.year}-01-04`),
        grants_captured: Number(captured.toFixed(2)),
      };
    }
  );

  // Merging the data into format for chart
  const data = data_money.map((moneyItem) => {
    const countItem = data_count.find(
      (c) => c.date.getFullYear() === moneyItem.date.getFullYear()
    );
    return {
      date: moneyItem.date,
      money_captured: moneyItem.money_captured,
      grants_captured: countItem?.grants_captured ?? 0,
    };
  });

  // Sort by date to ensure correct line order
  data.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="chart-container h-full">
      {/* Title */}
      <div className="text-lg w-full text-left font-semibold align">
        Success Rate by Year
      </div>
      <ResponsiveContainer
        width="100%"
        height="100%"
        maxHeight={300}
        min-width={400}
      >
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
        >
          <LegendComp
            wrapperStyle={{ paddingBottom: 40 }}
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
                style={{
                  color: "#000",
                  fontWeight: 500,
                  marginLeft: 5,
                  marginRight: 10,
                }}
              >
                {value}
              </span>
            )}
          />
          <CartesianGrid vertical={false} stroke="#aaa" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="money_captured"
            stroke="#F58D5C"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Money Captured"
          />

          <Line
            type="monotone"
            dataKey="grants_captured"
            stroke="#F8CC16"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Grants Captured"
          />
          <XAxis
            dataKey="date"
            type="number"
            domain={["auto", "auto"]}
            scale="time"
            dy={10}
            tickFormatter={(date: Date) => date.getFullYear().toString()}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width="auto"
            dx={-10}
            className="axis"
            tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            labelFormatter={(date: Date) => date.getFullYear().toString()}
            formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default LineChartSuccessRate;
