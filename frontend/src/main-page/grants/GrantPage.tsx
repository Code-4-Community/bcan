import GrantSearch from "./filter-bar/GrantSearch.tsx";
import { useEffect, useState } from "react";
import FilterBar from "./filter-bar/FilterBar.tsx";
import GrantItem from "./grant-view/GrantView.tsx";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import {
  amountRangeFilter,
  dateRangeFilter,
  eligibleFilter,
  filterGrants,
  searchFilter,
  statusFilter,
  userEmailFilter,
  yearFilterer,
} from "./filter-bar/grantFilters.ts";
import GrantCard from "./grant-view/components/GrantCard.tsx";
import Button from "../../components/Button.tsx";
import EditGrant from "./edit-grant/EditGrant.tsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { clearAllFilters } from "../../external/bcanSatchel/actions.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";

function GrantPage() {
  const [showEditGrant, setShowEditGrant] = useState(false);

  // Use ProcessGrantData reactively to get filtered grants
  const { grants } = ProcessGrantData();
  const [curId, setCurId] = useState<number | null>(null);

  const curGrant =
  grants.find((g) => g.grantId === curId) ??
  grants[0] ??
  null;

  const mainContainer = document.getElementsByClassName('grant-container');

  useEffect(() => {
    clearAllFilters();
    mainContainer[0].scrollTo(0, 0);
  }, [curGrant]);

  const handleGrantCreated = (grantId: number) => {
    setCurId(grantId);

    const {
      allGrants,
      filterStatus,
      startDateFilter,
      endDateFilter,
      yearFilter,
      searchQuery,
      emailFilter,
      eligibleOnly,
      amountMinFilter,
      amountMaxFilter,
      user,
    } = getAppStore();

    const createdGrant = allGrants.find((grant) => grant.grantId === grantId);

    if (createdGrant) {
      const grantIsVisible =
        filterGrants([createdGrant], [
          statusFilter(filterStatus),
          eligibleFilter(eligibleOnly),
          dateRangeFilter(startDateFilter, endDateFilter),
          amountRangeFilter(amountMinFilter, amountMaxFilter),
          yearFilterer(yearFilter),
          searchFilter(searchQuery),
          userEmailFilter(emailFilter, user),
        ]).length > 0;

      if (!grantIsVisible) {
        clearAllFilters();
      }
    }
  };

  // Preserve current selection when still visible; otherwise show the first visible grant.
  useEffect(() => {
    if (grants.length === 0) {
      setCurId(null);
      return;
    }

    const currentSelectionStillVisible = grants.some((grant) => grant.grantId === curId);
    if (!currentSelectionStillVisible) {
      setCurId(grants[0].grantId);
    }
  }, [curId, grants]);

  return (
    <div className="grant-page w-full items-end flex flex-col h-[86vh]">
      <GrantSearch />
      <div className="flex w-full py-2 place-items-start gap-4">
        <div className="text-lg w-fit font-semibold">
            <FilterBar />
          </div>
        <Button
          text="Add"
          logo={faPlus}
          logoPosition="left"
          className="bg-primary-900 text-white rounded-full border-2 border-solid ml-auto text-sm lg:text-base"
          onClick={() => setShowEditGrant(true)}
        />
      </div>

      {curGrant ? (<div className="flex w-full gap-2 flex-1 overflow-hidden justify-between mt-4">
        <div className="flex flex-col w-[33%] overflow-y-auto mr-2 pr-1">
          {grants.map((grant) => (
            <GrantCard
              key={grant.grantId}
              grant={grant}
              isSelected={curGrant?.grantId === grant.grantId}
              onClick={() => setCurId(grant.grantId)}
            />
          ))}
        </div>
        <div className="grant-container flex-1 overflow-y-auto rounded-md">
          <GrantItem grant={curGrant} />
        </div>
      </div>) : (<div className="flex w-full h-full justify-center mt-24 text-gray-500 text-2xl">
              No grants found.
            </div>)}
      <div className="hidden-features">
        {showEditGrant && (
          <EditGrant
            grantToEdit={null}
            onGrantCreated={handleGrantCreated}
            onClose={async () => {
              setShowEditGrant(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default observer(GrantPage);
