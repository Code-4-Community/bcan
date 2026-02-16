import React, { useEffect, useState, useLayoutEffect } from "react";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { api } from "../../../api";
import { observer } from "mobx-react-lite";
import { fetchGrants } from "../filter-bar/processGrantData";
import StatusIndicator from "../../grants/grant-list/StatusIndicator";
import {
  faPenToSquare,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../settings/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../../images/logo.svg";

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
    if (!isoString) return "N/A";
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
      <div className="flex flex-col gap-4 items-start text-left">
        {/* Description */}
        <div>
          <p className="text-grey-600 mb-1">Description</p>
          <p ref={ref} className={` ${!isShowingMore && "line-clamp-3"}`}>
            {curGrant?.description || "N/A"}
          </p>
          {isTruncated && (
            <button className="text-secondary" onClick={toggleIsShowingMore}>
              {isShowingMore ? "Show less" : "show more"}
            </button>
          )}
        </div>
        {/* Other details */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full gap-4">
          <div className="flex flex-col gap-4 col-span-1">
            <div>
              <p className="text-grey-600 mb-1">Amount ($)</p>
              <p className="text-black font-semibold">
                {formatCurrency(curGrant.amount) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-grey-600 mb-1">BCAN Eligible</p>
              <p className="text-black font-semibold">
                {curGrant.does_bcan_qualify ? (
                  <span className="text-green">
                    <FontAwesomeIcon icon={faCheckSquare} /> Yes
                  </span>
                ) : (
                  <span className="text-red">
                    <FontAwesomeIcon icon={faCheckSquare} /> No
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-1">
            <div>
              <p className="text-grey-600 mb-1">Due Date</p>
              <p className="text-black font-semibold">
                {formatDate(curGrant.application_deadline) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-grey-600 mb-1">Application Date</p>
              <p className="text-black font-medium">
                {formatDate(curGrant.application_deadline) || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-1">
            <div>
              <p className="text-grey-600 mb-1">Grant Start Date</p>
              <p className="text-black font-medium">
                {formatDate(curGrant.grant_start_date) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-grey-600 mb-1">Report Deadlines</p>
              <p className="text-black font-medium">
                {curGrant.report_deadlines &&
                curGrant.report_deadlines.length > 0 ? (
                  curGrant.report_deadlines.map(
                    (deadline: string, index: number) => (
                      <div key={index} className="text-black font-medium">
                        {formatDate(deadline)}
                      </div>
                    ),
                  )
                ) : (
                  <div className="">N/A</div>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-2">
            <div>
              <p className="text-grey-600 mb-1">Timeline (years)</p>
              <p className="text-black font-medium">
                {curGrant.timeline ? curGrant.timeline : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-grey-600 mb-1">
                Estimated Completion Time (hours)
              </p>
              <p className="text-black font-medium">
                {curGrant.estimated_completion_time
                  ? curGrant.estimated_completion_time
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-grey-400 border-t-2 rounded-full" />
      {/* Bottom info */}
      <div className="flex flex-col gap-4 items-start text-left">
        {/* Contacts */}
        <div className="w-full">
          <p className="text-grey-600 mb-1">Contacts</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 w-full xl:w-[85%] gap-4">
            <div className="flex flex-row gap-4 w-full justify-items-start rounded-sm border p-3 h-fit border-grey-400">
              <img
                src={logo}
                alt="Profile"
                className="max-w-14 rounded-full hidden lg:block"
              />
              <div className="flex flex-col align-middle justify-center">
                <p className="text-black text-md font-semibold ">
                  {grant.bcan_poc?.POC_name || "N/A"}
                </p>
                <p className="text-black text-sm break-all">
                  <a
                    href={"mailto:" + grant.bcan_poc?.POC_email}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline truncate"
                  >
                    {grant.bcan_poc?.POC_email}
                  </a>
                </p>
              </div>
              <div className="place-items-end justify-end ml-auto flex items-start">
                <div className="w-fit h-fit p-2 text-xs rounded-full text-white bg-primary-900">
                  BCAN
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4 justify-start rounded-sm border p-3 h-fit border-grey-400">
              <img
                src={logo}
                alt="Profile"
                className="max-w-14 rounded-full hidden lg:block"
              />
              <div className="flex flex-col align-middle justify-center">
                <p className="text-black text-md font-semibold">
                  {grant.bcan_poc?.POC_name || "N/A"}
                </p>
                <p className="text-black text-sm break-all !font-normal">
                  <a
                    href={"mailto:" + grant.bcan_poc?.POC_email}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline truncate"
                  >
                    {grant.grantmaker_poc?.POC_email || "N/A"}
                  </a>
                </p>
              </div>
              <div className="place-items-end col-span-1 ml-auto justify-end flex items-start">
                <div className="w-fit h-fit p-2 text-xs rounded-full text-white bg-secondary-500">
                  Granter
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Documents */}
        <div>
          <p className="text-grey-600 mb-1">Documents</p>
          <p ref={ref} className={` ${!isShowingMore && "line-clamp-3"}`}>
            {curGrant?.description || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
});

export default GrantItem;
