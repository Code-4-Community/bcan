import GrantItem from "./GrantItem";
import "./styles/GrantList.css";
import { useState } from "react";
import { GrantItemProps } from "./GrantItem";

import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
  PaginationPageText,
} from "./Pagination";

//import { usePaginationContext } from "@chakra-ui/react";
import GrantLabels from "./GrantLabels";

// simulate a big list:
const ALL_GRANTS = Array.from({ length: 11 }).map((_, i) => ({
  grantName: `Community Development Grant #${i + 1}`,
  applicationDate: new Date(`2024-09-${(i % 30) + 1}`),
  generalStatus: i % 2 === 0 ? "Approved" : "Pending",
  amount: (i + 1) * 1000,
  restrictionStatus: i % 3 === 0 ? "Restricted" : "Unrestricted",
}));

// How many items to show per page
const ITEMS_PER_PAGE = 3;

const GrantList: React.FC = () => {
  // total number of pages
  const totalPages = Math.ceil(ALL_GRANTS.length / ITEMS_PER_PAGE);
  const [grants, setGrants] = useState<GrantItemProps[]>(ALL_GRANTS);

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

  function HandleHeaderClick(header: keyof GrantItemProps, asc: boolean) {
    const newdata = [...grants].sort((a, b) => {
      if (header === "applicationDate") {
        // Sorting dates
        const dateA = a[header].getTime();
        const dateB = b[header].getTime();
        return asc ? dateA - dateB : dateB - dateA;
      }

      // Sorting other fields
      return asc
        ? a[header] > b[header]
          ? 1
          : -1
        : a[header] < b[header]
        ? 1
        : -1;
    });

    setGrants(newdata);
  }

  return (
    <div className="paginated-grant-list">
      {/* 
        Wrap everything in PaginationRoot:
          - defaultPage can be 1
          - totalPages is calculated
      */}
      <PaginationRoot defaultPage={1} count={totalPages}>
        {/* Actual grants for the current page */}
        <GrantLabels onSort={HandleHeaderClick} />
        <div className="grant-list">
          {grants.map((grant, index) => (
            <GrantItem key={index} {...grant} />
          ))}
        </div>
        {/* 
           Paging Controls:
            - Prev / Next triggers
            - Individual page items
            - PageText for "X of Y" or "X / Y"
        */}
        <div className="pagination-controls">
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
          <PaginationPageText format="compact" />
        </div>
      </PaginationRoot>
    </div>
  );
};

export default GrantList;
