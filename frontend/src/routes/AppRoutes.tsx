import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { observer } from "mobx-react-lite";
import { useAuthContext } from "../context/auth/authContext";
import MainPage from "../main-page/MainPage";
import Login from "../Login";
import Register from "../Register";
import RegisterLanding from "../RegisterLanding";
import { getAppStore } from "../external/bcanSatchel/store";
import RestrictedPage from "../main-page/restricted/RestrictedPage";
import Footer from "../main-page/Footer";

/**
 * AppRoutes:
 * - Handles routing and route protection based on authentication status.
 */
const AppRoutes = observer(() => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const user = getAppStore().user;

  const FooterLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex flex-col">
        <div className="flex-1 min-h-screen ">{children}</div>
        <Footer />
      </div>
    );
  };

  return (
    <Routes location={location}>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/main/all-grants" />
          ) : (
            <FooterLayout>
              <Login />
            </FooterLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/main/all-grants" />
          ) : (
            <FooterLayout>
              <Register />
            </FooterLayout>
          )
        }
      />
      <Route
        path="/registered"
        element={
          <FooterLayout>
            <RegisterLanding />
          </FooterLayout>
        }
      />
      <Route
        path="/restricted"
        element={
          <FooterLayout>
            <RestrictedPage />
          </FooterLayout>
        }
      />

      {/* Check user status and render MainPage or redirect */}
      <Route
        path="/main/*"
        element={
          user?.position === "Inactive" ? (
            <Navigate to="/restricted" replace />
          ) : (
            <MainPage />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/main/all-grants" : "/login"} />
        }
      />
    </Routes>
  );
});

export default AppRoutes;
