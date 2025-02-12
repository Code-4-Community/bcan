import GrantItem from "./GrantItem"
import "./styles/GrantList.css"
import {useEffect} from "react"
import { fetchAllGrants} from "../../external/bcanSatchel/actions.ts";
import { Grant } from "../../external/bcanSatchel/store.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { observer } from 'mobx-react-lite';

import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
  PaginationPageText,
} from "./Pagination"

import { usePaginationContext } from "@chakra-ui/react"


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
  } catch (error) {
    console.error("Error fetching grants:", error);
  }
}
const ITEMS_PER_PAGE = 3

interface GrantListViewProps {
  ALL_GRANTS: Grant[];
}
// Read the current page from our custom pagination context
// and figure out which items to display.
const GrantListView: React.FC<GrantListViewProps> = ({ALL_GRANTS}) => {
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

const GrantList: React.FC = observer(() => {

  // fetch grant immedietely upon loading the page
  useEffect(() => {
    fetchGrants();
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
        <GrantListView ALL_GRANTS={ALL_GRANTS} />
      </PaginationRoot>
    </div>
  )
});

export default GrantList
