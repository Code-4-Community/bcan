import "../styles/GrantList.css";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import GrantItem from "../GrantItem";
import GrantLabels from "../GrantLabels";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { ProcessGrantData } from "./processGrantData.ts";
import CalendarDropdown from "./CalendarDropdown.tsx";

const ITEMS_PER_PAGE = 5;


// displays main grant list
const GrantList: React.FC = observer(() => {
    const { grants, onSort } = ProcessGrantData();

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
            <div style={{display: "flex", justifyContent: "flex-start"}}>
                <CalendarDropdown/>
            </div>
            <div className="bg-light-orange rounded-[1.2rem] pt-2">
            <GrantLabels onSort={onSort} />
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