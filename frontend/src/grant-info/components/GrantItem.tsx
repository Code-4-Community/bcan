import React, { useEffect, useState } from "react";
import "./styles/GrantItem.css";
import { GrantAttributes } from "./GrantAttributes";
import GrantDetails from "./GrantDetails";
import StatusIndicator from "./StatusIndicator";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../middle-layer/types/Grant";
import { DoesBcanQualifyText } from "../../translations/general";
import RingButton, { ButtonColorOption } from "../../custom/RingButton";

interface GrantItemProps {
  grant: Grant;
  defaultExpanded?: boolean;
}

const GrantItem: React.FC<GrantItemProps> = ({ grant, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [curGrant, setCurGrant] = useState(grant);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

// Update isExpanded if defaultExpanded prop changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleEdit = async () => {
    if (isEditing) {
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
          {curGrant.does_bcan_qualify
           ? <RingButton text={DoesBcanQualifyText.Yes} color={ButtonColorOption.GREEN}/>
           : <RingButton text={DoesBcanQualifyText.No} color={ButtonColorOption.GRAY}/>}
        </li>
        <li className="flex justify-center items-center text-center">
          <StatusIndicator curStatus={grant.status} />
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
              <button className="done-button" onClick={toggleEdit}>
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
