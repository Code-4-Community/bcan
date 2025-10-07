import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Status,
  statusToString,
} from "../../../../../middle-layer/types/Status.ts";
import {
  fetchAllGrants,
  updateFilter,
} from "../../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./processGrantData.ts";
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
  const { grants } = ProcessGrantData();
  function categoryClicked(
    e: React.MouseEvent,
    category: string,
    linkTo?: string
  ) {
    if (!linkTo) {
      e.preventDefault();
      updateFilter(statusToString(category));
      setSelected(category);
    }
  }

  return (
    <div className="sortbar flex flex-col gap-4 bg-light-gray p-6 rounded-[1.2rem] border">
      <div>
        <div className="flex pb-2">{"Filter by Date"}</div>
        <CalendarDropdown />
      </div>
      <div>
        <div className="flex pb-2">{"Filter by Status"}</div>
        <ul className="flex flex-col gap-2">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                to={item.linkTo ? item.linkTo : "#"}
              >
                <div
                  className={`grant-button border hover:bg-medium-orange ${
                    selected === item.name ? "bg-dark-orange" : "bg-white"
                  }`}
                >
                  <div
                    className="flex w-full justify-between items-center"
                    style={{
                      color: selected === item.name ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {item.name}
                    <FaChevronRight />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default FilterBar;
