import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import { useEffect, useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import GrantItem from "./grant-view/GrantView.tsx";
import { useAuthContext } from "../../context/auth/authContext";
import {
  updateEndDateFilter,
  updateFilter,
  updateSearchQuery,
  updateStartDateFilter,
  updateYearFilter,
} from "../../external/bcanSatchel/actions.ts";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import GrantCard from "./grant-list/GrantCard.tsx";
import Button from "../../components/Button.tsx";
import EditGrant from "./edit-grant/EditGrant.tsx";

// still needed potentially?
interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({}: GrantPageProps) {
  const [showEditGrant, setShowEditGrant] = useState(false);

  // Use ProcessGrantData reactively to get filtered grants
  const { grants } = ProcessGrantData();
  const [curGrant, setCurGrant] = useState<Grant | null>(null);

  // Set the first grant when grants are loaded (only on initial mount)
useEffect(() => {
  if (!grants.length) return;

  const updated = grants.find(g => g.grantId === curGrant?.grantId);
  setCurGrant(updated ?? grants[0]);
}, [grants]);

  const { user } = useAuthContext(); //gets current logged in user
  const userObj = toJS(user);

  // const currentUserEmail = userObj?.email || ""; //safe fallback

  console.log("Current logged-in user:", userObj);
  // reset filters on initial render
  useEffect(() => {
    updateYearFilter([]);
    updateFilter(null);
    updateEndDateFilter(null);
    updateStartDateFilter(null);
    updateSearchQuery("");
  }, []);

  return (
    <div className="grant-page w-full items-end">
      <GrantSearch />
      <div className="flex w-full justify-between py-2 gap-4">
        <Button
          text="Filters Coming Soon"
          onClick={() => {}}
          className="border-2 border-grey-500 bg-white"
        />
        <AddGrantButton onClick={() => setShowEditGrant(true)} />
      </div>

      <div className="flex flex-row w-full gap-2 justify-between mt-4">
        <div className="flex flex-col w-[33%] h-[150vh] overflow-y-scroll pr-2">
          {grants.map((grant) => (
            <GrantCard
              key={grant.grantId}
              grant={grant}
              isSelected={curGrant?.grantId === grant.grantId}
              onClick={() => setCurGrant(grant)}
            />
          ))}
        </div>
        <div className="w-[65%]">
          {curGrant ? (
            <GrantItem grant={curGrant} />
          ) : (
            <div className="flex h-full justify-center mt-24 text-gray-500 text-2xl">
              No grants found.
            </div>
          )}
        </div>
      </div>
      <div className="hidden-features">
        {showEditGrant && (
          <EditGrant
            grantToEdit={null}
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
