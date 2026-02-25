import React, { useState } from "react";
//import { Link } from "react-router-dom";
import {
  Status,
  stringToStatus,
} from "../../../../../middle-layer/types/Status.ts";
import {
  updateFilter,
} from "../../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
//import CalendarDropdown from "./CalendarDropdown.tsx";
//import { FaChevronRight } from "react-icons/fa";
import StatusDropdown from "./StatusDropdown";
import Button from "../../../components/Button";
import { faSort } from "@fortawesome/free-solid-svg-icons";

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

  const sortButtons = ["Alphabetical", "Due Date", "Grant Amount"];

  return (
  <div className="flex items-center gap-2 flex-wrap">
    <button className="flex items-center gap-2 border-2 border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap shadow-xl">
      My Grants
    </button>
    <button className="flex items-center gap-2 border border-grey-400 rounded-full px-5 py-2 bg-white text-grey-900 text-base whitespace-nowrap">
      BCAN Eligible
    </button>
    {sortButtons.map((name) => (
      <Button
        key={name}
        text={name}
        onClick={() => {}}
        logo={faSort}
        logoPosition="left"
        className="border-grey-400 bg-white text-grey-900 text-base whitespace-nowrap"
      />
    ))}
    <StatusDropdown />
  </div>
  );
});

export default FilterBar;
