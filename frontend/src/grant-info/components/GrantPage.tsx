import "./styles/GrantPage.css";
import Header from "../../Header.js";
import GrantList from "./GrantList/index.tsx";
import Footer from "./Footer.js";
import BellButton from "../../Bell.js";
import "../../Bell.css";
import CalendarDropdown from "./GrantList/CalendarDropdown.tsx";
import AddGrantButton from "../../AddGrant.tsx";
import GrantSearch from "../../GrantSearch.tsx";
import NewGrantModal from "./NewGrantModal.tsx";
import { useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";

function GrantPage() {

  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  return (
    <div className="grant-page">
      <div className="top-half">
        <Header />
      </div>
      <div className="bell-container">
        <BellButton />
      </div>
      <div className="action-bar">
          <CalendarDropdown/>
          <GrantSearch onGrantSelect={setSelectedGrant}/>
          <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
      </div>
      <div className="bot-half">
        <div className="grant-list-container">
        <GrantList
         selectedGrantId={selectedGrant ? selectedGrant.grantId : undefined}
         onClearSelectedGrant={() => setSelectedGrant(null)} />
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
