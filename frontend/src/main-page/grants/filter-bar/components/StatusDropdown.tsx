
import React from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../../middle-layer/types/Status.ts";
import { observer } from "mobx-react-lite";
import CheckboxField from "../../../../components/CheckboxField";

interface StatusDropdownProps {
  selected: Status[];
  onSelect: (status: Status) => void;
  onClearAll: () => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = observer(({ selected, onSelect, onClearAll }) => {
  const statuses = Object.values(Status);

  return (
    <div className="absolute left-0 top-full mt-2 bg-white border border-primary-900 rounded-md p-4 z-50 shadow-lg w-[18rem] lg:w-[25rem] overflow-x-auto">
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-2 relative">
        {statuses.map((status) => (
          <CheckboxField
            key={status}
            id={`status-filter-${String(status)}`}
            checked={selected.includes(status)}
            onChange={() => onSelect(status)}
            label={
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: getColorStatus(status, "light"),
                  color: getColorStatus(status, "dark"),
                }}
              >
                {status}
              </span>
            }
          />
        ))}
        <button 
          onClick={onClearAll} 
          className="absolute bottom-0 right-2 text-xs font-semibold text-secondary-400 border-0 hover:text-secondary-400 hover:bg-opacity-0 focus:outline-none active:text-secondary">
					{"Clear all"}
				</button>
      </div>
    </div>
  );
});

export default StatusDropdown;
