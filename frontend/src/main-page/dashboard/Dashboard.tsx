import CsvExportButton from "./CsvExportButton";

import DateFilter from "./DateFilter";
import "./styles/Dashboard.css";
import { observer } from "mobx-react-lite";
import StackedBarMoneyReceived from "./Charts/StackedBarMoneyReceived";
import { useEffect } from "react";
import {
  updateYearFilter,
  updateFilter,
  updateEndDateFilter,
  updateStartDateFilter,
  updateSearchQuery,
} from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import BarYearGrantStatus from "./Charts/BarYearGrantStatus";
import LineChartSuccessRate from "./Charts/LineChartSuccessRate";
import GanttYearGrantTimeline from "./Charts/GanttYearGrantTimeline";
import DonutMoneyApplied from "./Charts/DonutMoneyApplied";
import { ProcessGrantData } from "../grants/filter-bar/processGrantData";
import KPICards from "./Charts/KPICards";

const Dashboard = observer(() => {
  // reset filters on initial render
  useEffect(() => {
    updateYearFilter([]);
    updateFilter(null);
    updateEndDateFilter(null);
    updateStartDateFilter(null);
    updateSearchQuery("");
  }, []);

  const { yearFilter, allGrants } = getAppStore();

  const uniqueYears = Array.from(
    new Set(
      yearFilter && yearFilter?.length > 0
        ? yearFilter
        : allGrants.map((g) => new Date(g.application_deadline).getFullYear()),
    ),
  ).sort((a, b) => b - a);

  const recentYear = uniqueYears[0];
  const priorYear = uniqueYears[1];

  const { grants } = ProcessGrantData();

  return (
    <div className="dashboard-page">
      <div className="flex flex-wrap flex-row justify-start gap-4 mb-12 items-center">
        <div className="text-3xl lg:text-4xl font-bold mr-4">Dashboard</div>
        <div className="flex flex-wrap flex-row gap-4">
        <DateFilter />
        <CsvExportButton />
        </div>
      </div>

      <div className="gap-3 lg:gap-5 grid grid-cols-4">
        {/* ROW 1 */}
        <div className="col-span-2 h-full">
          <KPICards
            grants={grants}
            recentYear={recentYear}
            priorYear={priorYear}
          />
        </div>

        <div className="chart-container col-span-1 h-full">
          <DonutMoneyApplied grants={grants} />
        </div>

        <div className="chart-container col-span-1 h-full">
          <StackedBarMoneyReceived grants={grants} />
        </div>

        {/* ROW 2 */}
        <div className="chart-container col-span-2 h-full">
          <LineChartSuccessRate grants={grants} />
        </div>

        <div className="chart-container col-span-2 h-full">
          <BarYearGrantStatus recentYear={recentYear} grants={grants} />
        </div>

        {/* ROW 3 (Scrollable) */}
        <div className="chart-container col-span-4 ">
          <GanttYearGrantTimeline
            recentYear={recentYear}
            grants={grants}
            uniqueYears={uniqueYears}
          />
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
