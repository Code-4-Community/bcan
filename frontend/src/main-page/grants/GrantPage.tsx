import "./styles/GrantPage.css";
// import GrantList from "./grant-list/GrantList.tsx";

import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import NewGrantModal from "./new-grant/NewGrantModal.tsx";
import { useEffect, useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
// import FilterBar from "./filter-bar/FilterBar.tsx";
import GrantItem from "./grant-view/GrantView.tsx";
import { useAuthContext } from "../../context/auth/authContext";
import {
  updateEndDateFilter,
  updateFilter,
  updateSearchQuery,
  updateStartDateFilter,
  updateYearFilter,
  fetchAllGrants,
} from "../../external/bcanSatchel/actions.ts";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";
import BellButton from "../navbar/Bell.tsx";
import GrantCard from "./grant-list/GrantCard.tsx";
import { api } from "../../api.ts";

// still needed potentially?
interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({}: GrantPageProps) {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);
  
  // Use ProcessGrantData reactively to get filtered grants
  const { grants } = ProcessGrantData();
  const [curGrant, setCurGrant] = useState<Grant | null>(null);

  // Set the first grant when grants are loaded (only on initial mount)
  useEffect(() => {
    if (grants.length > 0 && curGrant === null) {
      setCurGrant(grants[0]);
    }
  }, [grants]);

   // If the NewGrantModal has been closed and a new grant submitted (or existing grant edited),
   // refetch the grants list and update the current grant to reflect any changes
   // SHOULD BE CHANGED TO ALSO ACCOMODATE DELETIONS (CURRENTLY ONLY UPDATES IF GRANT WAS CREATED/EDITED, NOT DELETED)
    useEffect(() => {
      if (!wasGrantSubmitted || !curGrant) return;

      const updateGrant = async () => {
        try {
          const response = await api(`/grant/${curGrant.grantId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const updatedGrant = await response.json();
            setCurGrant(updatedGrant);
            console.log("✅ Grant refreshed:", updatedGrant);
          } else {
            console.error("❌ Failed to fetch updated grant");
          }
        } catch (err) {
          console.error("Error fetching updated grant:", err);
        }
      };

      const updateGrants = async () => {
        try {
          const response = await api("/grant");
          if (!response.ok) {
            throw new Error(`HTTP Error, Status: ${response.status}`);
          }
          const updatedGrants: Grant[] = await response.json();
          fetchAllGrants(updatedGrants);
          console.log("✅ Grants list refreshed");
        } catch (error) {
          console.error("Error fetching grants:", error);
        }
      };

      updateGrants();
      updateGrant();
      setWasGrantSubmitted(false);
    }, [wasGrantSubmitted]);
  
  const [openModal, setOpenModal] = useState(false);

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

  return user ? (
    user?.position !== UserStatus.Inactive ? (
      <div className="grant-page w-full items-end">
        <div className="bell-container">
          <BellButton setOpenModal={setOpenModal} openModal={openModal} />
        </div>
        <GrantSearch />
        <div className="flex w-full justify-between p-4 gap-4">
          <span className="text-lg font-semibold">
            FILTERS GO HERE
          </span>
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
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
              <div className="flex items-center justify-center h-full text-gray-500">
                No grants found.
              </div>
            )}
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
                  curGrant ? curGrant.grantId : undefined
                }
                currentUserEmail={currentUserEmail}
                showOnlyMyGrants={showOnlyMyGrants}
              />
            </div>
          </div>
        </div>  */}
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

export default observer(GrantPage);
