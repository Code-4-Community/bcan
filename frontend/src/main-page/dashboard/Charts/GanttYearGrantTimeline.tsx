import { Scheduler, SchedulerData } from "@bitnoi.se/react-scheduler";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { SetStateAction, useCallback, useState } from "react";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { getColorStatus } from "../../../../../middle-layer/types/Status";
import "../styles/Dashboard.css";

export const GanttYearGrantTimeline = observer(
  ({
    recentYear,
    grants,
    uniqueYears,
  }: {
    recentYear: number;
    grants: Grant[];
    uniqueYears: number[];
  }) => {
    //  Filter grants for the max selected year
    // and if the current year is selected in the filter include that as well
    const filterYear =
      recentYear < new Date().getFullYear()
        ? recentYear
        : Math.min(recentYear, new Date().getFullYear());

    // If application deadline or any report deadline is in the range
    const recentData = grants.filter((grant) => {
      const appYear = new Date(grant.application_deadline).getFullYear();
      const appInRange = appYear >= filterYear && appYear <= recentYear;

      const reportInRange = grant.report_deadlines?.some((rd) => {
        const year = new Date(rd).getFullYear();
        return year >= filterYear && year <= recentYear;
      });

      return appInRange || reportInRange;
    });

    // Formatting the data for SchedulerData
    const data: SchedulerData = recentData.map((grant) => {
      const application_deadline = new Date(grant.application_deadline);
      const startDate = new Date(
        application_deadline.getFullYear(),
        application_deadline.getMonth(),
        application_deadline.getDate() - 14
      );
      const endDate = new Date(
        application_deadline.getFullYear(),
        application_deadline.getMonth(),
        application_deadline.getDate()
      );

      // Create application task
      const tasks = [
        {
          id: `${grant.grantId}-application`,
          startDate,
          endDate,
          occupancy: 0,
          title: grant.organization,
          description: `App Deadline: ${application_deadline.toLocaleDateString()}`,
          bgColor: getColorStatus(grant.status),
        },
      ];

      // Add a task for each report deadline (if any)
      if (grant.report_deadlines && grant.report_deadlines.length > 0) {
        grant.report_deadlines.forEach((rd, index) => {
          const report_deadline = new Date(rd);
          const report_startDate = new Date(
            report_deadline.getFullYear(),
            report_deadline.getMonth(),
            report_deadline.getDate() - 14
          );
          const report_endDate = new Date(
            report_deadline.getFullYear(),
            report_deadline.getMonth(),
            report_deadline.getDate()
          );

          tasks.push({
            id: `${grant.grantId}-report-${index}`,
            startDate: report_startDate,
            endDate: report_endDate,
            occupancy: 0,
            title: grant.organization,
            description: `Report Deadline: ${report_deadline.toLocaleDateString()}`,
            bgColor: getColorStatus(grant.status),
          });
        });
      }

      return {
        id: String(grant.grantId),
        label: {
          icon: "",
          title: grant.organization,
          subtitle: `${grant.status} • $${grant.amount.toLocaleString()}`,
        },
        data: tasks,
      };
    });

    const [range, setRange] = useState({
      startDate: new Date(),
      endDate: new Date(),
    });

    const handleRangeChange = useCallback(
      (range: SetStateAction<{ startDate: Date; endDate: Date }>) => {
        setRange(range);
      },
      []
    );

    // Filtering events that are included in current date range
    // Example can be also found on video https://youtu.be/9oy4rTVEfBQ?t=118&si=52BGKSIYz6bTZ7fx
    // and in the react-scheduler repo App.tsx file https://github.com/Bitnoise/react-scheduler/blob/master/src/App.tsx
    const filteredSchedulerData = data.map((grant) => ({
      ...grant,
      data: grant.data.filter((project) => {
        const startInRange =
          (dayjs(project.startDate).isAfter(range.startDate, "day") &&
            dayjs(project.startDate).isBefore(range.endDate, "day")) ||
          dayjs(project.startDate).isSame(range.startDate, "day") ||
          dayjs(project.startDate).isSame(range.endDate, "day");

        const endInRange =
          (dayjs(project.endDate).isAfter(range.startDate, "day") &&
            dayjs(project.endDate).isBefore(range.endDate, "day")) ||
          dayjs(project.endDate).isSame(range.startDate, "day") ||
          dayjs(project.endDate).isSame(range.endDate, "day");

        const fullySpansRange =
          dayjs(project.startDate).isBefore(range.startDate, "day") &&
          dayjs(project.endDate).isAfter(range.endDate, "day");

        return startInRange || endInRange || fullySpansRange;
      }),
    }));

    return (
      <div className="h-full w-full">
        {/* Title */}
        <div className="text-md lg:text-lg w-full text-left font-semibold">
          Grant Timeline
        </div>
        {/* Year */}
        <div className="text-sm w-full text-left">
          {filterYear !== recentYear && uniqueYears.includes(filterYear)
            ? filterYear + "-"
            : ""}
          {recentYear}
        </div>
        <div className="w-full h-96 max-w-screen relative">
          <Scheduler
            data={filteredSchedulerData}
            isLoading={false}
            onRangeChange={handleRangeChange}
            config={{
              zoom: 0,
              filterButtonState: -1,
              showTooltip: false,
            }}
          />
        </div>
      </div>
    );
  }
);

export default GanttYearGrantTimeline;
