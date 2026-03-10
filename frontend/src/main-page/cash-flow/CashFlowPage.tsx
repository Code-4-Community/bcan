import "../dashboard/styles/Dashboard.css";
import { observer } from "mobx-react-lite";

const CashFlowPage = observer(() => {
  return (
    <div className="dashboard-page">
      <div className="grid grid-cols-4 grid-rows-[1fr_3fr_3fr] gap-4 min-h-screen">
        {/* Row 1 */}
        <div className="chart-container col-span-1 h-full">
          {/* Card 1 placeholder */}
        </div>

        <div className="chart-container col-span-1 h-full">
          {/* Card 2 placeholder */}
        </div>

        <div className="chart-container col-span-1 h-full">
          {/* Card 3 placeholder */}
        </div>

        <div className="chart-container col-span-1 h-full">
          {/* Card 4 placeholder */}
        </div>

        {/* Row 2 */}
        <div className="chart-container col-span-2 h-full">
          {/* Card 1 placeholder */}
        </div>

        <div className="chart-container col-span-2 h-full">
          {/* Card 2 placeholder */}
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