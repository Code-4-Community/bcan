import React from "react";
import "./styles/GrantLabels.css";
import { GrantItemProps } from "./GrantItem";
import { useState } from "react";

const GrantLabels: React.FC<{
  onSort: (header: keyof GrantItemProps, asc: boolean) => void;
}> = ({ onSort }) => {
  const [labels, setLabels] = useState({
    header: "applicationDate",
    asc: true,
  });

  function buttonHandler(header: keyof GrantItemProps) {
    const isAsc = labels.header == header ? !labels.asc : true;
    onSort(header, isAsc);
    setLabels({ header: header, asc: isAsc });
  }

  return (
    <ul className="grant-labels">
      <li>
        <button
          className="grant-name"
          onClick={() => buttonHandler("grantName")}
        >
          Grant Name
        </button>
      </li>
      <li>
        <button
          className="application-date"
          onClick={() => buttonHandler("applicationDate")}
        >
          Application Date
        </button>
      </li>
      <li>
        <button
          className="status"
          onClick={() => buttonHandler("generalStatus")}
        >
          Status
        </button>
      </li>
      <li>
        <button className="amount" onClick={() => buttonHandler("amount")}>
          Amount
        </button>
      </li>
      <li>
        <button
          className="restriction-status"
          onClick={() => buttonHandler("restrictionStatus")}
        >
          Restricted vs. Unrestricted
        </button>
      </li>
    </ul>
  );
};

export default GrantLabels;
