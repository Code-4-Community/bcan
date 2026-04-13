import { useEffect } from "react";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { fetchCashflowCosts, fetchCashflowRevenues, setCashflowSettings } from "../../external/bcanSatchel/actions.ts";
import {CashflowRevenue} from "../../../../middle-layer/types/CashflowRevenue.ts";
import {CashflowCost} from "../../../../middle-layer/types/CashflowCost.ts";
import {CashflowSettings} from "../../../../middle-layer/types/CashflowSettings.ts";
import { api } from "../../api.ts";

// This has not been tested yet but the basic structure when implemented should be the same
// Mirrored format for processGrantData.ts

// fetch line items
export const fetchCosts = async () => {
  try {
    // Need to replace with actual endpoint
    const response = await api("/cashflow-cost");
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
    const response = await api("/cashflow-revenue");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedRevenues: CashflowRevenue[] = await response.json();
    fetchCashflowRevenues(updatedRevenues);
  } catch (error) {
    console.error("Error fetching revenues:", error);
  }
};

export const fetchCashflowSettings = async () => {
  try {
    const response = await api("/default-values");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const settings: CashflowSettings = await response.json();
    setCashflowSettings(settings);
  } catch (error) {
    console.error("Error fetching cashflow settings:", error);
  }
};


// could contain callbacks for sorting and filtering line items
// stores state for list of costs/revenues
export const ProcessCashflowData = () => {
    const {
        costSources,
        revenueSources,
        cashflowSettings
  } = getAppStore();

  // fetch costs on mount if empty
  useEffect(() => {
    if (costSources.length === 0) fetchCosts();
  }, [costSources.length]);

  // fetch revenues on mount if empty
  useEffect(() => {
    if (revenueSources.length === 0) fetchRevenues();
  }, [revenueSources.length]);

  // fetch settings on mount if null
  useEffect(() => {
    if (!cashflowSettings) fetchCashflowSettings();
  }, [cashflowSettings]);

  const sortedCosts = costSources.slice().sort((a, b) => a.name.localeCompare(b.name));
  const sortedRevenues = revenueSources.slice().sort((a, b) => a.name.localeCompare(b.name));

  return { costs: sortedCosts, revenues: sortedRevenues, cashflowSettings };
};
