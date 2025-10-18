import { getAppStore } from "../../../external/bcanSatchel/store.ts";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions.ts";
import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { dateRangeFilter, filterGrants, statusFilter, yearFilterer } from "./grantFilters";
import { sortGrants } from "./grantSorter.ts";
import { api } from "../../../api.ts";
import { useEffect } from "react";

// fetch grants
const fetchGrants = async () => {
  try {
    const response = await api("/grant");
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const updatedGrants: Grant[] = await response.json();
    fetchAllGrants(updatedGrants);
  } catch (err) {
    console.error(err);
  }
};

// Hook to expose filtered/sorted grants
export const useProcessGrantData = () => {
  const { allGrants, filterStatus, startDateFilter, endDateFilter, yearFilter } = getAppStore();

  // fetch grants on mount if empty
  useEffect(() => {
    if (allGrants.length === 0) fetchGrants();
  }, [allGrants.length]);

  // compute filtered grants dynamically — no useState needed
  const filteredGrants = filterGrants(allGrants, [
    statusFilter(filterStatus),
    dateRangeFilter(startDateFilter, endDateFilter),
    yearFilterer(yearFilter),
  ]);

  // sorting callback
  const onSort = (header: keyof Grant, asc: boolean) => {
    return sortGrants(filteredGrants, header, asc);
  };

  return { grants: filteredGrants, onSort };
};
