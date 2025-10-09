import { useState, useEffect } from "react";
import { updateYearFilter } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";


const DateFilter: React.FC = observer(() => {
  const { yearFilter } = getAppStore();
// Get initial store values
  //const { yearFilter } = getAppStore();

  // Available years (can be dynamic later)
  const yearList = [2022, 2023, 2024, 2025, 2026];

  // Initialize from store or fallback to []
  const [selectedYears, setSelectedYears] = useState<number[]>(yearList ?? []);

  // Update local + store + parent when a checkbox changes
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = Number(event.target.value);
    const checked = event.target.checked;

    setSelectedYears((prevSelected) => {
      const updated = checked
        ? [...prevSelected, year]
        : prevSelected.filter((y) => y !== year);

      updateYearFilter(updated);  
      setSelectedYears(updated);     
      return updated;
    });
  };

  // Sync local UI with store if it changes elsewhere
  useEffect(() => {
    setSelectedYears(yearFilter ?? []);
  }, [yearFilter]);

  return (
    <div className="flex flex-col space-y-2">
      {yearList.map((year) => (
        <label key={year} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={year}
            checked={selectedYears.includes(year)}
            onChange={handleCheckboxChange}
          />
          <span>{year}</span>
        </label>
      ))}
    </div>
  );
});

export default DateFilter;
