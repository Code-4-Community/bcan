import "./styles/GrantList.css";
import { useState } from "react";
import { useEffect } from "react";
import { fetchAllGrants } from "../../external/bcanSatchel/actions.ts";
import { Grant } from "../../external/bcanSatchel/store.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { observer } from "mobx-react-lite";
import GrantItem from "./GrantItem";

import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
  PaginationPageText,
} from "./Pagination";

//import { usePaginationContext } from "@chakra-ui/react";
import GrantLabels from "./GrantLabels";

// How many items to show per page

const fetchGrants = async () => {
  try {
    const response = await fetch("http://localhost:3001/grant");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedGrants: Grant[] = await response.json();
    // satchel store updated
    fetchAllGrants(updatedGrants);
  } catch (error) {
    console.error("Error fetching grants:", error);
  }
};
const ITEMS_PER_PAGE = 3;

// // Read the current page from our custom pagination context
// // and figure out which items to display.
// const GrantListView: React.FC<GrantListViewProps> = ({ALL_GRANTS}) => {
//   const { page } = usePaginationContext()

//   // figure out which grants to slice for the current page
//   const startIndex = (page - 1) * ITEMS_PER_PAGE
//   const endIndex = startIndex + ITEMS_PER_PAGE
//   const currentGrants = ALL_GRANTS.slice(startIndex, endIndex)

//   return (
//     <div className="grant-list">
//       {currentGrants.map((grant, index) => (
//         <GrantItem key={index} grant={grant} />
//       ))}
//     </div>
//   )
// }

const GrantList: React.FC = observer(() => {
  // Use MobX store for live updates to allGrants
  const { allGrants } = getAppStore(); // Access store directly

  useEffect(() => {
    fetchGrants();
  }, []);

  // Total pages calculated from the store
  const totalPages = Math.ceil(allGrants.length / ITEMS_PER_PAGE);

  const [grants, setGrants] = useState<Grant[]>(allGrants);

  useEffect(() => {
    setGrants(allGrants); // Update local state when store data changes
  }, [allGrants]); // Dependency on allGrants to react to changes

  // // Read the current page from our custom pagination context
  // // and figure out which items to display.
  // function GrantListView() {
  //   const { page } = usePaginationContext();
  //   // figure out which grants to slice for the current page
  //   const startIndex = (page - 1) * ITEMS_PER_PAGE;
  //   const endIndex = startIndex + ITEMS_PER_PAGE;
  //   const currentGrants = grants.slice(startIndex, endIndex);

  //   setGrants(currentGrants);
  // }

  function HandleHeaderClick(header: keyof Grant, asc: boolean) {
    const handleNullOrUndefined = (a: Grant, b: Grant, header: keyof Grant) => {
      if (a[header] === null || a[header] === undefined) return 1;
      if (b[header] === null || b[header] === undefined) return -1;
      return 0;
    };

    const newdata = [...grants].sort((a, b) => {
      // Handle null or undefined values first for all types
      const nullCheck = handleNullOrUndefined(a, b, header);
      if (nullCheck !== 0) return nullCheck;

      // Handle 'deadline' field (date sorting)
      if (header === "deadline") {
        const dateA = new Date(a[header]);
        const dateB = new Date(b[header]);

        // If either of the dates is invalid, push to the bottom
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        // Compare dates
        return asc
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // Handle string sorting
      if (typeof a[header] === "string" && typeof b[header] === "string") {
        return asc
          ? a[header].localeCompare(b[header])
          : b[header].localeCompare(a[header]);
      }

      // Handle number sorting
      if (typeof a[header] === "number" && typeof b[header] === "number") {
        return asc ? a[header] - b[header] : b[header] - a[header];
      }

      // Default case: handle other data types (e.g., booleans, objects)
      return 0;
    });

    setGrants(newdata);
  }

  return (
    <div className="paginated-grant-list max-w-8xl mx-auto">
      {/*
        Wrap everything in PaginationRoot:
          - defaultPage can be 1
          - totalPages is calculated
      */}
      <PaginationRoot defaultPage={1} count={totalPages}>
        {/* Actual grants for the current page */}
        <div className="grant-list p-4">
        <GrantLabels onSort={HandleHeaderClick} />
          {grants.map((grant, index) => (
            <GrantItem key={index} grant={grant} />
          ))}
        </div>

        {/* 
           Paging Controls:
            - Prev / Next triggers
            - Individual page items
            - PageText for "X of Y" or "X / Y"
        */}
        <div className="pagination-controls m-4">
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
          <PaginationPageText format="compact" />
        </div>
      </PaginationRoot>
    </div>
  );
});

export default GrantList;
