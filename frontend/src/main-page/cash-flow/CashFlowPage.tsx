import { observer } from "mobx-react-lite";
import CashFlowCard from "./components/CashFlowCard";
import {
  faDollarSign,
  faArrowTrendUp,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import "../dashboard/styles/Dashboard.css";
import CashPosition from "./components/CashPosition";
import CashAnnualSettings from "./components/CashAnnualSettings";
import CashProjection from "./components/CashProjection";
import CashAdd from "./components/CashCreateLineItem";
import CashSourceList from "./components/CashSourceList";

const CashFlowPage = observer(() => {
  return (
    <div className="">
      <div className="grid grid-cols-4 grid-rows-[auto_auto_1fr] gap-4">
        {/* Row 1 */}
        <CashFlowCard
          text="Current Cash"
          value="$50,000"
          logo={faDollarSign}
          className="text-blue"
        />
        <CashFlowCard
          text="Total Revenue"
          value="$50,000"
          logo={faArrowTrendUp}
          className="text-green"
        />
        <CashFlowCard
          text="Monthly Costs"
          value="$50,000"
          logo={faUserGroup}
          className="text-primary"
        />
        <CashFlowCard
          text="Annual Increases"
          value="Salary: 4.5% | Benefits: 4%"
          logo={faArrowTrendUp}
          className="text-green"
          size="small"
        />

        {/* Row 2 */}
        <CashPosition />
        <CashAnnualSettings />

        {/* Row 3 */}
        <CashAdd />
        <CashProjection />

        {/* Row 4 */}
        <CashSourceList type="Revenue" />
        <CashSourceList type="Cost" />
      </div>
    </div>
  );
});

export default CashFlowPage;
