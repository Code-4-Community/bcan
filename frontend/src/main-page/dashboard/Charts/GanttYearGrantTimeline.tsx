import { observer } from "mobx-react-lite";
import { Grant } from "../../../../../middle-layer/types/Grant";

export const GanttYearGrantTimeline = observer(
  ({ recentYear, grants }: { recentYear: number; grants: Grant[] }) => {
    // Filter grants for the selected year
    //     const recentData = grants.filter(
    //       (grant) =>
    //         new Date(grant.application_deadline).getFullYear() === recentYear
    //     );

    //     const data: (string | Date | number | null)[][] = [
    //   [
    //     "Task ID",
    //     "Task Name",
    //     "Resource ID",
    //     "Start Date",
    //     "End Date",
    //     "Duration",
    //     "Percent Complete",
    //     "Dependencies",
    //   ],
    //   ...recentData.map((grant) => {
    //     const deadline = new Date(grant.application_deadline);
    //     const startDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate() - 14);
    //     const endDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

    //     return [
    //       String(grant.grantId),                        // Task ID must be string
    //       `${grant.organization} (${grant.status}) $${grant.amount}`, // Task Name
    //       null,                                         // Resource ID
    //       startDate,                                    // Start Date
    //       endDate,                                      // End Date
    //       0,                                         // Duration (null)
    //       100,                                          // Percent Complete
    //       null,                                         // Dependencies
    //     ];
    //   }),
    // ];

    //     const options = {
    //       height: recentData.length * 50 + 50,
    //       gantt: {
    //         trackHeight: 30,
    //         barHeight: 20,
    //         criticalPathEnabled: false,
    //         labelStyle: {
    //           fontName: "Arial",
    //           fontSize: 12,
    //           color: "#000",
    //         },
    //         palette: [
    //           {
    //             color: "#f58d5c", // All bars same color
    //             dark: "#f58d5c",
    //             light: "#f58d5c",
    //           },
    //         ],
    //       },
    //     };

    return (
      <div className="chart-container h-full">
        {/* Title */}
        <div className="text-lg w-full text-left font-semibold">
          Year Grant Timeline
        </div>
        {/* Year */}
        <div className="text-sm w-full text-left">{recentYear}</div>

        <div className="py-4">{grants.length}</div>
      </div>
    );
  }
);

export default GanttYearGrantTimeline;
