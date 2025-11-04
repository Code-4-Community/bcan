import { observer } from "mobx-react-lite";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

const KPICard = observer(
  ({
    title,
    recentYear,
    priorYear,
    formattedValue,
    percentChange,
  }: {
    title: string;
    recentYear: number;
    priorYear: number;
    formattedValue: string;
    percentChange: number;
  }) => {
    return (
      <div className="chart-container kpi-card w-full flex flex-col justify-between">
        {/* Title */}
        <div className="text-lg w-full text-left font-semibold">{title}</div>

        {/* Value and Percent Change */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="text-xl font-semibold text-left">
            {formattedValue}
          </div>

          {priorYear && (
            <div className="text-sm text-right flex items-center justify-end">
              {percentChange >= 0
                ? `+${percentChange.toFixed(0)}%`
                : `-${Math.abs(percentChange).toFixed(0)}%`}
              {percentChange >= 0 ? (
                <FaArrowTrendUp className="inline ms-2 text-green-600 text-sm" />
              ) : (
                <FaArrowTrendDown className="inline ms-2 text-red-600 text-sm" />
              )}
            </div>
          )}
        </div>

        {/* Year comparison at bottom */}
        <div className="text-sm text-left mt-auto text-gray-500 w-full">
          {recentYear}
          {priorYear ? ` vs. ${priorYear}` : ""}
        </div>
      </div>
    );
  }
);

export default KPICard;
