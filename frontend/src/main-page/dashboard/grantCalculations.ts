import { Grant } from "../../../../middle-layer/types/Grant";

export type YearAmount = {
  year: number;
  [key: string]: number;
};

/**
 * Aggregates total grant amounts by year, optionally grouped by a secondary key.
 *
 * @param grants - Array of grants.
 * @param groupBy - Optional secondary grouping key (e.g., "status" or "organization").
 * @returns Array of { year, [groupValue]: amount }.
 */
export function aggregateMoneyGrantsByYear(
  grants: Grant[],
  groupBy?: keyof Grant
): YearAmount[] {
  const grouped: Record<number, Record<string, number>> = {};

  for (const grant of grants) {
    const year = new Date(grant.application_deadline).getUTCFullYear();
    const groupValue = groupBy ? String(grant[groupBy] ?? "Unknown") : "All";

    grouped[year] ??= {};
    grouped[year][groupValue] = (grouped[year][groupValue] ?? 0) + grant.amount;
  }

  return Object.entries(grouped)
    .map(([year, groups]) => ({
      year: Number(year),
      ...groups,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregates distinct grant counts by year, optionally grouped by a secondary key.
 *
 * @param grants - Array of grants.
 * @param groupBy - Optional secondary grouping key (e.g., "status" or "organization").
 * @returns Array of { year, [groupValue]: count }.
 */
export function aggregateCountGrantsByYear(
  grants: Grant[],
  groupBy?: keyof Grant
): YearAmount[] {
  const grouped: Record<number, Record<string, Set<number>>> = {};

  for (const grant of grants) {
    const year = new Date(grant.application_deadline).getUTCFullYear();
    const groupValue = groupBy ? String(grant[groupBy] ?? "Unknown") : "All";

    grouped[year] ??= {};
    grouped[year][groupValue] ??= new Set<number>();
    grouped[year][groupValue].add(grant.grantId);
  }

  return Object.entries(grouped)
    .map(([year, groups]) => {
      const counts: Record<string, number> = {};
      for (const [key, ids] of Object.entries(groups)) {
        counts[key] = ids.size;
      }
      return { year: Number(year), ...counts };
    })
    .sort((a, b) => a.year - b.year);
}
