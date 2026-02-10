import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import GrantPage from "./grants/GrantPage";
import Header from "./header/Header";
import Users from "./users/Users";
import RestrictedPage from "./restricted/RestrictedPage";
import CashFlowPage from "./cash-flow/CashFlowPage";

function MainPage() {
  

  return (
    <div className="w-full">
      <Header />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-grants" element={<GrantPage showOnlyMyGrants={false} />} />
        <Route path="/my-grants" element={<GrantPage showOnlyMyGrants={true} />} /> 
        <Route path="/users" element={<Users />} />
        <Route path="/restricted" element={<RestrictedPage />} />
        <Route path="/cash-flow" element={<CashFlowPage />} />
        {/* fallback route */}
        <Route path="*" element={<GrantPage />} />
      </Routes>
    </div>
  );
}

export default MainPage;
