import React, { useEffect, useState } from "react";
import "./styles/GrantItem.css";
import { GrantAttributes } from "./GrantAttributes";
import GrantDetails from "./GrantDetails";
import StatusIndicator from "./StatusIndicator";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../middle-layer/types/Grant";
import { DoesBcanQualifyText } from "../../translations/general";
import RingButton, { ButtonColorOption } from "../../custom/RingButton";
import { Status } from "../../../../middle-layer/types/Status";

interface GrantItemProps {
  grant: Grant;
  defaultExpanded?: boolean;
}

const GrantItem: React.FC<GrantItemProps> = ({ grant, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [curGrant, setCurGrant] = useState(grant);

  // Track whether each custom dropdown is open.
  const [qualifyDropdownOpen, setQualifyDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Sync isExpanded with the defaultExpanded prop.
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleEdit = async () => {
    if (isEditing) {
      // Save changes when exiting edit mode.
      try {
        console.log("Saving grant!");
        const response = await fetch("http://localhost:3001/grant/save", {
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
    setQualifyDropdownOpen(false);
    setStatusDropdownOpen(false);
  };

  return (
    <div className="grant-item-wrapper">
      <div
        className={`grant-summary p-4 ${isExpanded ? "expanded rounded-b-none" : ""} grid grid-cols-5 items-center`}
        onClick={toggleExpand}
      >
        <li className="grant-name text-left flex items-center">
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          <span className="ml-2 truncate">{curGrant.organization}</span>
        </li>
        <li className="application-date">
          {curGrant.application_deadline 
            ? new Date(curGrant.application_deadline).toLocaleDateString() 
            : "No date"}
        </li>
        <li className="amount">
          {curGrant.amount ? "$" + curGrant.amount : ""}
        </li>
        <li className="does-bcan-qualify">
          {isEditing ? (
            <div className="custom-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <div onClick={() => setQualifyDropdownOpen(!qualifyDropdownOpen)}>
                <RingButton 
                  text={curGrant.does_bcan_qualify ? DoesBcanQualifyText.Yes : DoesBcanQualifyText.No}
                  color={curGrant.does_bcan_qualify ? ButtonColorOption.GREEN : ButtonColorOption.GRAY} 
                />
              </div>
              {qualifyDropdownOpen && (
                <div className="custom-dropdown">
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, does_bcan_qualify: true });
                      setQualifyDropdownOpen(false);
                    }}
                  >
                    <RingButton text={DoesBcanQualifyText.Yes} color={ButtonColorOption.GREEN} />
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, does_bcan_qualify: false });
                      setQualifyDropdownOpen(false);
                    }}
                  >
                    <RingButton text={DoesBcanQualifyText.No} color={ButtonColorOption.GRAY} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            curGrant.does_bcan_qualify ? (
              <RingButton text={DoesBcanQualifyText.Yes} color={ButtonColorOption.GREEN} />
            ) : (
              <RingButton text={DoesBcanQualifyText.No} color={ButtonColorOption.GRAY} />
            )
          )}
        </li>
        <li className="flex justify-center items-center text-center">
          {isEditing ? (
            <div className="custom-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <div onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
                <div className="status-button-preview">
                  <StatusIndicator curStatus={curGrant.status} />
                </div>
              </div>
              {statusDropdownOpen && (
                <div className="custom-dropdown">
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Active });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default green-button">Active</div>
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Inactive });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default gray-button">Inactive</div>
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Potential });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default orange-button">Potential</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <StatusIndicator curStatus={curGrant.status} />
          )}
        </li>
      </div>
      <div className={`grant-body bg-tan ${isExpanded ? "expanded" : ""}`}>
        {isExpanded && (
          <div className="grant-description">
            <h2 className="font-semibold">
              Community Development Initiative Grant
            </h2>
            <div className="grant-content">
              <GrantAttributes
                curGrant={curGrant}
                setCurGrant={setCurGrant}
                isEditing={isEditing}
              />
              <GrantDetails
                curGrant={curGrant}
                setCurGrant={setCurGrant}
                isEditing={isEditing}
              />
            </div>
            <div className="bottom-buttons">
              <button className="done-button" onClick={(e) => { e.stopPropagation(); toggleEdit(); }}>
                {isEditing ? "SAVE" : "EDIT"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantItem;
