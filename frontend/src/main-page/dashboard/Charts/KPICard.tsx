import { observer } from "mobx-react-lite";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

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
      <div className="chart-container bg-white w-full flex flex-col justify-between">
        {/* Title */}
        <div className="text-md lg:text-lg  w-full text-left font-semibold">{title}</div>
        <div className="text-2xl lg:text-3xl font-semibold text-left">{formattedValue}</div>
        {/* Value and Percent Change */}
        <div className="flex flex-row justify-between items-center w-full mt-auto">
          {priorYear && (
            <div className="text-xs lg:text-sm text-right flex items-center justify-end mr-1">
              {percentChange === 0 && (
                <span className="flex items-center text-grey-700">
                  <span className="inline mr-1 font-bold">-</span>
                  {` 0%`}
                </span>
              )}
              {percentChange > 0 && (
                <span className="flex items-center text-green">
                  <FaArrowUp className="inline "></FaArrowUp>
                  {`${percentChange.toFixed(0)}%`}
                </span>
                
              )}
              {percentChange < 0 && (
                <span className="flex items-center text-red">
                  <FaArrowDown className="inline"></FaArrowDown>
                 {`${Math.abs(percentChange).toFixed(0)}%`}
                </span>
              )}
              </div>
          )}
          {/* Year comparison at bottom */}
          <div className="text-xs lg:text-sm text-left ml-1 text-grey-600 w-full">
            {recentYear}
            {priorYear ? ` vs. ${priorYear}` : ""}
          </div>
        </div>
      </div>
    );
  },
);

export default KPICard;
