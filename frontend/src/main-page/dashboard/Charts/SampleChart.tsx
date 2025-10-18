import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { observer } from "mobx-react-lite";
import { useProcessGrantData } from "../../../main-page/grants/filter-bar/processGrantData";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";

const SampleChart: React.FC = observer(() => {
  const { grants } = useProcessGrantData();
  // Wrap Legend with a React component type to satisfy JSX typing
  const LegendComp = Legend as unknown as React.ComponentType<any>;

  const data = aggregateMoneyGrantsByYear(grants, "status").map(
    (grant: YearAmount) => ({
      name: grant.year.toString(),
      active: grant.Active,
      inactive: grant.Inactive,
    })
  );

  return (
    <div className="chart-container">
      <BarChart
        width={600}
        responsive={true}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        <Bar
          type="monotone"
          stackId="a"
          dataKey="active"
          fill="#90c4e5"
          strokeWidth={2}
          name="Active Grants"
        />
        <Bar
          type="monotone"
          stackId="a"
          dataKey="inactive"
          fill="#F58D5C"
          strokeWidth={2}
          name="Inactive Grants"
        />
        <XAxis dataKey="name" />
        <YAxis
          width="auto"
          key={grants.length}
          responsive={true}
          tickFormatter={(value: number) => `$${value / 1000}k`}
        />
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <LegendComp />
      </BarChart>
    </div>
  );
});

export default SampleChart;
