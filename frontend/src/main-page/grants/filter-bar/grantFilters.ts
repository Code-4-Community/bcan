import { Grant } from "../../../../../middle-layer/types/Grant.ts";

// filters grants by looping thru all filters
export const filterGrants = (grants: Grant[], predicates: ((grant: Grant) => boolean)[]) =>
    grants.filter(grant => predicates.every(fn => fn(grant)));

// for subheaders for a single status
export const statusFilter = (status: string | null) => (grant: Grant) =>
    !status || grant.status === status;

// TODO note: what attribute to filter by? currently doing application deadline
// filter for calendar feature, if both null no filter, if 1 null, one-sided filter
export const dateRangeFilter = (start: Date | null, end: Date | null) => (grant: Grant) => {
    const date = new Date(grant.application_deadline);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
};