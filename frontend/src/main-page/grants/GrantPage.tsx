import "./styles/GrantPage.css";
import GrantList from "./grant-list/index.tsx";

import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import NewGrantModal from "./new-grant/NewGrantModal.tsx";
import { useEffect, useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import FilterBar from "./filter-bar/FilterBar.tsx";
import { useAuthContext } from "../../context/auth/authContext";
import {
  updateEndDateFilter,
  updateFilter,
  updateStartDateFilter,
  updateYearFilter,
} from "../../external/bcanSatchel/actions.ts";
import { toJS } from "mobx";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";

interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({ showOnlyMyGrants = false }: GrantPageProps) {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  const { user } = useAuthContext(); //gets current logged in user
  const userObj = toJS(user);

  const currentUserEmail = userObj?.email || ""; //safe fallback

  console.log("Current logged-in user:", userObj);
  // reset filters on initial render
  useEffect(() => {
    updateYearFilter([]);
    updateFilter(null);
    updateEndDateFilter(null);
    updateStartDateFilter(null);
  }, []);

  return (
    userObj?.position !== UserStatus.Inactive ? (
      <div className="grant-page px-8">
        <div className="top-half"></div>
        <div className="flex justify-end align-middle p-4 gap-4">
          <GrantSearch />
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>
        <div className="grid grid-cols-5 gap-8 px-4">
          <div className="col-span-1">
            <FilterBar />
          </div>
          <div className="bot-half col-span-4">
            <div className="grant-list-container">
              <GrantList
                selectedGrantId={
                  selectedGrant ? selectedGrant.grantId : undefined
                }
                onClearSelectedGrant={() => setSelectedGrant(null)}
                currentUserEmail={currentUserEmail}
                showOnlyMyGrants={showOnlyMyGrants}
              />
            </div>
          </div>
        </div>
        <div className="hidden-features">
          {showNewGrantModal && (
            <NewGrantModal onClose={() => setShowNewGrantModal(false)} />
          )}
        </div>
      </div>
    ) :
    <Navigate to="restricted" replace />
  );
}

export default GrantPage;
