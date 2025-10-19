import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "../../../main-page/grants/filter-bar/processGrantData";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";

const SampleChart: React.FC = observer(() => {
  const { grants } = ProcessGrantData();
  const data = aggregateMoneyGrantsByYear(grants, "status").map(
    (grant: YearAmount) => ({
      name: grant.year.toString(),
      active: grant.Active,
      inactive: grant.Inactive,
    })
  );

  return (
    <div>
      <BarChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        <Bar
          type="monotone"
          stackId="a"
          dataKey="active"
          fill="#90c4e5"
          strokeWidth={2}
          name="My data series name"
        />
        <Bar
          type="monotone"
          stackId="a"
          dataKey="inactive"
          fill="#F58D5C"
          strokeWidth={2}
          name="My data series name"
        />
        <XAxis dataKey="name" />
        <YAxis
          width="auto"
          label={{ value: "UV", position: "insideLeft", angle: -90 }}
        />
        <Tooltip />
      </BarChart>
    </div>
  );
});

export default SampleChart;
