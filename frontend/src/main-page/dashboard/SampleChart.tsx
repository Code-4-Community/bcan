import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useProcessGrantData } from "../grants/filter-bar/processGrantData";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";

const SampleChart: React.FC = observer(() => {
  const { grants, onSort } = useProcessGrantData();
  const data = grants.map((grant) => ({
      name: new Date(grant.application_deadline).getFullYear().toString(),
      uv: grant.amount,
    }));

  //   const data = [
  //     { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  //     { name: "Page B", uv: 600, pv: 2400, amt: 2400 },
  //   ];

  useEffect(() => {
    grants
  }, [grants]);

  return (
    <div>
      {/* {grants.map((grant) => (
                <div key={grant.grantId}>
                    <p>{grant.title}</p>
                </div>
            ))} */}
      <BarChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        <Bar
          type="monotone"
          dataKey="uv"
          stroke="purple"
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
