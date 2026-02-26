
import React, { useState } from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../middle-layer/types/Status.ts";
import { updateFilter } from "../../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import Button from "../../../components/Button";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const StatusDropdown: React.FC = observer(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Status | null>(null);

  const statuses = [
    Status.Active,
    Status.Pending,
    Status.Potential,
    Status.Rejected,
    Status.Inactive,
  ];

  function handleSelect(status: Status) {
    const newSelected = selected === status ? null : status;
    setSelected(newSelected);
    updateFilter(newSelected);
  }


  return (
    <div className="relative">
    <Button
      text="Status"
      onClick={() => setIsOpen(!isOpen)}
      logo={isOpen ? faChevronUp : faChevronDown}
      logoPosition="right"
      className="border-grey-400 bg-white text-grey-900 text-base whitespace-nowrap"
    />

      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border border-primary-900 rounded-md p-4 z-50 shadow-lg min-w-[25rem] overflow-x-auto">

          <div className="grid grid-cols-3 gap-2">
            {statuses.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleSelect(status)}
              >
                <input
                  type="checkbox"
                  checked={selected === status}
                  onChange={() => handleSelect(status)}
                  className="cursor-pointer w-4 h-4 flex-shrink-0"
                />
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getColorStatus(status, "light"),
                    color: getColorStatus(status, "dark"),
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default StatusDropdown;
