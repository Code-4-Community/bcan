import { useState, useEffect } from "react";
import { updateYearFilter } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";
import { FaChevronDown } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const DateFilter: React.FC = observer(() => {
  const { allGrants, yearFilter } = getAppStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate unique years dynamically from grants
  const uniqueYears = Array.from(
    new Set(
      allGrants.map((g) => new Date(g.application_deadline).getFullYear()),
    ),
  ).sort((a, b) => a - b);

  // Initialize selection from store or fallback to all years
  const [selectedYears, setSelectedYears] = useState<number[]>(uniqueYears);

  // Keep local selection in sync if store changes
  useEffect(() => {
    if (uniqueYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears(yearFilter?.length ? yearFilter : uniqueYears);
    }
  }, [yearFilter, uniqueYears]);

  // Update local store and state on checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = Number(event.target.value);
    const checked = event.target.checked;

    let updatedYears;
    if (checked) {
      updatedYears = [...selectedYears, year];
    } else {
      updatedYears = selectedYears.filter((y) => y !== year);
    }

    setSelectedYears(updatedYears.sort((a, b) => a - b));
    updateYearFilter(updatedYears);
  };

  // Update local store and state on checkbox change
  const handleReset = () => {
    setSelectedYears(uniqueYears);
    updateYearFilter(uniqueYears);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col space-y-2 w- lg:w-80">
      <button
        className="dashboard-button bg-white inline-flex items-center justify-between px-4 py-2  text-xs lg:text-sm text-center text-white bg-blue-700 rounded-lg"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="flex flex-row overflow-hidden whitespace-nowrap text-ellipsis">
          {selectedYears.length === 0
            ? "Select years"
            : selectedYears.length === uniqueYears.length
              ? "Select years (showing all)"
              : selectedYears.join(", ")}
        </span>

        <FaChevronDown className="ms-2 text-sm" />
      </button>
      <div
        className={`z-[100] absolute  top-[184px]  w-[300px] bg-white ${showDropdown ? "" : "hidden"} rounded-md border-2 border-gray-200 shadow-lg`}
      >
        <button
          className="close-button absolute top-3 right-4 text-lg"
          onClick={() => setShowDropdown(false)}
          aria-label="Close notifications"
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg" />
        </button>
        <ul
          className="h-42 p-4 pb-3 overflow-y-auto text-sm "
          aria-labelledby="dropdownSearchButton"
        >
          {uniqueYears.map((year) => (
            <li key={year}>
              <div className="flex items-center p-2 rounded-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-sm accent-primary-900 bg-orange-lightest"
                  id={year.toString()}
                  value={year}
                  checked={selectedYears.includes(year)}
                  onChange={handleCheckboxChange}
                />
                <label
                  htmlFor={year.toString()}
                  key={year}
                  className="ms-2 text-sm"
                >
                  {year}
                </label>
              </div>
            </li>
          ))}
        </ul>
        <hr className="border-t mx-4 border-gray-200" />
        <button className="p-2" onClick={() => handleReset()}>
          Reset
        </button>
      </div>
    </div>
  );
});

export default DateFilter;
