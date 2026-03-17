import { useEffect } from "react";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import { Grant } from "../../../../../middle-layer/types/Grant";
import {
  amountRangeFilter,
  dateRangeFilter,
  eligibleFilter,
  filterGrants,
  yearFilterer,
  statusFilter,
  searchFilter,
  userEmailFilter,
} from "./grantFilters";
import { sortGrants } from "./grantSorter.ts";
import { api } from "../../../api.ts";

// fetch grants
export const fetchGrants = async () => {
  try {
    const response = await api("/grant");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedGrants: Grant[] = await response.json();
    fetchAllGrants(updatedGrants);
  } catch (error) {
    console.error("Error fetching grants:", error);
  }
};

// contains callbacks for sorting and filtering grants
// stores state for list of grants/filter
export const ProcessGrantData = () => {
  const {
    allGrants,
    filterStatus,
    startDateFilter,
    endDateFilter,
    yearFilter,
    searchQuery,
    emailFilter,
    eligibleOnly,
    amountMinFilter,
    amountMaxFilter,
    user,
    sort,
  } = getAppStore();

  // fetch grants on mount if empty
  useEffect(() => {
    if (allGrants.length === 0) fetchGrants();
  }, [allGrants.length]);

  // compute filtered grants dynamically — no useState needed
  const baseFiltered = filterGrants(allGrants, [
    statusFilter(filterStatus),
    eligibleFilter(eligibleOnly),
    dateRangeFilter(startDateFilter, endDateFilter),
    amountRangeFilter(amountMinFilter, amountMaxFilter),
    yearFilterer(yearFilter),
    searchFilter(searchQuery),
    userEmailFilter(emailFilter, user)
  ]);

  const filteredGrants = sort
    ? sortGrants(baseFiltered, sort.header, sort.asc)
    : baseFiltered;

  return { grants: filteredGrants };
};
