import { useState, useEffect } from "react";
import { updateYearFilter } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";
import { FaChevronDown } from "react-icons/fa";

const DateFilter: React.FC = observer(() => {
  const { allGrants, yearFilter } = getAppStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate unique years dynamically from grants
  const uniqueYears = Array.from(
    new Set(
      allGrants.map((g) => new Date(g.application_deadline).getFullYear())
    )
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
    <div className="flex flex-col space-y-2 w-[300px]">
      <button
        className="grant-button bg-white inline-flex items-center justify-between px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedYears.length === 0
          ? "Select years"
          : selectedYears.length === uniqueYears.length
          ? "Select years (showing all)"
          : selectedYears.join(", ")}
        <FaChevronDown className="ms-2 text-sm" />
      </button>
      <div
        className={`z-[100] absolute  top-[185px]  w-[300px] bg-white ${showDropdown ? "" : "hidden"} rounded-[16px] border-2 border-gray-200 shadow-lg`}
      >
        <ul
          className="h-42 p-4 pb-3 overflow-y-auto text-sm "
          aria-labelledby="dropdownSearchButton"
        >
          {uniqueYears.map((year) => (
            <li key={year}>
              <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-sm accent-dark-orange bg-pale-orange"
                  id={year.toString()}
                  value={year}
                  checked={selectedYears.includes(year)}
                  onChange={handleCheckboxChange}
                />
                <label
                  htmlFor={year.toString()}
                  key={year}
                  className="ms-2 text-sm font-medium"
                >
                  {year}
                </label>
              </div>
            </li>
          ))}
        </ul>
        <hr className="border-t mx-4 border-gray-200" />
        <button className="p-2" onClick={()=>handleReset()}>Reset</button>
      </div>
    </div>
  );
});

export default DateFilter;
