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

export const toDateInputValue = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date + "T00:00:00")

  const year = localDate.getFullYear();
  const month = `${localDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${localDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
          value={formatMoney(costs.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0))}
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
