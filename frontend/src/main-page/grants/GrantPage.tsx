import "./styles/GrantPage.css";
// import GrantList from "./grant-list/GrantList.tsx";

import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import NewGrantModal from "./new-grant/NewGrantModal.tsx";
import { useEffect, useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
//import FilterBar from "./filter-bar/FilterBar.tsx";
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
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import { fetchGrants } from "./filter-bar/processGrantData.ts";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";
import BellButton from "../navbar/Bell.tsx";
import GrantCard from "./grant-list/GrantCard.tsx";

interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({ showOnlyMyGrants = false }: GrantPageProps) {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);
  const [grants, setGrants] = useState<Grant[]>(ProcessGrantData().grants)
  const [selectedGrant, setSelectedGrant] = useState<Grant>(grants[0]);
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
      <div className="grant-page w-full px-8 items-end">
        <div className="bell-container">
          <BellButton setOpenModal={setOpenModal} openModal={openModal} />
        </div>
        <GrantSearch />
        <div className="flex w-full justify-between p-4 gap-4">
          <text className="text-lg font-semibold">
            FILTERS GO HERE
          </text>
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>

        <div className="flex flex-row w-full gap-4 px-4 justify-between">
          <div className="flex flex-col w-[33%] h-auto overflow-y-scroll p-2">
            {grants.map((grant) => (
              <GrantCard
                key={grant.grantId}
                grant={grant}
                isSelected={selectedGrant?.grantId === grant.grantId}
                onClick={() => setSelectedGrant(grant)}
              />
            ))}
          </div>
          <div className="w-[65%]">
            <GrantItem
              grant={selectedGrant}
            />
          </div>
        </div>

        {/* <div className="grid grid-cols-5 gap-8 px-4">
          <div className="col-span-1">
            <FilterBar />
          </div>
          <div className="bot-half col-span-4">
            <div className="grant-list-container">
              <GrantList
                selectedGrantId={
                  selectedGrant ? selectedGrant.grantId : undefined
                }
                currentUserEmail={currentUserEmail}
                showOnlyMyGrants={showOnlyMyGrants}
              />
            </div>
          </div>
        </div> */}
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
