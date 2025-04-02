import React, { useState } from "react";
import "./styles/GrantItem.css";
import { GrantAttributes } from "./GrantAttributes";
import GrantDetails from "./GrantDetails";
import StatusIndicator from "./StatusIndicator"; // import the new component
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../middle-layer/types/Grant";
import Status from "../../../../middle-layer/types/Status";

function isActiveStatus(status: Status) {
  return ["Pending", "In Review", "Awaiting Submission"].includes(status.toString());
}


interface GrantItemProps {
  grant: Grant;
}

// TODO: [JAN-14] Make uneditable field editable (ex: Description, Application Reqs, Additional Notes)
const GrantItem: React.FC<GrantItemProps> = ({ grant }) => {
  // when toggleEdit gets saved, then updates the backend to update itself with whatever
  // is shown in the front-end
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [curGrant, setCurGrant] = useState(grant);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const active = isActiveStatus(curGrant.status);

  // when toggle edit turns off, sends curGrant to backend to be saved
  const toggleEdit = async () => {
    if (isEditing) {
      // if you are saving
      try {
        console.log("Saving grant!");
        console.log(curGrant);
        const response = await fetch(import.meta.env.VITE_SERVER_URL+"/grant/save", {
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

  // temporary buffer

  return (
    // class name with either be grant-item or grant-item-expanded
    <div className="grant-item-wrapper">
      <div
        className={`grant-summary p-4 ${
          isExpanded ? "expanded rounded-b-none" : ""
        } grid grid-cols-4 items-center`}
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
        {/* <li className="status">{curGrant.status}</li> */}
        {/* <li className="restriction-status">{curGrant.restrictions}</li> */}
        <li className="flex justify-center items-center text-center">
          <StatusIndicator isActive={active} />
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
