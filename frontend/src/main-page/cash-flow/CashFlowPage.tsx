import { observer } from "mobx-react-lite";
import CashFlowCard from "./components/CashFlowCard";
import { faDollarSign, faArrowTrendUp, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import "../dashboard/styles/Dashboard.css";

const CashFlowPage = observer(() => {
  return (
    <div className="dashboard-page">
      <div className="grid grid-cols-4 grid-rows-[1fr_3fr_3fr] gap-4 min-h-screen">
        {/* Row 1 */}
        <CashFlowCard text="Current Cash" value="$50,000" logo={faDollarSign} className="text-blue"/>
        <CashFlowCard text="Current Cash" value="$50,000" logo={faArrowTrendUp} className="text-green"/>
        <CashFlowCard text="Current Cash" value="$50,000" logo={faUserGroup} className="text-primary"/>
        <CashFlowCard text="Current Cash" value="Salary: 4.5% | Benefits: 4%" logo={faArrowTrendUp} className="text-green" size="small"/>

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