import React from "react";
import "./styles/GrantLabels.css";
import { Grant } from "../../external/bcanSatchel/store.ts";
import { useState } from "react";

const GrantLabels: React.FC<{
  onSort: (header: keyof Grant, asc: boolean) => void;
}> = ({ onSort }) => {
  const [labels, setLabels] = useState({
    header: "applicationDate",
    asc: true,
  });

  function buttonHandler(header: keyof Grant) {
    const isAsc = labels.header == header ? !labels.asc : true;
    onSort(header, isAsc);
    setLabels({ header: header, asc: isAsc });
  }

  return (
    <ul className="grant-labels">
      <li>
        <button
          className="grant-name"
          onClick={() => buttonHandler("organization_name")}
        >
          Grant Name
        </button>
      </li>
      <li>
        <button
          className="application-date"
          onClick={() => buttonHandler("deadline")}
        >
          Application Date
        </button>
      </li>
      <li>
        <button className="status" onClick={() => buttonHandler("status")}>
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
          onClick={() => buttonHandler("restrictions")}
        >
          Restricted vs. Unrestricted
        </button>
      </li>
    </ul>
  );
};

export default GrantLabels;
