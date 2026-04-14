import { TDateISO } from "../../../../backend/src/utils/date";
import { CashflowCost } from "../../../../middle-layer/types/CashflowCost";
import { CashflowRevenue } from "../../../../middle-layer/types/CashflowRevenue";
import { CashflowSettings } from "../../../../middle-layer/types/CashflowSettings";
import { CostType } from "../../../../middle-layer/types/CostType";
import {
  Frequency,
  frequencyIntervalsInMonths,
} from "../../../../middle-layer/types/Frequency";

/** One data point per month for the Recharts line chart */
export interface ChartDataPoint {
  /** Label shown on the x-axis, e.g. "Jan 2025" */
  month: string;
  /** Cumulative cash balance at end of month */
  cashBalance: number;
  /** Total revenue received this month */
  revenue: number;
  /** Total costs incurred this month */
  costs: number;
}

export interface CashflowKPIs {
  finalBalance: number;
  lowestBalancePoint: number;
  totalRevenue: number;
  totalCosts: number;
}

export interface CashflowProjectionResult {
  chartData: ChartDataPoint[];
  kpis: CashflowKPIs;
}

// ============================================================================
// Helpers
// ============================================================================

const PROJECTION_MONTHS = 36;

/** Returns a zero-indexed month key like "2025-01" from a Date */
function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Human-readable label for x-axis */
function toMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
}

/** Generate an ordered list of 36 month keys starting from startDate */
function generateMonthKeys(startDate: TDateISO): string[] {
  const d = new Date(startDate);
  // Normalize to first of the month
  d.setDate(1);
  const keys: string[] = [];
  for (let i = 0; i < PROJECTION_MONTHS; i++) {
    keys.push(toMonthKey(d));
    d.setMonth(d.getMonth() + 1);
  }
  return keys;
}

/** How many full years have elapsed between two month keys (for annual increases) */
function yearsElapsed(startKey: string, currentKey: string): number {
  const [sy, sm] = startKey.split("-").map(Number);
  const [cy, cm] = currentKey.split("-").map(Number);
  const totalMonths = (cy - sy) * 12 + (cm - sm);
  return Math.floor(totalMonths / 12);
}

/**
 * Returns the effective interval in months for a cost's frequency.
 * For Custom frequency the user-supplied interval is used.
 */
function getIntervalMonths(cost: CashflowCost): number {
  if (cost.frequency === Frequency.Custom) return cost.interval;
  return frequencyIntervalsInMonths[cost.frequency];
}

// ============================================================================
// Core projection
// ============================================================================

export function buildCashflowProjection(
  revenues: CashflowRevenue[],
  costs: CashflowCost[],
  settings: CashflowSettings,
): CashflowProjectionResult {
  const monthKeys = generateMonthKeys(settings.startDate);
  const startKey = monthKeys[0];
  const endKey = monthKeys[monthKeys.length - 1];

  // Pre-allocate monthly buckets
  const revenueBuckets = new Map<string, number>();
  const costBuckets = new Map<string, number>();
  for (const key of monthKeys) {
    revenueBuckets.set(key, 0);
    costBuckets.set(key, 0);
  }

  // ---- Distribute revenues into monthly buckets ----
  for (const rev of revenues) {
    for (const installment of rev.installments) {
      const key = toMonthKey(installment.date);
      if (revenueBuckets.has(key)) {
        revenueBuckets.set(key, revenueBuckets.get(key)! + installment.amount);
      }
    }
  }

  // ---- Distribute costs into monthly buckets ----
  for (const cost of costs) {
    if (cost.frequency === Frequency.OneTime) {
      // Single occurrence
      const key = toMonthKey(new Date(cost.date));
      if (costBuckets.has(key)) {
        const adjusted = getAdjustedCostAmount(cost, key, startKey, settings);
        costBuckets.set(key, costBuckets.get(key)! + adjusted);
      }
    } else {
      // Recurring: expand occurrences within the projection window
      const interval = getIntervalMonths(cost);
      if (interval <= 0) continue; // safety guard

      const costDate = new Date(cost.date);
      costDate.setDate(1);
      const cursor = new Date(costDate);

      // If the cost starts before the projection, advance to the first
      // occurrence that falls within the window.
      while (toMonthKey(cursor) < startKey) {
        cursor.setMonth(cursor.getMonth() + interval);
      }

      while (toMonthKey(cursor) <= endKey) {
        const key = toMonthKey(cursor);
        if (costBuckets.has(key)) {
          const adjusted = getAdjustedCostAmount(cost, key, startKey, settings);
          costBuckets.set(key, costBuckets.get(key)! + adjusted);
        }
        cursor.setMonth(cursor.getMonth() + interval);
      }
    }
  }

  // ---- Build chart data with running cash balance ----
  let balance = settings.startingCash;
  let lowestBalance = balance;
  let lowestMonth = toMonthLabel(monthKeys[0]);
  let totalRevenue = 0;
  let totalCosts = 0;

  const chartData: ChartDataPoint[] = monthKeys.map((key) => {
    const rev = revenueBuckets.get(key)!;
    const cost = costBuckets.get(key)!;
    totalRevenue += rev;
    totalCosts += cost;
    balance += rev - cost;

    if (balance < lowestBalance) {
      lowestBalance = balance;
      lowestMonth = toMonthLabel(key);
    }

    return {
      month: toMonthLabel(key),
      cashBalance: round2(balance),
      revenue: round2(rev),
      costs: round2(cost),
    };
  });

  return {
    chartData,
    kpis: {
      finalBalance: round2(balance),
      lowestBalancePoint: round2(lowestBalance),
      totalRevenue: round2(totalRevenue),
      totalCosts: round2(totalCosts),
    },
  };
}

// ============================================================================
// Cost adjustment for salary / benefits annual increase
// ============================================================================

function getAdjustedCostAmount(
  cost: CashflowCost,
  currentMonthKey: string,
  projectionStartKey: string,
  settings: CashflowSettings,
): number {
  const years = yearsElapsed(projectionStartKey, currentMonthKey);

  if (cost.type === CostType.Salary) {
    return cost.amount * Math.pow(1 + settings.salaryIncrease, years);
  }
  if (cost.type === CostType.Benefits) {
    return cost.amount * Math.pow(1 + settings.benefitsIncrease, years);
  }
  return cost.amount;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
