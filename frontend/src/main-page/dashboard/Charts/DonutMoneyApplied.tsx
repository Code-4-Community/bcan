import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { observer } from "mobx-react-lite";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";
import "../styles/Dashboard.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { getListApplied } from "../../../../../middle-layer/types/Status";
import { FaCircle } from "react-icons/fa";
import { useState } from "react";

const DonutMoneyApplied = observer(({ grants }: { grants: Grant[] }) => {
  const [width, setWidth] = useState(0);

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
    }),
  );

  // Summing values across years
  const [sumReceived, sumUnreceived] = dataMoney.reduce(
    ([sumR, sumU], { received, unreceived }) => [
      sumR + received,
      sumU + unreceived,
    ],
    [0, 0],
  );
  const total = sumReceived + sumUnreceived;
  const data = [
    { name: "Received", value: sumReceived, fill: "var(--color-primary-900)" },
    {
      name: "Unreceived",
      value: sumUnreceived,
      fill: "var(--color-primary-700)",
    },
  ];

  // Creating the label for the slices
  const LabelItem = ({
    name,
    percent,
    color,
  }: {
    name: string;
    percent: number;
    color: string;
  }) => {
    return (
      <div className="flex flex-row items-center">
        <FaCircle className=" mr-2 text-sm" style={{ color }} />
        <div className="text-xs lg:text-sm font-medium text-grey-700">
          {`${(percent * 100).toFixed(0)}%`}&nbsp;{name}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col align-center h-full">
      <div className={`w-full ${width > 250 ? "mb-0" : "mb-14"}`}>
        {/* Title */}
        <div className="text-md lg:text-lg font-semibold text-left h-full align">
          Money Applied All Time {/* Total Amount */}
          <div className={`text-2xl lg:text-3xl  font-semibold`}>
            {`$${((sumReceived + sumUnreceived) / 1000000).toLocaleString(
              "en-us",
              {
                maximumFractionDigits: 2,
              },
            )}M`}
          </div>
          <div className={`gap-1 flex flex-col absolute ${width > 250 ? "mt-12" : "mt-2"}`}>
            <LabelItem
              name="Received"
              percent={sumReceived / total}
              color="var(--color-primary-900)"
            />
            <div className="rounded-3xl">
              <LabelItem
                name="Unreceived"
                percent={sumUnreceived / total}
                color="var(--color-primary-700)"
              />
            </div>
          </div>
        </div>
      </div>
      <ResponsiveContainer
        width="100%"
        height="100%"
        onResize={(w) => setWidth(w)}
      >
        <PieChart
          style={{ aspectRatio: 1 }}
          margin={{ top: 0, right: 0, left: width > 250 ? 150 : 0, bottom: 0 }}
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
