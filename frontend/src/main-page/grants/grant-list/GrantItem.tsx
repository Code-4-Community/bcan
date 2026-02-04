import React, { useEffect, useState } from "react";
import "../styles/GrantItem.css";
import StatusIndicator from "./StatusIndicator";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { DoesBcanQualifyText } from "../../../translations/general";
import RingButton, { ButtonColorOption } from "../../../custom/RingButton";
import { api } from "../../../api";
import { MdOutlinePerson2 } from "react-icons/md";
import Attachment from "../../../../../middle-layer/types/Attachment";
import NewGrantModal from "../new-grant/NewGrantModal";
import { CostBenefitAnalysis } from "../grant-details/CostBenefitAnalysis";
import ActionConfirmation from "../../../custom/ActionConfirmation";
import { observer } from "mobx-react-lite";
import { fetchGrants } from "../filter-bar/processGrantData";

interface GrantItemProps {
  grant: Grant;
  defaultExpanded?: boolean;
}

const GrantItem: React.FC<GrantItemProps> = observer(
  ({ grant, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isEditing, setIsEditing] = useState(false);
    const [curGrant, setCurGrant] = useState(grant);
    const [showNewGrantModal, setShowNewGrantModal] = useState(false);
    const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleExpand = () => {
      // Toggle edit mode off now that we are leaving this specific grant in view
      if (isExpanded) {
        toggleEdit();
      }
      setIsExpanded(!isExpanded);
    };

    // Sync isExpanded with the defaultExpanded prop.
    useEffect(() => {
      setIsExpanded(defaultExpanded);
    }, [defaultExpanded]);

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

    const toggleEdit = async () => {
      if (isEditing) {
        // Save changes when exiting edit mode.
        try {
          const response = await api("/grant/save", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(curGrant),
          });
          const result = await response.json();
          console.log(result);
        } catch (err) {
          console.error("Error saving data:", err);
        }
      }
      setIsEditing(!isEditing);
    };

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
      <div className="grant-item-wrapper w-fit">
        <div
          className={`grant-summary p-4 ${
            isExpanded ? "expanded rounded-b-none" : ""
          } grid grid-cols-5 items-center`}
          onClick={toggleExpand}
        >
          <li className="font-bold text-left flex items-center">
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            <span className="ml-2 truncate">{curGrant.organization}</span>
          </li>
          <li className="application-date">
            {curGrant.application_deadline
              ? new Date(curGrant.application_deadline).toLocaleDateString()
              : "No date"}
          </li>
          <li className="amount">{formatCurrency(curGrant.amount)}</li>
          <li className="does-bcan-qualify px-8" style={{ width: "100%" }}>
            {curGrant.does_bcan_qualify ? (
              <RingButton
                text={DoesBcanQualifyText.Yes}
                color={ButtonColorOption.GREEN}
              />
            ) : (
              <RingButton
                text={DoesBcanQualifyText.No}
                color={ButtonColorOption.GRAY}
              />
            )}
          </li>
          <li className="flex justify-center items-center text-center">
            <StatusIndicator curStatus={curGrant.status} />
          </li>
        </div>

        <div className={`grant-body bg-white ${isExpanded ? "expanded" : ""}`}>
          {isExpanded && (
            <div>
              <div className="m-4">
                {/*div for the two columns above description*/}
                <div className="flex">
                  {/*Left column */}
                  <div className="w-1/2">
                    {/*Organization name (only div in the first row) */}
                    <div className="text-left mb-6 text-lg">
                      <label className="font-semibold text-left text-lg">
                        {" "}
                        Organization Name
                      </label>
                      <div className="text-left ">{curGrant.organization}</div>
                    </div>

                    {/*Col of gray labels + col of report deadliens (below org name) */}
                    <div className="flex justify-between ">
                      {/*Left column of gray labels */}
                      <div className="w-1/2 mr-2">
                        {/*Application date and grant start date row*/}
                        <div className="flex space-x-4 w-full">
                          {/*Application date*/}
                          <div className="w-1/2 mb-3">
                            <label
                              className="flex block tracking-wide text-gray-700 font-bold mb-2 text-left text-sm lg:text-wrap xl:text-nowrap"
                              htmlFor="grid-city"
                            >
                              Application Date
                            </label>
                            <div
                              style={{
                                color: "black",
                              }}
                              className="h-9  flex items-center bg-light-gray-2 justify-center w-full rounded-full px-4"
                            >
                              {formatDate(curGrant.application_deadline)}
                            </div>
                          </div>
                          {/*Grant Start Date */}
                          <div className=" w-1/2">
                            <label
                              className="flex block tracking-wide text-gray-700 font-bold mb-2 text-left text-sm"
                              htmlFor="grid-state"
                            >
                              Grant Start Date
                            </label>
                            <div
                              style={{
                                color: "black",
                                fontStyle: curGrant.grant_start_date
                                  ? "normal"
                                  : "italic",
                              }}
                              className="h-9 flex items-center bg-light-gray-2 justify-center w-full rounded-full px-4"
                            >
                              {curGrant.grant_start_date
                                ? formatDate(curGrant.grant_start_date)
                                : "-------"}
                            </div>
                          </div>

                          {/*End application date and grant start date row */}
                        </div>

                        {/*Estimated completion time row*/}
                        <div className="w-full justify-center">
                          <label
                            className="mt-2 flex block tracking-wide text-gray-700 font-bold mb-2 text-left  sm:text-sm lg:text-base"
                            htmlFor="grid-state"
                          >
                            Estimated Completion Time
                          </label>
                          <div
                            style={{
                              color: "black",
                              fontStyle: curGrant.estimated_completion_time
                                ? "normal"
                                : "italic",
                            }}
                            className="text-left  sm:text-sm lg:text-base h-10 flex w-2/3  "
                          >
                            {curGrant.estimated_completion_time
                              ? curGrant.estimated_completion_time + " hours"
                              : "No est completion time"}
                          </div>
                        </div>
                        {/*Timeline and Amount row*/}
                        <div className="flex space-x-4 mt-5 w-full">
                          {/*Timeline*/}
                          <div className="w-full">
                            <label
                              className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-2"
                              htmlFor="grid-city"
                            >
                              Timeline
                            </label>
                            <div
                              style={{
                                color: "black",
                                fontStyle: curGrant.timeline
                                  ? "normal"
                                  : "italic",
                              }}
                              className="text-left  sm:text-sm lg:text-base h-10 w-full"
                            >
                              {curGrant.timeline
                                ? curGrant.timeline + " years"
                                : "No timeline"}
                            </div>
                          </div>
                          {/*Amount */}
                          <div className=" w-full">
                            <label
                              className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-2"
                              htmlFor="grid-state"
                            >
                              Amount
                            </label>
                            <div
                              style={{ color: "black" }}
                              className="text-left  sm:text-sm lg:text-base h-10 w-full"
                            >
                              {formatCurrency(curGrant.amount)}
                            </div>
                          </div>
                          {/*End timeline and amount row */}
                        </div>

                        {/*End column of gray labels */}
                      </div>

                      {/*Report deadlines div*/}
                      <div className="w-1/2 h-full pl-5">
                        <label className="flex block tracking-wide text-gray-700 font-bold mb-2 text-left  sm:text-sm lg:text-base">
                          Report Deadlines
                        </label>
                        <div
                          className="p-2 rounded-md h-[13.5rem] w-4/5  overflow-auto grip bg-medium-orange"
                          style={{
                            borderStyle: "solid",
                            borderColor: "black",
                            borderWidth: "1px",
                          }}
                        >
                          {/*Map each available report deadline to a div label
                    If no deadlines, add "No deadlines" text */}
                          {curGrant.report_deadlines &&
                          curGrant.report_deadlines.length > 0 ? (
                            curGrant.report_deadlines.map(
                              (deadline: string, index: number) => (
                                <div
                                  key={index}
                                  style={{
                                    color: "black",
                                  }}
                                  className="h-10 flex items-center bg-light-gray-2 justify-center w-full rounded-full mb-2 px-4"
                                >
                                  {formatDate(deadline)}
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-center text-gray-700 italic">
                              No deadlines
                            </div>
                          )}
                        </div>
                        {/*End report deadlines div*/}
                      </div>

                      {/* End row of gray labels (application date, grant start date, estimated completion time) to next of report deadline + report deadline */}
                    </div>

                    {/*End left column */}
                  </div>

                  {/*Right column */}
                  <div className="w-1/2 ">
                    {/*POC row */}
                    <div className="flex w-full mb-4">
                      {/*BCAN POC div*/}
                      <div className="w-1/2 pr-3">
                        <label
                          className=" sm:text-sm lg:text-base mb-2 flex block tracking-wide text-gray-700 font-bold "
                          htmlFor="grid-zip"
                        >
                          BCAN POC
                        </label>
                        {/*Box div*/}
                        <div
                          className="items-center flex rounded-md bg-medium-orange"
                          style={{
                            borderColor: "black",
                            borderWidth: "1px",
                          }}
                        >
                          <MdOutlinePerson2 className="w-1/5 h-full p-1" />
                          <div
                            className="w-4/5 border-l border-black rounded-r-md bg-tan"
                          >
                            <h2
                              className="truncate px-2 text-left font-bold h-8 w-full text-gray-700 rounded flex items-center"
                              id="grid-city"
                            >
                              {" "}
                              {curGrant.bcan_poc?.POC_name ?? "Unknown"}{" "}
                            </h2>
                            <h2
                              className="truncate px-2 text-left h-8 w-full text-gray-700 rounded flex items-center"
                              id="grid-city"
                              title={
                                curGrant.bcan_poc?.POC_email ?? "----------"
                              }
                            >
                              {" "}
                              {curGrant.bcan_poc?.POC_email ??
                                "----------"}{" "}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/*Grant Provider POC div*/}
                      <div className="w-1/2 pl-3">
                        <label
                          className=" sm:text-sm lg:text-base mb-2 flex block tracking-wide text-gray-700 font-bold text-left"
                          htmlFor="grid-zip"
                        >
                          Grant Provider POC
                        </label>
                        {/*Box div*/}
                        <div
                          className="items-center flex rounded-md bg-medium-orange"
                          style={{
                            borderColor: "black",
                            borderWidth: "1px",
                          }}
                        >
                          <MdOutlinePerson2 className="w-1/5 h-full p-1" />
                          <div
                            className="w-4/5 border-l border-black rounded-r-md bg-tan"
                          >
                            <h2
                              className="truncate px-2 text-left font-bold h-8 w-full text-gray-700 rounded-md flex items-center"
                              id="grid-city"
                            >
                              {" "}
                              {curGrant.grantmaker_poc?.POC_name ?? "Unknown"}
                            </h2>
                            <h2
                              className="truncate px-2 text-left h-8 w-full text-gray-700 rounded-md flex items-center"
                              id="grid-city"
                              title={
                                curGrant.grantmaker_poc?.POC_email ??
                                "----------"
                              }
                            >
                              {" "}
                              {curGrant.grantmaker_poc?.POC_email ??
                                "----------"}{" "}
                            </h2>
                          </div>
                        </div>
                      </div>
                      {/*End POC row */}
                    </div>

                    {/* Colored attributes  + scope documents row*/}
                    <div className="flex justify-between">
                      {/*Colored attributes col */}
                      <div className="w-1/2 pr-3 ">
                        {/*Does BCAN qualify  */}
                        <div className="w-full mb-3">
                          <label
                            className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-1 text-left"
                            htmlFor="grid-city"
                          >
                            Does BCAN qualify?
                          </label>
                          <div
                            style={{
                              color: "black",
                              backgroundColor: curGrant.does_bcan_qualify
                                ? ButtonColorOption.GREEN
                                : ButtonColorOption.GRAY,
                            }}
                            className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                          >
                            {curGrant.does_bcan_qualify ? "Yes" : "No"}
                          </div>
                        </div>

                        {/*Status*/}
                        <div className="w-full mb-3">
                          <label
                            className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-1"
                            htmlFor="grid-city"
                          >
                            Status
                          </label>
                          <div
                            style={{
                              color: "black",
                              backgroundColor:
                                curGrant.status === "Active"
                                  ? ButtonColorOption.GREEN
                                  : curGrant.status === "Potential"
                                  ? ButtonColorOption.ORANGE
                                  : ButtonColorOption.GRAY,
                            }}
                            className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                          >
                            {curGrant.status}
                          </div>
                        </div>

                        {/*Restriction*/}
                        <div className="w-full mb-3">
                          <label
                            className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-1 text-left"
                            htmlFor="grid-city"
                          >
                            Is BCAN Restricted?
                          </label>
                          <div
                            style={{
                              color: "black",
                              backgroundColor: curGrant.isRestricted
                                ? "indianred"
                                : ButtonColorOption.GRAY,
                            }}
                            className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                          >
                            {curGrant.isRestricted
                              ? "Restricted"
                              : "Not Restricted"}
                          </div>
                        </div>
                        {/*End colored attributes col*/}
                      </div>

                      {/*Scope documents div*/}
                      <div className="w-1/2 pl-3">
                        <label className=" sm:text-sm lg:text-base flex block tracking-wide text-gray-700 font-bold mb-2 text-left">
                          Scope Documents
                        </label>
                        <div
                          className="p-2 rounded-md h-[11.5rem] overflow-auto grip grid-cols-1 gap-4"
                          style={{
                            backgroundColor: ButtonColorOption.GRAY,
                            borderStyle: "solid",
                            borderColor: "black",
                            borderWidth: "1px",
                          }}
                        >
                          {/*Map each available report deadline to a div label
                      If no deadlines, add "No deadlines" text */}
                          {curGrant.attachments &&
                          curGrant.attachments.length > 0 ? (
                            curGrant.attachments.map(
                              (attachment: Attachment, index: number) => (
                                <div className="">
                                  {attachment.url && (
                                    <div
                                      key={index}
                                      style={{
                                        color: "black",
                                        borderStyle: "solid",
                                        borderColor: "black",
                                        borderWidth: "1px",
                                        height: "42px",
                                      }}
                                      className="items-center truncate overflow-x-scroll overflow-hidden text-left justify-center w-full rounded-md p-2 mb-2 bg-tan"
                                    >
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline truncate"
                                      >
                                        {attachment.attachment_name ||
                                          "Untitled"}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-center text-gray-700 italic">
                              No documents
                            </div>
                          )}
                        </div>
                        {/*End scope docs div*/}
                      </div>
                    </div>

                    {/*End right column */}
                  </div>

                  {/*End two main left right columns */}
                </div>

                {/*Cost Benefit Analysis and Description Row*/}
            <div className="flex w-full mb-3 space-x-4 items-stretch">
              {/* Cost Benefit Analysis */}
              <div className="w-1/3 mr-2">
                <CostBenefitAnalysis grant={curGrant} />
                </div>

              {/*Description */}
              <div className="w-2/3">
              <label
                className="text-lg flex block tracking-wide text-gray-700  font-semibold mb-2"
                htmlFor="grid-city"
              >
                Description
              </label>
              <div
                style={{
                  color: "black",
                  borderStyle: "solid",
                  borderColor: "black",
                  borderWidth: "1px",
                }}
                className="h-64 bg-tan flex  w-full rounded-md  p-5 overflow-auto"
              >
                {curGrant.description}
                </div>
              </div>
            </div>

                {/*bottom buttons */}
                <div className="flex justify-between items-center w-full mt-6">
                  <>
                    <button
                      style={{
                        backgroundColor: "indianred",
                        color: "white",
                        borderStyle: "solid",
                        borderColor: "black",
                        borderWidth: "1px",
                      }}
                      className="py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete
                    </button>

                    <ActionConfirmation
                      isOpen={showDeleteModal}
                      onCloseDelete={() => setShowDeleteModal(false)}
                      onConfirmDelete={() => {
                        deleteGrant();
                      }}
                      title="Delete Grant"
                      subtitle={"Are you sure you want to delete"}
                      boldSubtitle={curGrant.organization}
                      warningMessage="By deleting this grant, they won't be available in the system anymore."
                    />
                  </>

                  <div className="space-x-4">
                    <button
                      style={{
                        backgroundColor: "white",
                        color: "black",
                        borderStyle: "solid",
                        borderColor: "black",
                        borderWidth: "1px",
                      }}
                      className="py-2 px-4 rounded-md"
                      onClick={() => setIsExpanded(false)}
                    >
                      {"Close"}
                    </button>

                    <button
                      style={{
                        backgroundColor: ButtonColorOption.ORANGE,
                        color: "black",
                        borderStyle: "solid",
                        borderColor: "black",
                        borderWidth: "1px",
                      }}
                      className="py-2 px-4 rounded-md"
                      onClick={() => setShowNewGrantModal(true)}
                    >
                      {"Edit"}
                    </button>
                  </div>
                </div>

                {/*End expanded div */}
              </div>
            </div>
          )}
        </div>

        <div className="hidden-features">
          {showNewGrantModal && (
            <NewGrantModal
              grantToEdit={curGrant}
              onClose={async () => {
                setShowNewGrantModal(false);
                setWasGrantSubmitted(true);
              }}
              isOpen={showNewGrantModal}
            />
          )}
        </div>
      </div>
    );
  }
);

export default GrantItem;
