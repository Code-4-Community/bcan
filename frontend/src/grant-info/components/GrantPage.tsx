import "./styles/GrantPage.css";
import Header from "../../Header.js";
import GrantList from "./GrantList/index.tsx";
import Footer from "./Footer.js";
import BellButton from "../../Bell.js";
import "../../Bell.css";
import AddGrantButton from "../../AddGrant.js";
import { useState } from "react";
import NewGrantModal from "./NewGrantModal.js";
import GrantSearch from "../../GrantSearch.js";

function GrantPage() {
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  
  return (
    <div className="grant-page">
      <div className="top-half">
        <Header />
      </div>
      <div className="bell-container">
        <BellButton />
      </div>
      <div className="bot-half">
      <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
      <GrantSearch/>  
        <div className="">
          <GrantList />
        </div>
        <Footer />
      </div>
      {showNewGrantModal && (
        <NewGrantModal onClose={() => setShowNewGrantModal(false)} />
      )}
    </div>
  );
}

export default GrantPage;
