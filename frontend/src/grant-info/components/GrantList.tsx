import GrantItem from "./GrantItem"
import "./styles/GrantList.css"
import {useEffect, useState} from "react"
import { fetchAllGrants} from "../../external/bcanSatchel/actions.ts";
import { Grant } from "../../external/bcanSatchel/store.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";

import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
  PaginationPageText,
} from "./Pagination"

import { usePaginationContext } from "@chakra-ui/react"



// simulate a big list:
// const ALL_GRANTS = Array.from({ length: 11 }).map((_, i) => ({
//   grantName: `Community Development Grant #${i + 1}`,
//   applicationDate: `2024-09-${(i % 30) + 1}`,
//   generalStatus: i % 2 === 0 ? "Approved" : "Pending",
//   amount: (i + 1) * 1000,
//   restrictionStatus: i % 3 === 0 ? "Restricted" : "Unrestricted",
// }))

// How many items to show per page

const fetchGrants = async () => {
  try {
    const response = await fetch('http://localhost:3001/grant');
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`)
    }
    const updatedGrants: Grant[] = await response.json();
    // satchel store updated
    fetchAllGrants(updatedGrants);
    console.log(updatedGrants);
    console.log("Successfully fetched grants");
  } catch (error) {
    console.error("Error fetching grants:", error);
  }
  // local grant data updated
}
const ITEMS_PER_PAGE = 3
// Read the current page from our custom pagination context
// and figure out which items to display.
function GrantListView() {
  const ALL_GRANTS = getAppStore().allGrants;
  const { page } = usePaginationContext()

  // figure out which grants to slice for the current page
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentGrants = ALL_GRANTS.slice(startIndex, endIndex)

  return (
    <div className="grant-list">
      {currentGrants.map((grant, index) => (
        <GrantItem key={index} grant={grant} />
      ))}
    </div>
  )
}

const GrantList: React.FC = () => {

  // since useEffect only changes what is in the satchel, it doesn't change any props, meaning
  // the component doesn't rerender, so forceRefresh acts as a dummy prop.
  const [,forceRefresh] = useState({})
  useEffect(() => {
    fetchGrants().then(() => forceRefresh({}));
  }, []);

  const ALL_GRANTS = getAppStore().allGrants;

  // total number of pages
  const totalPages = Math.ceil(ALL_GRANTS.length / ITEMS_PER_PAGE)

  return (
    <div className="paginated-grant-list">
      {/* 
        Wrap everything in PaginationRoot:
          - defaultPage can be 1
          - totalPages is calculated
      */}
      <PaginationRoot defaultPage={1} count={totalPages}>
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

        {/* Actual grants for the current page */}
        <GrantListView />
      </PaginationRoot>
    </div>
  )
}

export default GrantList
