import { useEffect } from "react";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { fetchCashflowCosts, fetchCashflowRevenues } from "../../external/bcanSatchel/actions.ts";
import {CashflowRevenue} from "../../../../middle-layer/types/CashflowRevenue.ts";
import {CashflowCost} from "../../../../middle-layer/types/CashflowCost.ts";
import { api } from "../../api.ts";

// This has not been tested yet but the basic structure when implemented should be the same
// Mirrored format for processGrantData.ts

// fetch line items
export const fetchCosts = async () => {
  try {
    // Need to replace with actual endpoint
    const response = await api("/cost");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedCosts: CashflowCost[] = await response.json();
    fetchCashflowCosts(updatedCosts);
  } catch (error) {
    console.error("Error fetching costs:", error);
  }
};

export const fetchRevenues = async () => {
  try {
    // Need to replace with actual endpoint
    const response = await api("/revenue");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedRevenues: CashflowRevenue[] = await response.json();
    fetchCashflowRevenues(updatedRevenues);
  } catch (error) {
    console.error("Error fetching revenues:", error);
  }
};


// could contain callbacks for sorting and filtering line items
// stores state for list of costs/revenues
export const ProcessCashflowData = () => {
    const {
        costSources,
        revenueSources
  } = getAppStore();

  // fetch costs on mount if empty
  useEffect(() => {
    if (costSources.length === 0) fetchCosts();
  }, [costSources.length]);

  // fetch revenues on mount if empty
  useEffect(() => {
    if (revenueSources.length === 0) fetchRevenues();
  }, [revenueSources.length]);

  return { costs: costSources, revenues: revenueSources };
};
