import GrantItem from "./GrantItem"
import "./styles/GrantList.css"

// 1) Import all your custom Pagination pieces.
//    Adjust the import path as needed to point to your Chakra-based pagination.
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
  PaginationPageText,
} from "./Pagination"

import { usePaginationContext } from "@chakra-ui/react"

// Just to simulate a bigger list:
const ALL_GRANTS = Array.from({ length: 11 }).map((_, i) => ({
  grantName: `Community Development Grant #${i + 1}`,
  applicationDate: `2024-09-${(i % 30) + 1}`,
  generalStatus: i % 2 === 0 ? "Approved" : "Pending",
  amount: (i + 1) * 1000,
  restrictionStatus: i % 3 === 0 ? "Restricted" : "Unrestricted",
}))

// How many items to show per page
const ITEMS_PER_PAGE = 3

// This sub-component will read the current page from our custom pagination context
// and figure out which items to display.
function GrantListView() {
  const { page } = usePaginationContext()

  // figure out which grants to slice for the current page
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentGrants = ALL_GRANTS.slice(startIndex, endIndex)

  return (
    <div className="grant-list">
      {currentGrants.map((grant, index) => (
        <GrantItem key={index} {...grant} />
      ))}
    </div>
  )
}

const GrantList: React.FC = () => {
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
          Render the paging controls:
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
