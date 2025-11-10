import { Grant } from "../../../../../middle-layer/types/Grant";
import { aggregateMoneyGrantsByYear, YearAmount } from "../grantCalculations";
import KPICard from "./KPICard";
import "../styles/Dashboard.css";
import { observer } from "mobx-react-lite";
import { getListApplied } from "../../../../../middle-layer/types/Status";

const KPICards = observer(
  ({
    grants,
    recentYear,
    priorYear,
  }: {
    grants: Grant[];
    recentYear: number;
    priorYear: number;
  }) => {
    // Helper to sum values for given statuses
    const sumByStatus = (data: Record<string, number>, statuses: string[]) =>
      Object.entries(data)
        .filter(([status]) => statuses.includes(status))
        .reduce((sum, [, value]) => sum + value, 0);

    // Aggregate money by year
    const dataMoney = aggregateMoneyGrantsByYear(grants, "status").map(
      (grant: YearAmount) => ({
        year: grant.year,
        received: sumByStatus(grant.data, getListApplied(true)),
        unreceived: sumByStatus(grant.data, getListApplied(false)),
      })
    );

    // Get metrics for a specific year
    const getYearMetrics = (year: number) => {
      const entry = dataMoney.find((d) => d.year === year);
      if (!entry)
        return {
          moneyReceived: 0,
          moneyUnreceived: 0,
          countReceived: 0,
          countUnreceived: 0,
        };

      const { received, unreceived } = entry;
      return {
        moneyReceived: received,
        moneyUnreceived: unreceived,
        countReceived: received > 0 ? 1 : 0,
        countUnreceived: unreceived > 0 ? 1 : 0,
      };
    };

    const recent = getYearMetrics(recentYear);
    const prior = getYearMetrics(priorYear);

    // Helper: percent change formula
    const percentChange = (current: number, previous: number) => {
      return previous === 0 ? 0 : ((current - previous) / previous) * 100;
    };

    // KPIs
    const grantsAppliedRecent = recent.countReceived + recent.countUnreceived;
    const grantsAppliedPrior = prior.countReceived + prior.countUnreceived;

    const grantsReceivedRecent = recent.countReceived;
    const grantsReceivedPrior = prior.countReceived;

    const moneyCapturedRecent =
      recent.moneyReceived + recent.moneyUnreceived > 0
        ? (recent.moneyReceived /
            (recent.moneyReceived + recent.moneyUnreceived)) *
          100
        : 0;
    const moneyCapturedPrior =
      prior.moneyReceived + prior.moneyUnreceived > 0
        ? (prior.moneyReceived /
            (prior.moneyReceived + prior.moneyUnreceived)) *
          100
        : 0;

    const avgAmountRecent =
      recent.countReceived > 0
        ? recent.moneyReceived / recent.countReceived
        : 0;
    const avgAmountPrior =
      prior.countReceived > 0 ? prior.moneyReceived / prior.countReceived : 0;

    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        <KPICard
          title="Grants Applied"
          recentYear={recentYear}
          priorYear={priorYear}
          formattedValue={`${grantsAppliedRecent}`}
          percentChange={percentChange(grantsAppliedRecent, grantsAppliedPrior)}
        />
        <KPICard
          title="Grants Received"
          recentYear={recentYear}
          priorYear={priorYear}
          formattedValue={`${grantsReceivedRecent}`}
          percentChange={percentChange(
            grantsReceivedRecent,
            grantsReceivedPrior
          )}
        />
        <KPICard
          title="Money Captured"
          recentYear={recentYear}
          priorYear={priorYear}
          formattedValue={`${moneyCapturedRecent.toFixed(0)}%`}
          percentChange={percentChange(moneyCapturedRecent, moneyCapturedPrior)}
        />
        <KPICard
          title="Average Amount"
          recentYear={recentYear}
          priorYear={priorYear}
          formattedValue={`$${(avgAmountRecent / 1000).toFixed(0)}k`}
          percentChange={percentChange(avgAmountRecent, avgAmountPrior)}
        />
      </div>
    );
  }
);

export default KPICards;
