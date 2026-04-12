import { useEffect } from "react";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { fetchCashflowCosts, fetchCashflowRevenues, setCashflowSettings } from "../../external/bcanSatchel/actions.ts";
import {CashflowRevenue, GrantPageGrant} from "../../../../middle-layer/types/CashflowRevenue.ts";
import {CashflowCost} from "../../../../middle-layer/types/CashflowCost.ts";
import {CashflowSettings} from "../../../../middle-layer/types/CashflowSettings.ts";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import { RevenueType } from "../../../../middle-layer/types/RevenueType.ts";
import { Status } from "../../../../middle-layer/types/Status.ts";
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
    const [revenueResponse, grantResponse] = await Promise.all([
      api("/cashflow-revenue"),
      api("/grant"),
    ]);

    if (!revenueResponse.ok) {
      throw new Error(`HTTP Error, Status: ${revenueResponse.status}`);
    }

    if (!grantResponse.ok) {
      throw new Error(`HTTP Error, Status: ${grantResponse.status}`);
    }

    const updatedRevenues: CashflowRevenue[] = await revenueResponse.json();
    const grants: Grant[] = await grantResponse.json();

    const mappedActiveGrantRevenues: GrantPageGrant[] = grants
      .filter((grant) => grant.status === Status.Active)
      .map((grant) => ({
        amount: grant.amount,
        type: RevenueType.Grants,
        name: grant.organization.trim(),
        installments: [
          {
            amount: grant.amount,
            date: new Date(grant.grant_start_date),
          },
        ],
        isGrantBased: true,
        grantId: grant.grantId,
      }));

    fetchCashflowRevenues([...updatedRevenues, ...mappedActiveGrantRevenues]);
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

  return { costs: costSources, revenues: revenueSources, cashflowSettings };
};
