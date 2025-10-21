import "../styles/GrantList.css";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import GrantItem from "./GrantItem.tsx";
import GrantLabels from "./GrantLabels.tsx";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { ProcessGrantData } from "../filter-bar/processGrantData.ts";
import NewGrantModal from "../new-grant/NewGrantModal.tsx";

const ITEMS_PER_PAGE = 6;

interface GrantListProps {
  selectedGrantId?: number;
  onClearSelectedGrant?: () => void;
}

const GrantList: React.FC<GrantListProps> = observer(
  ({ selectedGrantId, onClearSelectedGrant }) => {
    const { grants, onSort } = ProcessGrantData();
    const [currentPage, setPage] = useState(1);
    const [showNewGrantModal, setShowNewGrantModal] = useState(false);

    useEffect(() => {
      if (selectedGrantId !== undefined && grants.length > 0) {
        const index = grants.findIndex(
          (grant) => grant.grantId === Number(selectedGrantId)
        );
        if (index !== -1) {
          const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
          if (targetPage !== currentPage) {
            setPage(targetPage);
          }
        }
      }
    }, [selectedGrantId, grants, currentPage]);

    const count = grants.length;
    const startRange = (currentPage - 1) * ITEMS_PER_PAGE;
    const endRange = startRange + ITEMS_PER_PAGE;
    const visibleItems = grants.slice(startRange, endRange);

    return (
      <div className="paginated-grant-list">
        <div className="bg-light-orange rounded-[1.2rem] pt-2">
          <GrantLabels onSort={onSort} />
          <div className="grant-list p-4">
            {visibleItems.map((grant) => (
              <GrantItem
                key={grant.grantId}
                grant={grant}
                defaultExpanded={grant.grantId === Number(selectedGrantId)}
              />
            ))}
          </div>
        </div>
        <Pagination.Root
          className="pt-4"
          count={count}
          pageSize={ITEMS_PER_PAGE}
          page={currentPage}
          onClick={() => {
            if (onClearSelectedGrant) {
              onClearSelectedGrant();
            }
          }}
          onPageChange={(e) => {
            setPage(e.page);
          }}
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
                      className={
                        currentPage === page.value
                          ? "text-dark-blue underline"
                          : "ghost"
                      }
                      onClick={() => setPage(page.value)}
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
        {showNewGrantModal && (
          <NewGrantModal onClose={() => setShowNewGrantModal(false)} />
        )}
      </div>
    );
  }
);

export default GrantList;
