import Attachment from "../../../../../middle-layer/types/Attachment.ts";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { api } from "../../../api.ts";
import { GrantFormState } from "../filter-bar/EditGrant.tsx";
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

type Action =
  | { type: "SET_FIELD"; field: keyof GrantFormState; value: any }
  | { type: "ADD_REPORT_DATE" }
  | { type: "REMOVE_REPORT_DATE"; index: number }
  | { type: "ADD_ATTACHMENT"; attachment: Attachment }
  | { type: "REMOVE_ATTACHMENT"; index: number };

export function reducer(state: GrantFormState, action: Action): GrantFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "ADD_REPORT_DATE":
      return { ...state, reportDates: [...state.reportDates, ""] };

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