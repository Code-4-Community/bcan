import { useEffect } from "react";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import { Grant } from "../../../../../middle-layer/types/Grant";
import {
  dateRangeFilter,
  filterGrants,
  yearFilterer,
  statusFilter,
  searchFilter
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
  const { allGrants, filterStatus, startDateFilter, endDateFilter, yearFilter, searchQuery } = getAppStore();

  // fetch grants on mount if empty
  useEffect(() => {
    if (allGrants.length === 0) fetchGrants();
  }, [allGrants.length]);

  // compute filtered grants dynamically — no useState needed
  const filteredGrants = filterGrants(allGrants, [
    statusFilter(filterStatus),
    dateRangeFilter(startDateFilter, endDateFilter),
    yearFilterer(yearFilter),
    searchFilter(searchQuery)
  ]);

  // sorting callback
  const onSort = (header: keyof Grant, asc: boolean) => {
    return sortGrants(filteredGrants, header, asc);
  };

  return { grants: filteredGrants, onSort };
};
