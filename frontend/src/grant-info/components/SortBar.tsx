import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Status,
  statusToString,
} from "../../../../middle-layer/types/Status.ts";
import {
  fetchAllGrants,
  updateFilter,
} from "../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./GrantList/processGrantData.ts";
import CalendarDropdown from "./GrantList/CalendarDropdown.tsx";
import { FaChevronRight } from "react-icons/fa";

interface SortBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
}

const linkList: SortBarProps[] = [
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
const SortBar: React.FC = observer(() => {
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
    <div className="sortbar flex flex-col gap-4 bg-light-orange p-6 rounded-[1.2rem]">
      <div>
        <div className="flex pb-2">{"Filter by Date"}</div>
        <CalendarDropdown />
      </div>
      <div>
        <div className="flex pb-2">{"Filter by Status"}</div>
        <ul className="grant-buttons flex flex-col gap-2">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                style={{
                  color: selected === item.name ? "#3191CF" : "#000000",
                  textDecoration: selected === item.name ? "underline" : "none",
                }}
                to={item.linkTo ? item.linkTo : "#"}
              >
                <div
                  className="grant-button flex justify-between items-center"
                  style={{
                    color: selected === item.name ? "#3191CF" : "#000000",
                    backgroundColor:
                      selected === item.name ? "#F2EBE4" : "#FFFFFF",
                  }}
                >
                  {item.name}
                  {item.name == "All"
                    ? grants.length
                    : grants.filter((grant) => grant.status == item.name)
                        .length}
                  <FaChevronRight />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default SortBar;
