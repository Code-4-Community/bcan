import { Grant } from "../../../../../middle-layer/types/Grant";
import { api } from "../../../api.ts";
import { fetchGrants } from "../filter-bar/processGrantData.ts";

// save a new grant
export const createNewGrant = async (newGrant: Grant) => {
  try {
    const response = await api("/grant/new-grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGrant),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errMessage || "Failed to add grant.");
    }
    await fetchGrants();
    return { success: true };
  } catch (error) {
    console.error("Error creating grant:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Server error. Please try again."
    };
  }
  
};

// update an existing grant
export const saveGrantEdits = async (updatedGrant: Grant) => {
  try {
    console.log("=== SAVE GRANT EDITS DEBUG ===");
    console.log("Grant being sent:", updatedGrant);
    console.log("Grant ID:", updatedGrant.grantId);
    console.log("Stringified body:", JSON.stringify(updatedGrant));


    
    const response = await api("/grant/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedGrant),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      // Try to get error details
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
      
      throw new Error(errorData.errMessage || `Failed to update grant (${response.status})`);
    }
    await fetchGrants();
    return { success: true };
  } catch (error) {
    console.error("=== ERROR UPDATING GRANT ===");
    console.error("Error details:", error);
    console.error("Error type:", error instanceof Error ? "Error" : typeof error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Server error. Please try again."
    };
  }
};