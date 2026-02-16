import React, { useEffect, useState, useLayoutEffect } from "react";
import "../styles/GrantItem.css";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { api } from "../../../api";
import { observer } from "mobx-react-lite";
import { fetchGrants } from "../filter-bar/processGrantData";
import StatusIndicator from "../../grants/grant-list/StatusIndicator";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Button from "../../settings/components/Button";

interface GrantItemProps {
  grant: Grant;
}

const GrantItem: React.FC<GrantItemProps> = observer(({ grant }) => {
  const [curGrant, setCurGrant] = useState(grant);
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const useTruncatedElement = ({
    ref,
  }: {
    ref: React.RefObject<HTMLElement>;
  }) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const [isShowingMore, setIsShowingMore] = useState(false);

    useLayoutEffect(() => {
      const { offsetHeight, scrollHeight } = ref.current || {};

      if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }
    }, [ref]);

    const toggleIsShowingMore = () => setIsShowingMore((prev) => !prev);

    return {
      isTruncated,
      isShowingMore,
      toggleIsShowingMore,
    };
  };
  const ref = React.useRef(null);
  const { isTruncated, isShowingMore, toggleIsShowingMore } =
    useTruncatedElement({
      ref,
    });

  // If the NewGrantModal has been closed and a new grant submitted (or existing grant edited),
  // fetch the grant at this index so that all new changes are immediately reflected
  useEffect(() => {
    const updateGrant = async () => {
      if (!showNewGrantModal && wasGrantSubmitted) {
        try {
          const response = await api(`/grant/${grant.grantId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const updatedGrant = await response.json();
            setCurGrant(updatedGrant);
            console.log("✅ Grant refreshed:", updatedGrant);
          } else {
            console.error("❌ Failed to fetch updated grant");
          }
        } catch (err) {
          console.error("Error fetching updated grant:", err);
        }
        setWasGrantSubmitted(false);
      }
    };

    updateGrant();
  }, [showNewGrantModal, wasGrantSubmitted]);

  const deleteGrant = async () => {
    setShowDeleteModal(false);

    console.log("=== DELETE GRANT DEBUG ===");
    console.log("Current grant:", curGrant);
    console.log("Grant ID:", curGrant.grantId);
    console.log("Organization:", curGrant.organization);
    console.log("Full URL:", `/grant/${curGrant.grantId}`);

    try {
      const response = await api(`/grant/${curGrant.grantId}`, {
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
      console.error("Error type:", err instanceof Error ? "Error" : typeof err);
      console.error("Error message:", err instanceof Error ? err.message : err);
      console.error("Full error:", err);
    }
  };

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  function formatCurrency(amount: number): string {
    const formattedCurrency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
    return formattedCurrency;
  }

  return (
    <div className="w-full bg-white rounded-md flex flex-col gap-4 p-6">
      {/* Top header part */}
      <div className="flex justify-between">
        {/* Left side */}
        <div className="flex flex-col gap-2 items-start text-left">
          <h2 className="text-2xl font-semibold">{curGrant.organization}</h2>
          <StatusIndicator curStatus={curGrant.status} />
        </div>
        {/* Right side */}
        <div className="flex flex-col gap-2 items-end">
          <Button
            text="Edit"
            onClick={() => alert("edit personal info")}
            className="bg-white text-black border-2 border-grey-500"
            logo={faPenToSquare}
            logoPosition="right"
          />
        </div>
      </div>
      <hr className="border-grey-400 border-t-2 rounded-full" />
      {/* Middle info part */}
      <div className="flex flex-col gap-2 items-start text-left">
        {/* Description */}
        <div>
            <p className="text-grey-600 mb-2">Description</p>
          <p ref={ref} className={` ${!isShowingMore && "line-clamp-3"}`}>
            {curGrant?.description || "N/A"}
          </p>
          {isTruncated && (
            <button className="text-secondary" onClick={toggleIsShowingMore}>
              {isShowingMore ? "See less" : "see more"}
            </button>
          )}
        </div>
        {/* Other details */}
      </div>
    </div>
  );
});

export default GrantItem;
