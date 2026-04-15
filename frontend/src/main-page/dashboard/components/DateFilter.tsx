import { useState, useEffect, useRef } from "react";
import { updateYearFilter } from "../../../external/bcanSatchel/actions";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "../../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CheckboxField from "../../../components/CheckboxField";

function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Check if the click happened outside the referenced element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

const DateFilter: React.FC = observer(() => {
  const { allGrants, yearFilter } = getAppStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useOutsideClick(() => setShowDropdown(false));

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
    <div className="flex flex-col space-y-2 relative">
      <Button
        text={selectedYears.length === 0
            ? "Select years"
            : selectedYears.length === uniqueYears.length
              ? "Select years (showing all)"
              : selectedYears.join(", ")}
        onClick={() => setShowDropdown(!showDropdown)}
        logo={faChevronDown}
        logoPosition="right"
        className="bg-white border-grey-500 inline-flex items-center justify-between text-sm lg:text-base"
      />
      <div
        ref={ref}
        className={`z-[100] absolute top-10 sm:w-[14.2rem] lg:w-64 bg-white ${showDropdown ? "" : "hidden"} rounded-md border-2 border-grey-500 shadow-lg`}
      >
        <button
          className="close-button absolute top-3 right-4 text-lg"
          onClick={() => setShowDropdown(false)}
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg hover:text-red" />
        </button>
        <ul
          className="h-42 p-4 pb-3 overflow-y-auto text-sm gap-1 flex flex-col"
          aria-labelledby="dropdownSearchButton"
        >
          {uniqueYears.map((year) => (
            <CheckboxField
                  key={year}
                  id={`year-filter-${year}`}
                  checked={selectedYears.includes(year)}
                  onChange={() => handleCheckboxChange({ target: { value: year.toString(), checked: !selectedYears.includes(year) } } as React.ChangeEvent<HTMLInputElement>)}
                  label={<div className="text-base ml-1">{year.toString()}</div>}
                />
          ))}
        </ul>
        <hr className="border-t mx-4 border-grey-400" />
        <button className="p-2 border-0 hover:text-grey-600" onClick={() => handleReset()}>
          Reset
        </button>
      </div>
    </div>
  );
});

export default DateFilter;
