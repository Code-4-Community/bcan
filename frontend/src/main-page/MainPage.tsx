import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import GrantPage from "./grants/GrantPage";
import NavBar from "./navbar/NavBar";
import Users from "./users/Users";
import RestrictedPage from "./restricted/RestrictedPage";
import CashFlowPage from "./cash-flow/CashFlowPage";
import Settings from "./settings/Settings";


function MainPage() {

  return (
    <div className="w-full h-screen flex flex-row">
      <NavBar/>
      <div className="flex-1 overflow-auto">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-grants" element={<GrantPage showOnlyMyGrants={false} />} />
        <Route path="/my-grants" element={<GrantPage showOnlyMyGrants={true} />} /> 
        <Route path="/users" element={<Users />} />
        <Route path="/restricted" element={<RestrictedPage />} />
        <Route path="/cash-flow" element={<CashFlowPage />} />
        <Route path="/settings" element={<Settings />} />
        {/* fallback route */}
        <Route path="*" element={<GrantPage />} />
      </Routes>
      </div>
    </div>
  );
}

export default MainPage;
