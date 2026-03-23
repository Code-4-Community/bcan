import Attachment from "../../../../../middle-layer/types/Attachment.ts";
import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { api } from "../../../api.ts";
import { GrantFormState } from "./EditGrant.tsx";
import { fetchGrants } from "../filter-bar/processGrantData.ts";

// save a new grant
export const createNewGrant = async (newGrant: Grant) => {
  try {
    const response = await api("/grant/new-grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGrant),
    });

    if (response.ok) {
      await fetchGrants();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create grant");
    }
  } catch (error) {
    console.error("Error creating grant:", error);
    console.log(newGrant);
    console.log(newGrant.attachments);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

export const saveGrantEdits = async (updatedGrant: Grant) => {
  try {
    const response = await api("/grant/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedGrant),
    });

    if (response.ok) {
      await fetchGrants();
      return { success: true };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update grant");
    }
  } catch (error) {
    console.error("Error updating grant:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
    };
  }
};

export const deleteGrant = async (grantId: any) => {
  
        try {
          const response = await api(`/grant/${grantId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          console.log("Response status:", response.status);
          console.log("Response ok:", response.ok);
  
          if (response.ok) {
            console.log("✅ Grant deleted successfully");
            // Refetch grants to update UI
            await fetchGrants();
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

export type Action =
  | { type: "SET_FIELD"; field: keyof GrantFormState; value: any }
  | { type: "ADD_REPORT_DATE" }
  | { type: "UPDATE_REPORT_DATE"; index: number; value: any }
  | { type: "REMOVE_REPORT_DATE"; index: number }
  | { type: "ADD_ATTACHMENT"; attachment: Attachment }
  | { type: "REMOVE_ATTACHMENT"; index: number };

export function reducer(state: GrantFormState, action: Action): GrantFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "ADD_REPORT_DATE":
      return { ...state, reportDates: [...state.reportDates, ""] };

    case "UPDATE_REPORT_DATE":
      return {
        ...state,
        reportDates: state.reportDates.map((date, i) =>
  i === action.index ? action.value : date
),
      };

    case "REMOVE_REPORT_DATE":
      return {
        ...state,
        reportDates: state.reportDates.filter((_, i) => i !== action.index),
      };

    case "ADD_ATTACHMENT":
      return {
        ...state,
        attachments: [...state.attachments, action.attachment],
      };

    case "REMOVE_ATTACHMENT":
      return {
        ...state,
        attachments: state.attachments.filter((_, i) => i !== action.index),
      };

    default:
      return state;
  }
}
