import { useState, useEffect } from "react";
import { updateYearFilter } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";

const DateFilter: React.FC = observer(() => {
  const { allGrants, yearFilter } = getAppStore();

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
    (yearFilter && yearFilter.length) === 0
      ? setSelectedYears(uniqueYears)
      : setSelectedYears(yearFilter ?? uniqueYears);
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

    setSelectedYears(updatedYears);
    updateYearFilter(updatedYears);
  };

  return (
    <div className="flex flex-col space-y-2 m-4">
      {uniqueYears.map((year) => (
        <div className="flex items-center me-4">
          <input
            type="checkbox"
            id={year.toString()}
            value={year}
            checked={selectedYears.includes(year)}
            onChange={handleCheckboxChange}
            defaultChecked={true}
          />
          <label
            htmlFor={year.toString()}
            key={year}
            className="ms-2 text-sm font-medium"
          >
            {year}
          </label>
        </div>
      ))}
    </div>
  );
});

export default DateFilter;
