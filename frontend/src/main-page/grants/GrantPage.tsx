import "./styles/GrantPage.css";
import GrantList from "./grant-list/GrantList.tsx";

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
  updateSearchQuery,
  updateStartDateFilter,
  updateYearFilter,
} from "../../external/bcanSatchel/actions.ts";
import { toJS } from "mobx";

import { fetchGrants } from "./filter-bar/processGrantData.ts";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";
import BellButton from "../navbar/Bell.tsx";

interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({ showOnlyMyGrants = false }: GrantPageProps) {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [openModal, setOpenModal] = useState(false);

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
    updateSearchQuery("");
  }, []);

  useEffect(() => {
    if (!showNewGrantModal && wasGrantSubmitted) {
      fetchGrants();
      setWasGrantSubmitted(false);
      console.log("Use effect called in GrantPage");
    }
  }, [showNewGrantModal, wasGrantSubmitted]);

  return user ? (
    user?.position !== UserStatus.Inactive ? (
      <div className="grant-page px-8 -mt-14">
        <div className="top-half"></div>
        <div className="flex flex-col px-4 pb-4 gap-2">
          <div className="flex justify-end">
            <BellButton setOpenModal={setOpenModal} openModal={openModal} />
          </div>
          <GrantSearch />
          <div className="flex justify-between items-center">
          <FilterBar />
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>
        </div>
        <div className="grid grid-cols-5 gap-8 px-4">
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
            <NewGrantModal
              grantToEdit={null}
              onClose={async () => {
                setShowNewGrantModal(false);
                setWasGrantSubmitted(true);
              }}
              isOpen={showNewGrantModal}
            />
          )}
        </div>
      </div>
    ) : (
      <Navigate to="restricted" replace />
    )
  ) : (
    <Navigate to="/login" replace />
  );
}

export default GrantPage;
