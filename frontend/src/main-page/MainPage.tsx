import { Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import GrantPage from "./grants/GrantPage";
import NavBar from "./navbar/NavBar";
import RestrictedPage from "./restricted/RestrictedPage";
import CashFlowPage from "./cash-flow/CashFlowPage";
import Settings from "./settings/Settings";
import Footer from "../Footer";
import UsersPage from "./users/UsersPage";

import { UserStatus } from "../../../middle-layer/types/UserStatus";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { getAppStore } from "../external/bcanSatchel/store";
import BellButton from "./navbar/Bell";
import { useState } from "react";

interface PositionGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const PositionGuard = observer(
  ({ children, adminOnly = false }: PositionGuardProps) => {
    const { user } = getAppStore();

    // If user hasn't been resolved yet, avoid redirect
    if (user === undefined) {
      return null; // or a loading spinner
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (
      user.position === undefined ||
      user.position === UserStatus.Inactive ||
      (user.position === UserStatus.Employee && adminOnly)
    ) {
      return <Navigate to="/restricted" replace />;
    }

    return <>{children}</>;
  },
);

function MainPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="w-full flex-row flex h-screen overflow-hiden">
      <div>
        <NavBar />
      </div>
      <div className="px-6 lg:px-10 py-8 pt-8 w-full h-screen overflow-y-auto">
        <div className="min-h-screen mb-8">
          <div className="bell-container flex justify-end w-full">
            <BellButton setOpenModal={setOpenModal} openModal={openModal} />
          </div>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PositionGuard adminOnly={false}>
                  <Dashboard />
                </PositionGuard>
              }
            />
            <Route
              path="/all-grants"
              element={
                <PositionGuard adminOnly={false}>
                  <GrantPage showOnlyMyGrants={false} />
                </PositionGuard>
              }
            />
            <Route
              path="/my-grants"
              element={
                <PositionGuard adminOnly={false}>
                  <GrantPage showOnlyMyGrants={true} />
                </PositionGuard>
              }
            />
            <Route
              path="/users"
              element={
                <PositionGuard adminOnly={true}>
                  <UsersPage />
                </PositionGuard>
              }
            />
            <Route path="/restricted" element={<RestrictedPage />} />
            <Route
              path="/cash-flow"
              element={
                <PositionGuard adminOnly={false}>
                  <CashFlowPage />
                </PositionGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <PositionGuard adminOnly={false}>
                  <Settings />
                </PositionGuard>
              }
            />
            <Route
              path="*"
              element={
                <PositionGuard adminOnly={false}>
                  <GrantPage showOnlyMyGrants={false} />
                </PositionGuard>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default MainPage;
