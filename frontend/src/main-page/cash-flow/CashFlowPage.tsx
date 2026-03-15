import "../dashboard/styles/Dashboard.css";
import { observer } from "mobx-react-lite";

const CashFlowPage = observer(() => {
  return (
    <div className="dashboard-page">
      <div className="grid grid-cols-4 grid-rows-[1fr_3fr_3fr] gap-4 min-h-screen">
        {/* Row 1 */}
        <div className="chart-container h-full">
          {/* Card 1 placeholder */}
        </div>

        <div className="chart-container h-full">
          {/* Card 2 placeholder */}
        </div>

        <div className="chart-container h-full">
          {/* Card 3 placeholder */}
        </div>

        <div className="chart-container h-full">
          {/* Card 4 placeholder */}
        </div>

        {/* Row 2 */}
        <div className="chart-container col-span-2 h-full">
          {/* Card 1 placeholder */}
          <div className="bg-grey-200 px-2 py-2 h-14 rounded-full">
            <div className="bg-white h-full w-1/2 rounded-full">
            </div>
          </div>
        </div>

        <div className="chart-container col-span-2 h-full flex flex-col">
          {/* Card 2 placeholder */}
          <div className="mt-auto flex gap-2">
            {/* 4 buttons at bottom */}
            <div className="bg-grey-200 rounded-md flex-1 h-14"></div>
            <div className="bg-grey-200 rounded-md flex-1 h-14"></div>
            <div className="bg-grey-200 rounded-md flex-1 h-14"></div>
            <div className="bg-grey-200 rounded-md flex-1 h-14"></div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="chart-container col-span-2 h-full">
          {/* Card 1 placeholder */}
        </div>

        <div className="chart-container col-span-2 h-full">
          {/* Card 2 placeholder */}
        </div>
      </div>
    </div>
  );
});

export default CashFlowPage;