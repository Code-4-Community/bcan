import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import GrantPage from "./grants/GrantPage";
import NavBar from "./navbar/NavBar";
import RestrictedPage from "./restricted/RestrictedPage";
import CashFlowPage from "./cash-flow/CashFlowPage";
import Settings from "./settings/Settings";
import Footer from "../Footer";
import UsersPage from "./users/UsersPage";

function MainPage() {
  return (
    <div className="w-full flex-row flex h-screen overflow-hiden">
      <div>
        <NavBar />
      </div>
      <div className="px-6 lg:px-10 py-8 pt-12 w-full h-screen overflow-y-auto">
        <div className="min-h-screen mb-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/all-grants"
              element={<GrantPage showOnlyMyGrants={false} />}
            />
            <Route
              path="/my-grants"
              element={<GrantPage showOnlyMyGrants={true} />}
            />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/restricted" element={<RestrictedPage />} />
            <Route path="/cash-flow" element={<CashFlowPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<GrantPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default MainPage;
