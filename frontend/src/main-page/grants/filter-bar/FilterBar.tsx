import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Status,
  stringToStatus,
} from "../../../../../middle-layer/types/Status.ts";
import {
  updateFilter,
} from "../../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import CalendarDropdown from "./CalendarDropdown.tsx";
import { FaChevronRight } from "react-icons/fa";

interface FilterBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
}

const linkList: FilterBarProps[] = [
  { name: "All" },
  { name: "Active", filter: Status.Active },
  { name: "Inactive", filter: Status.Inactive },
  { name: "Pending", filter: Status.Pending },
  { name: "Potential", filter: Status.Potential },
  { name: "Rejected", filter: Status.Rejected },
];

/**
 * SortBar provides the sorting options for grants in the side bar
 */
const FilterBar: React.FC = observer(() => {
  const [selected, setSelected] = useState("All Grants");
  function categoryClicked(
    e: React.MouseEvent,
    category: string,
    linkTo?: string
  ) {
    if (!linkTo) {
      e.preventDefault();
      updateFilter(stringToStatus(category));
      setSelected(category);
    }
  }

  return (
  <div className="flex items-center gap-2">
    <button className="flex items-center gap-2 border-2 border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      My Grants
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      BCAN Eligible
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      ⇅ Alphabetical
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      ⇅ Due Date
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      ⇅ Grant Amount
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      Status ∨
    </button>
  </div>
  );
});

export default FilterBar;
