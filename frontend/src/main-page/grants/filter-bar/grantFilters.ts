import { Grant } from "../../../../../middle-layer/types/Grant.ts";

// filters grants by looping thru all filters
export const filterGrants = (
  grants: Grant[],
  predicates: ((grant: Grant) => boolean)[]
) => grants.filter((grant) => predicates.every((fn) => fn(grant)));

// for subheaders for a single status
export const statusFilter = (status: string | null) => (grant: Grant) =>
  !status || grant.status === status;

// TODO note: what attribute to filter by? currently doing application deadline
// filter for calendar feature, if both null no filter, if 1 null, one-sided filter
export const dateRangeFilter =
  (start: Date | null, end: Date | null) => (grant: Grant) => {
    const date = new Date(grant.application_deadline);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

/**
 * Returns a predicate that determines whether the grant provided to it has an organization
 * name that contains the given search query.
 *
 * @param searchQuery - The search term to match against organization names
 * @returns A predicate function that takes a Grant and returns a boolean
 */
export const searchFilter = (searchQuery: string) => (grant: Grant) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const organization = grant.organization?.toLowerCase() || "";

  return organization.includes(query);
};
