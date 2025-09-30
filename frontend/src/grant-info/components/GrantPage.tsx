import "./styles/GrantPage.css";
import Header from "../../Header.js";
import GrantList from "./GrantList/index.tsx";

import AddGrantButton from "../../AddGrant.tsx";
import GrantSearch from "../../GrantSearch.tsx";
import NewGrantModal from "./NewGrantModal.tsx";
import { useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import SortBar from "./SortBar.tsx";

function GrantPage() {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  return (
    <div className="grant-page px-4">
      <div className="top-half">
        <Header />
      </div>
        <div className="flex justify-end align-middle p-4 gap-4">
          <GrantSearch onGrantSelect={setSelectedGrant} />
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
        </div>
      <div className="grid grid-cols-5 gap-8 px-4">
        <div className="col-span-1">
          <SortBar/>
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
