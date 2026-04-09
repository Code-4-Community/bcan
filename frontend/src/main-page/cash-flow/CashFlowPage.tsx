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

export const formatMoney = (amount: number) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const CashFlowPage = observer(() => {
  const { costs, revenues, cashflowSettings } = ProcessCashflowData();

  return (
    <div className="">
      <div className="grid grid-cols-4 grid-rows-[auto_auto_1fr] gap-4">
        {/* Row 1 */}
        <CashflowKPICard
          text="Current Cash"
          value={formatMoney(cashflowSettings?.startingCash ?? 0)}
          logo={faDollarSign}
          className="text-blue"
        />
        <CashflowKPICard
          text="Total Revenue"
          value={formatMoney(revenues.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0))}
          logo={faArrowTrendUp}
          className="text-green"
        />
        <CashflowKPICard
          text="Monthly Costs"
          value={formatMoney(costs.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0)/12)}
          logo={faUserGroup}
          className="text-primary"
        />
        <CashflowKPICard
          text="Annual Increases"
          value={`Salary: ${cashflowSettings?.salaryIncrease}% | Benefits: ${cashflowSettings?.benefitsIncrease}%`}
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
