import React, { useEffect, useRef, useState } from "react";
import {
  updateAmountRange,
  updateEligibleOnly,
  updateEndDateFilter,
  updateFilter,
  updateSort,
  updateStartDateFilter,
  updateUserEmailFilter,
} from "../../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../../external/bcanSatchel/store.ts";
import StatusDropdown from "./StatusDropdown";
import Button from "../../../components/Button";
import { faChevronDown, faChevronUp, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import FilterCard from "./components/FilterCard";
import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { Status } from "../../../../../middle-layer/types/Status.ts";

/**
 * FilterBar provides filtering and sorting controls for grants.
 */
const FilterBar: React.FC = observer(() => {
  const {
    emailFilter,
    eligibleOnly,
    sort,
    startDateFilter,
    endDateFilter,
    amountMinFilter,
    amountMaxFilter,
  } = getAppStore();

  const [showDueDateCard, setShowDueDateCard] = useState(false);
  const [showAmountCard, setShowAmountCard] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const dueDateDropdownRef = useRef<HTMLDivElement | null>(null);
  const amountDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedDueDate = dueDateDropdownRef.current?.contains(target);
      const clickedAmount = amountDropdownRef.current?.contains(target);
      const clickedStatus = statusDropdownRef.current?.contains(target);

      if (!clickedDueDate && !clickedAmount && !clickedStatus) {
        setShowDueDateCard(false);
        setShowAmountCard(false);
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const toInputDate = (value: Date | null) => {
    if (!value) return "";
    const d = new Date(value);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Toggle "my grants" filter in store.
  const handleMyGrantsClick = () => {
    updateUserEmailFilter(!emailFilter);
  };

  // Toggle "eligible only" filter in store.
  const handleEligibleClick = () => {
    updateEligibleOnly(!eligibleOnly);
  };

  const handleStatusSelect = (status: Status) => {
    const newSelected = selectedStatus === status ? null : status;
    setSelectedStatus(newSelected);
    updateFilter(newSelected);
  };

  const cycleSort = (header: keyof Grant) => {
    if (!sort || sort.header !== header) {
      updateSort({ header, asc: true });
      return;
    }

    if (sort.asc) {
      updateSort({ header, asc: false });
      return;
    }

    updateSort(null);
  };

  const handleAlphabeticalClick = () => {
    cycleSort("organization");
  };

  const handleDueDateDirectionChange = (direction: "increasing" | "decreasing" | null) => {
    if (!direction) {
      if (sort?.header === "application_deadline") updateSort(null);
      return;
    }

    updateSort({
      header: "application_deadline",
      asc: direction === "increasing",
    });
  };

  const handleAmountDirectionChange = (direction: "increasing" | "decreasing" | null) => {
    if (!direction) {
      if (sort?.header === "amount") updateSort(null);
      return;
    }

    updateSort({
      header: "amount",
      asc: direction === "increasing",
    });
  };

  const handleDueDateRangeChange = (startValue: string, endValue: string) => {
    updateStartDateFilter(startValue ? new Date(`${startValue}T00:00:00`) : null);
    updateEndDateFilter(endValue ? new Date(`${endValue}T23:59:59`) : null);
  };

  const handleAmountRangeChange = (startValue: string, endValue: string) => {
    const min = startValue.trim() === "" ? null : Number(startValue);
    const max = endValue.trim() === "" ? null : Number(endValue);
    updateAmountRange(Number.isNaN(min) ? null : min, Number.isNaN(max) ? null : max);
  };

  const handleDueDateClearAll = () => {
    updateStartDateFilter(null);
    updateEndDateFilter(null);
    if (sort?.header === "application_deadline") {
      updateSort(null);
    }
  };

  const handleAmountClearAll = () => {
    updateAmountRange(null, null);
    if (sort?.header === "amount") {
      updateSort(null);
    }
  };

  const dueDateActive = showDueDateCard || sort?.header === "application_deadline" || startDateFilter || endDateFilter;
  const amountActive = showAmountCard || sort?.header === "amount" || amountMinFilter !== null || amountMaxFilter !== null;
  
  // get correct icon for which sorting is currently being applied
  const getSortIcon = (header: keyof Grant) => {
    if (sort?.header !== header) return faSort;
    return sort.asc ? faSortUp : faSortDown;
  };
  
  
  const activeButtonClass =
    "border-2 border-primary-900 text-primary-900 active:!border-primary-900 active:!text-primary-900 focus:!border-primary-900 focus:!text-primary-900 focus:outline-none focus-visible:outline-none";
  const inactiveButtonClass =
    "border-2 border-grey-500 text-grey-600 active:!border-grey-500 active:!text-grey-600 focus:!border-grey-500 focus:!text-grey-600 focus:outline-none focus-visible:outline-none";

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-2 flex-wrap">
        <Button
          text="My Grants"
          onClick={handleMyGrantsClick}
          className={`bg-white text-sm lg:text-base whitespace-nowrap border-b-4 ${
            emailFilter ? activeButtonClass : inactiveButtonClass
          }`}
        />
        <Button
          text="BCAN Eligible"
          onClick={handleEligibleClick}
          className={`bg-white text-sm lg:text-base whitespace-nowrap ${
            eligibleOnly ? activeButtonClass : inactiveButtonClass
          }`}
        />
        <Button
          text="Org Name"
          onClick={handleAlphabeticalClick}
          logo={getSortIcon("organization")}
          logoPosition="left"
          className={`bg-white text-sm lg:text-base whitespace-nowrap ${
            sort?.header === "organization"
              ? activeButtonClass
              : inactiveButtonClass
          }`}
        />
        <div ref={dueDateDropdownRef} className="relative">
          <Button
            text="Due Date"
            onClick={() => {
              setShowAmountCard(false);
              setShowDueDateCard(!showDueDateCard);
              setShowStatusDropdown(false);
            }}
            logo={getSortIcon("application_deadline")}
            logoPosition="left"
            className={`bg-white text-sm lg:text-base whitespace-nowrap ${
              dueDateActive ? activeButtonClass : inactiveButtonClass
            }`}
          />
          {showDueDateCard && (
            <div className="absolute left-0 top-full mt-2 z-50 w-[28vw]">
              <FilterCard
                rangeType="date"
                rangeLabel="Date Range"
                initialDirection={
                  sort?.header === "application_deadline" && sort.asc === false
                    ? "decreasing"
                    : sort?.header === "application_deadline"
                    ? "increasing"
                    : null
                }
                initialStartValue={toInputDate(startDateFilter)}
                initialEndValue={toInputDate(endDateFilter)}
                onDirectionChange={handleDueDateDirectionChange}
                onRangeChange={handleDueDateRangeChange}
                onClearAll={handleDueDateClearAll}
              />
            </div>
          )}
        </div>
        <div ref={amountDropdownRef} className="relative">
          <Button
            text="Grant Amount"
            onClick={() => {
              setShowDueDateCard(false);
              setShowAmountCard(!showAmountCard);
              setShowStatusDropdown(false);
            }}
            logo={getSortIcon("amount")}
            logoPosition="left"
            className={`bg-white text-sm lg:text-base whitespace-nowrap ${
              amountActive ? activeButtonClass : inactiveButtonClass
            }`}
          />
          {showAmountCard && (
            <div className="absolute left-0 top-full mt-2 z-50 w-[28vw]">
              <FilterCard
                rangeType="number"
                rangeLabel="Grant Range"
                initialDirection={
                  sort?.header === "amount" && sort.asc === false
                    ? "decreasing"
                    : sort?.header === "amount"
                    ? "increasing"
                    : null
                }
                initialStartValue={amountMinFilter?.toString() ?? ""}
                initialEndValue={amountMaxFilter?.toString() ?? ""}
                onDirectionChange={handleAmountDirectionChange}
                onRangeChange={handleAmountRangeChange}
                onClearAll={handleAmountClearAll}
              />
            </div>
          )}
        </div>
        <div ref={statusDropdownRef} className="relative">
          <Button
            text="Status"
            onClick={() => {
              setShowDueDateCard(false);
              setShowAmountCard(false);
              setShowStatusDropdown(!showStatusDropdown);
            }}
            logo={showStatusDropdown ? faChevronUp : faChevronDown}
            logoPosition="right"
            className={`bg-white text-sm lg:text-base whitespace-nowrap ${
              showStatusDropdown || selectedStatus ? activeButtonClass : inactiveButtonClass
            }`}
          />
          {showStatusDropdown && (
            <StatusDropdown selected={selectedStatus} onSelect={handleStatusSelect} />
          )}
        </div>
      </div>
    </div>
  );
});

export default FilterBar;
