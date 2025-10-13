import "./styles/GrantPage.css";
import { useAuthContext } from "../../context/auth/authContext";
import AddGrantButton from "./new-grant/AddGrant.tsx";
import GrantSearch from "./filter-bar/GrantSearch.tsx";
import NewGrantModal from "./new-grant/NewGrantModal.tsx";
import { useState } from "react";
import MyGrantList from "./grant-list/MyGrantList.tsx";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import FilterBar from "./filter-bar/FilterBar.tsx";

function MyGrantsPage() {
    const [showNewGrantModal, setShowNewGrantModal] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

    const { user } = useAuthContext();
    const currentUserEmail = user?.email || ""; // safe fallback

    console.log("Current logged-in user:", user);

    return (
        <div className="grant-page px-8">
            <div className="flex justify-end align-middle p-4 gap-4">
                <GrantSearch onGrantSelect={setSelectedGrant} />
                <AddGrantButton onClick={() => setShowNewGrantModal(true)} />
            </div>

        <div className="grid grid-cols-5 gap-8 px-4">
            <div className="col-span-1">
                <FilterBar />
            </div>
            <div className= "col-span-4 grant-list-container">
                <MyGrantList
                    currentUserEmail={currentUserEmail} // passes currentuseremail to filter grants
                    selectedGrantId={selectedGrant ? selectedGrant.grantId : undefined}
                    onClearSelectedGrant={() => setSelectedGrant(null)}
                    />
                </div>
            </div>

        {showNewGrantModal && (
            <NewGrantModal onClose={() => setShowNewGrantModal(false)} />
        )}
        </div>
    );
}

export default MyGrantsPage;