import "./styles/GrantPage.css";
import GrantList from "./grant-list/index.tsx";

import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import NewGrantModal from "./new-grant/NewGrantModal.tsx";
import { useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import FilterBar from "./filter-bar/FilterBar.tsx";

function GrantPage() {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  return (
    <div className="grant-page px-4">
      <div className="top-half">
      </div>
        <div className="flex justify-end align-middle p-4 gap-4">
          <GrantSearch onGrantSelect={setSelectedGrant} />
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>
      <div className="grid grid-cols-5 gap-8 px-4">
        <div className="col-span-1">
          <FilterBar/>
        </div>
        <div className="bot-half col-span-4">
          <div className="grant-list-container">
            <GrantList
              selectedGrantId={
                selectedGrant ? selectedGrant.grantId : undefined
              }
              onClearSelectedGrant={() => setSelectedGrant(null)}
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
  );
}

export default GrantPage;
