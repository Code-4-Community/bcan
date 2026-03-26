import {CashflowRevenue} from "../../../../middle-layer/types/CashflowRevenue.ts";
import {CashflowCost} from "../../../../middle-layer/types/CashflowCost.ts";
import { api } from "../../api.ts";
import { fetchCosts, fetchRevenues } from "./processCashflowData.ts";

// This has not been tested yet but the basic structure when implemented should be the same
// Mirrored format for processGrantDataEditSave.ts

// save a new revenue
export const createNewRevenue = async (newRevenue: CashflowRevenue) => {
  try {
    const response = await api("/cashflow-revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRevenue),
    });

    if (response.ok) {
      await fetchRevenues();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create revenue");
    }
  } catch (error) {
    console.error("Error creating revenue:", error);
    console.log(newRevenue);
    console.log(newRevenue.installments);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

// save a new cost
export const createNewCost = async (newCost: CashflowCost) => {
  try {
    const response = await api("/cashflow-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCost),
    });

    if (response.ok) {
      await fetchCosts();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create cost");
    }
  } catch (error) {
    console.error("Error creating cost:", error);
    console.log(newCost);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

export const saveRevenueEdits = async (oldName: string, updatedRevenue: CashflowRevenue) => {
  try {
        // Need to replace with acual endpoint
    const response = await api(`/cashflow-revenue/${oldName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRevenue),
    });

    if (response.ok) {
      await fetchRevenues();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update revenue");
    }
  } catch (error) {
    console.error("Error updating revenue:", error);
    console.log(updatedRevenue);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

export const saveCostEdits = async (updatedCost: CashflowCost, originalCostName: string) => {
  try {
    const response = await api(`/cashflow-cost/${originalCostName}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCost),
    });

    if (response.ok) {
      await fetchCosts();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update cost");
    }
  } catch (error) {
    console.error("Error updating cost:", error);
    console.log(updatedCost);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

export const deleteRevenue = async (revenueId: any) => {
      // Need to replace with acual endpoint
        try {
          const response = await api(`/revenue/${revenueId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          console.log("Response status:", response.status);
          console.log("Response ok:", response.ok);
  
          if (response.ok) {
            console.log("✅ Revenue deleted successfully");
            // Refetch revenues to update UI
            await fetchRevenues();
          } else {
            // Get error details
            const errorText = await response.text();
            console.error("❌ Error response:", errorText);
  
            let errorData;
            try {
              errorData = JSON.parse(errorText);
              console.error("Parsed error:", errorData);
            } catch {
              console.error("Could not parse error response");
            }
          }
        } catch (err) {
          console.error("=== EXCEPTION CAUGHT ===");
          console.error(
            "Error type:",
            err instanceof Error ? "Error" : typeof err
          );
          console.error(
            "Error message:",
            err instanceof Error ? err.message : err
          );
          console.error("Full error:", err);
        }
      };

export const deleteCost = async (costName: any) => {
        try {
          const response = await api(`/cashflow-cost/${costName}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          console.log("Response status:", response.status);
          console.log("Response ok:", response.ok);
  
          if (response.ok) {
            console.log("✅ Cost deleted successfully");
            // Refetch costs to update UI
            await fetchCosts();
          } else {
            // Get error details
            const errorText = await response.text();
            console.error("❌ Error response:", errorText);
  
            let errorData;
            try {
              errorData = JSON.parse(errorText);
              console.error("Parsed error:", errorData);
            } catch {
              console.error("Could not parse error response");
            }
          }
        } catch (err) {
          console.error("=== EXCEPTION CAUGHT ===");
          console.error(
            "Error type:",
            err instanceof Error ? "Error" : typeof err
          );
          console.error(
            "Error message:",
            err instanceof Error ? err.message : err
          );
          console.error("Full error:", err);
        }
      };