import { observer } from "mobx-react-lite";
import CashflowKPICard from "./components/CashflowKPICard";
import {
  faDollarSign,
  faArrowTrendUp,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import "../dashboard/styles/Dashboard.css";
import CashPosition from "./components/CashPosition";
import CashAnnualSettings from "./components/CashAnnualSettings";
import CashProjection from "./components/CashProjection";
import CashSourceList from "./components/CashSourceList";
import { ProcessCashflowData } from "./processCashflowData";
import CashCreateLineItem from "./components/CashCreateLineItem";

const CashFlowPage = observer(() => {

  const { costs, revenues } = ProcessCashflowData();

  return (
    <div className="">
      <div className="grid grid-cols-4 grid-rows-[auto_auto_1fr] gap-4">
        {/* Row 1 */}
        <CashflowKPICard
          text="Current Cash"
          value="$50,000"
          logo={faDollarSign}
          className="text-blue"
        />
        <CashflowKPICard
          text="Total Revenue"
          value="$50,000"
          logo={faArrowTrendUp}
          className="text-green"
        />
        <CashflowKPICard
          text="Monthly Costs"
          value="$50,000"
          logo={faUserGroup}
          className="text-primary"
        />
        <CashflowKPICard
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
        <CashCreateLineItem />
        <CashProjection costs={costs} revenues={revenues} />

        {/* Row 4 */}
        <CashSourceList type="Revenue" lineItems={revenues} />
        <CashSourceList type="Cost" lineItems={costs} />
      </div>
    </div>
  );
});

export default CashFlowPage;
