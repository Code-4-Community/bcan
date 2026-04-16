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
import { TDateISO } from "../../../../backend/src/utils/date";
import { buildCashflowProjection } from "./projection";

export const formatMoney = (amount: number) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
};

const CashFlowPage = observer(() => {
  const { costs, revenues, cashflowSettings } = ProcessCashflowData();

  const { chartData, kpis } = buildCashflowProjection(revenues, costs, {
    startingCash: Number.isNaN(cashflowSettings?.startingCash) ? 0 : cashflowSettings?.startingCash ?? 0,
    salaryIncrease: Number.isNaN(cashflowSettings?.salaryIncrease) ? 0 : cashflowSettings?.salaryIncrease ?? 0,
    benefitsIncrease: Number.isNaN(cashflowSettings?.benefitsIncrease) ? 0 : cashflowSettings?.benefitsIncrease ?? 0,
    startDate: cashflowSettings?.startDate === undefined
      ? (new Date().toISOString().split("T")[0] as TDateISO)
      : cashflowSettings?.startDate ?? (new Date().toISOString().split("T")[0] as TDateISO),
  });

  return (
    <div className="">
      <div className="grid grid-cols-4 grid-rows-[auto_auto_1fr] gap-4">
        {/* Row 1 */}
        <CashflowKPICard
          text="Current Cash"
          value={Number.isNaN(cashflowSettings?.startingCash) ? "N/A" : formatMoney(cashflowSettings?.startingCash ?? 0)}
          logo={faDollarSign}
          className="text-blue"
        />
        <CashflowKPICard
          text="Projected Total Revenue"
          value={formatMoney(kpis.totalRevenue ?? 0)}
          logo={faArrowTrendUp}
          className="text-green"
        />
        <CashflowKPICard
          text="Projected Total Costs"
          value={formatMoney(kpis.totalCosts ?? 0)}
          logo={faUserGroup}
          className="text-primary"
        />
        <CashflowKPICard
          text="Annual Increases"
          value={`Salary: ${Number.isNaN(cashflowSettings?.salaryIncrease) ? "N/A" : cashflowSettings?.salaryIncrease + "%"} | Benefits: ${Number.isNaN(cashflowSettings?.benefitsIncrease) ? "N/A" : cashflowSettings?.benefitsIncrease + "%"}`}
          logo={faArrowTrendUp}
          className="text-green"
          size="small"
        />

        {/* Row 2 */}
        <CashPosition />
        <CashAnnualSettings />

        {/* Row 3 */}
        <CashCreateLineItem />
        <CashProjection data={chartData} kpis={kpis} />

        {/* Row 4 */}
        {revenues.length > 0 && (
          <CashSourceList type="Revenue" lineItems={revenues} />
        )}
        {costs.length > 0 && <CashSourceList type="Cost" lineItems={costs} />}
      </div>
    </div>
  );
});

export default CashFlowPage;
