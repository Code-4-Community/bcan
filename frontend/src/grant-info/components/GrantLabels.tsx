import React from "react";
import "./styles/GrantLabels.css";
import { useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant";

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
    <ul className="grant-labels grid grid-cols-4 justify-stretch font-semibold p-4">
      <li className="text-center">
        <button
          className="grant-name"
          onClick={() => buttonHandler("organization")}
        >
          Organization Name {labels.header == "organization" ? (labels.asc ? "▲" : "▼") : ""}
        </button>
      </li>
      <li className="text-center">
        <button
          className="application-date"
          onClick={() => buttonHandler("application_deadline")}
        >
          Application Deadline {labels.header == "application_deadline" ? (labels.asc ? "▲" : "▼") : ""}
        </button>
      </li>
      <li className="text-center">
        <button className="amount" onClick={() => buttonHandler("amount")}>
          Amount {labels.header == "amount" ? (labels.asc ? "▲" : "▼") : ""}
        </button>
      </li>
      <li className="text-center">
        <button className="status" onClick={() => buttonHandler("status")}>
          Status {labels.header == "status" ? (labels.asc ? "▲" : "▼") : ""}
        </button>
      </li>
      
      {/* <li>
        <button
          className="restriction-status"
          onClick={() => buttonHandler("restrictions")}
        >
          Restricted vs. Unrestricted
        </button>
      </li> */}
    </ul>
  );
};

export default GrantLabels;
