import "./styles/GrantList.css";
import { useState } from "react";
import { useEffect } from "react";
import { fetchAllGrants } from "../../external/bcanSatchel/actions.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";
import { observer } from "mobx-react-lite";
import GrantItem from "./GrantItem";
import GrantLabels from "./GrantLabels";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

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
const ITEMS_PER_PAGE = 5;

const GrantList: React.FC = observer(() => {
  // Use MobX store for live updates to allGrants
  const { allGrants } = getAppStore(); // Access store directly

  useEffect(() => {
    fetchGrants();
  }, []);

  const [grants, setGrants] = useState<Grant[]>(allGrants);

  useEffect(() => {
    setGrants(allGrants); // Update local state when store data changes
  }, [allGrants]); // Dependency on allGrants to react to changes

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

      // Handle 'application_deadline' field (date sorting)
      if (header === "application_deadline") {
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

  const [currentPage, setPage] = useState(1);

  const count = grants.length;
  const startRange = (currentPage - 1) * ITEMS_PER_PAGE;
  const endRange = startRange + ITEMS_PER_PAGE;

  const visibleItems = grants.slice(startRange, endRange);

  return (
    <div className="paginated-grant-list">
      {/*
        Wrap everything in PaginationRoot:
          - defaultPage can be 1
          - totalPages is calculated
      */}

      <div className="bg-light-orange rounded-[1.2rem] pt-2">
        <GrantLabels onSort={HandleHeaderClick} />
        <div className="grant-list p-4 ">
          {visibleItems.map((grant) => (
            <GrantItem key={grant.grantId} grant={grant} />
          ))}
        </div>
      </div>
      {/* 
           Paging Controls:
            - Prev / Next triggers
            - Individual page items
            - PageText for "X of Y" or "X / Y"
        */}
      <Pagination.Root
      className="pt-4"
        count={count}
        pageSize={ITEMS_PER_PAGE}
        page={currentPage}
        onPageChange={(e) => setPage(e.page)}
      >
        <ButtonGroup variant="ghost" size="md">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <HiChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Context>
          {({ pages }) => 
            pages.map((page, index) =>
              page.type === "page" ? (
                <IconButton
                  key={index}
                  className={currentPage === page.value ? "text-dark-blue underline" : "ghost"} // Conditionally set the variant based on selected page                  onClick={() => setPage(page.value)}  // Set current page on click
                  onClick={() => setPage(page.value)}  // Set current page on click
                  aria-label={`Go to page ${page.value}`}
                >
                  {page.value}
                </IconButton>
              ) : (
                "..."
              )
            )
          }
        </Pagination.Context>

          <Pagination.NextTrigger asChild>
            <IconButton>
              <HiChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </div>
  );
});

export default GrantList;
