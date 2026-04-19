import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";
import { CostType } from "../../../../../middle-layer/types/CostType";
import { getAppStore } from "../../../external/bcanSatchel/store";
import {
  updateRevenueCategoryFilter,
  updateCostCategoryFilter,
} from "../../../external/bcanSatchel/actions";
import Button from "../../../components/Button";
import CheckboxField from "../../../components/CheckboxField";

type CategoryFilterProps = {
  type: "Revenue" | "Cost";
};

const CategoryFilter: React.FC<CategoryFilterProps> = observer(({ type }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { filterRevenueCategory, filterCostCategory } = getAppStore();
  const selected: RevenueType[] | CostType[] = type === "Revenue" ? filterRevenueCategory : filterCostCategory;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (category: RevenueType | CostType) => {
    if (type === "Revenue") {
      const current = filterRevenueCategory;
      const next = current.includes(category as RevenueType)
        ? current.filter((c) => c !== category)
        : [...current, category as RevenueType];
      updateRevenueCategoryFilter(next);
    } else {
      const current = filterCostCategory;
      const next = current.includes(category as CostType)
        ? current.filter((c) => c !== category)
        : [...current, category as CostType];
      updateCostCategoryFilter(next);
    }
  };

  const handleClearAll = () => {
    if (type === "Revenue") {
      updateRevenueCategoryFilter([]);
    } else {
      updateCostCategoryFilter([]);
    }
  };


  const activeButtonClass =
    "border-2 border-primary-900 text-primary-900 active:!border-primary-900 active:!text-white focus:!border-primary-900 focus:!text-primary-900 focus:outline-none focus-visible:outline-none";
  const inactiveButtonClass =
    "border-2 border-grey-500 text-grey-600 active:!border-primary-900 active:!text-white focus:!border-grey-500 focus:!text-grey-600 focus:outline-none focus-visible:outline-none";

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        text="Categories"
        onClick={() => setOpen(!open)}
        logo={open ? faChevronUp : faChevronDown}
        logoPosition="right"
        className={`bg-white text-sm lg:text-base whitespace-nowrap rounded-sm h-[2.75rem] ${
          open || selected.length > 0 ? activeButtonClass : inactiveButtonClass
        }`}
      />

      {open && (
        <div className="absolute right-0 top-full mt-1.5 pt-4 pb-8 bg-white border border-primary-900 rounded-md pl-4 pr-2 z-50 shadow-lg min-w-[12rem] lg:min-w-[16rem]">
          <div className="flex flex-col gap-2">
            {type === "Revenue"
              ? Object.values(RevenueType).map((cat) => (
                  <CheckboxField
                    key={cat}
                    id={`category-filter-${String(cat)}`}
                    checked={filterRevenueCategory.includes(cat)}
                    onChange={() => handleSelect(cat)}
                    label={
                      <span className="px-3 py-1 rounded-full text-md lg:text-base font-medium text-left text-grey-600">
                        {cat}
                      </span>
                    }
                  />
                ))
              : Object.values(CostType).map((cat) => (
                  <CheckboxField
                    key={cat}
                    id={`category-filter-${String(cat)}`}
                    checked={filterCostCategory.includes(cat)}
                    onChange={() => handleSelect(cat)}
                    label={
                      <span className="px-3 py-1 rounded-full text-md lg:text-base font-medium text-left text-grey-600">
                        {cat}
                      </span>
                    }
                  />
                ))}
            <button 
              onClick={handleClearAll} 
              className="absolute bottom-4 right-4 text-xs font-semibold text-secondary-400 border-0 hover:text-secondary-400 hover:bg-opacity-0 focus:outline-none active:text-secondary">
              {"Clear all"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CategoryFilter;
