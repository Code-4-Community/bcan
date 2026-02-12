import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { observer } from "mobx-react-lite";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { getListApplied } from "../../../../../middle-layer/types/Status";

const DonutMoneyApplied = observer(({ grants }: { grants: Grant[] }) => {
  // Helper to sum values for given statuses
  const sumByStatus = (data: Record<string, number>, statuses: string[]) =>
    Object.entries(data)
      .filter(([status]) => statuses.includes(status))
      .reduce((sum, [, value]) => sum + value, 0);

  // Aggregate money by year
  const dataMoney = aggregateMoneyGrantsByYear(grants, "status").map(
    (grant: YearAmount) => ({
      year: grant.year.toString(),
      received: sumByStatus(grant.data, getListApplied(true)),
      unreceived: sumByStatus(grant.data, getListApplied(false)),
    })
  );

  // Summing values across years
  const [sumReceived, sumUnreceived] = dataMoney.reduce(
    ([sumR, sumU], { received, unreceived }) => [
      sumR + received,
      sumU + unreceived,
    ],
    [0, 0]
  );
  const total = sumReceived + sumUnreceived;
  const data = [
    { name: "Received", value: sumReceived, fill: "var(--color-primary-900)"},
    { name: "Unreceived", value: sumUnreceived, fill: "var(--color-primary-700)" },
  ];

  // Creating the label for the slices
  const LabelItem = ({
    name,
    value,
    percent,
    color,
  }: {
    name: string;
    value: number;
    percent: number;
    color: string;
  }) => {
    return (
      <div className="w-[100px] ">
        <div className="font-semibold">{name}</div>
        <div className="h-[0.15rem] w-[80%] mt-0 rounded-full"
          style={{
            backgroundColor: color,
          }}
        />
        <div className="text-sm font-medium text-grey-800 mt-1">
          {`${(percent * 100).toFixed(0)}% ($${(value / 1_000_000).toFixed(
            2
          )}M)`}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col align-center"
    >
      <div className="absolute w-full h-full flex flex-col">
        {/* Title */}
        <div className="text-lg font-semibold absolute text-left">
          Money Applied For {/* Total Amount */}
          <div className="text-2xl font-semibold mt-1 absolute">
            {`$${((sumReceived + sumUnreceived) / 1000000).toLocaleString(
              "en-us",
              {
                maximumFractionDigits: 2,
              }
            )}M`}
          </div>
          {/* Floating Right Label */}
          {sumUnreceived > 0 && (
            <div className="absolute top-2 right-2 p-4 mx-10 my-4 z-50 rounded-3xl bg-white bg-opacity-50">
              <LabelItem
                name="Unreceived"
                value={sumUnreceived}
                percent={sumUnreceived / total}
                color="var(--color-primary-700)"
              />
            </div>
          )}
          {/* Floating Left Label */}
          {sumReceived > 0 && (
            <div className="absolute -bottom-[240px] left-2 p-4 mx-10 my-4 z-50  rounded-3xl bg-white bg-opacity-50">
              <LabelItem
                name="Received"
                value={sumReceived}
                percent={sumReceived / total}
                color="var(--color-primary-900)"
              />
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart
          style={{ aspectRatio: 1 }}
          margin={{ top: 60, right:0, left: 100, bottom: 0 }}
        >
          <Pie
            data={data}
            startAngle={90}
            endAngle={450}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            cornerRadius={50}
            stroke="white"
            strokeWidth={2}
            label={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name,
            ]}
            contentStyle={{
              borderRadius: "12px",
              backgroundColor: "white",
              border: "1px solid lightgray",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export default DonutMoneyApplied;
