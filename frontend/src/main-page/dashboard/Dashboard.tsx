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
  }, []);

  const { yearFilter, allGrants } = getAppStore();

  const uniqueYears = Array.from(
    new Set(
      yearFilter?.length > 0
        ? yearFilter
        : allGrants.map((g) => new Date(g.application_deadline).getFullYear())
    )
  ).sort((a, b) => b - a);

  const recentYear = uniqueYears[0];
  const priorYear = uniqueYears[1];

  console.log("Recent Year:", recentYear, "Prior Year:", priorYear);

  const { grants } = ProcessGrantData();

  return (
    <div className="dashboard-page px-12 py-4 mb-8 ">
      <div className="flex flex-row justify-end gap-4 mb-6">
        <CsvExportButton />
        <DateFilter />
      </div>

      <div className=" gap-6 grid grid-cols-7">
        <div className="col-span-3 h-full">
          <KPICards grants={grants} recentYear={recentYear} priorYear={priorYear} />
        </div>
        <div className="col-span-4">
          <LineChartSuccessRate grants={grants} />
        </div>
        <div className="col-span-3">
          <DonutMoneyApplied grants={grants} />
        </div>
        <div className="col-span-4">
          <StackedBarMoneyReceived grants={grants} />
        </div>
        <div className="col-span-5">
          <GanttYearGrantTimeline recentYear={recentYear} grants={grants} />
        </div>
        <div className="col-span-2">
          <BarYearGrantStatus recentYear={recentYear} grants={grants} />
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
