import { Routes, Route, useLocation, Navigate } from "react-router-dom";
// import { TransitionGroup, CSSTransition } from "react-transition-group";

// static transitions sheet
import "./transitions.css";

import { observer } from "mobx-react-lite";
import { useAuthContext } from "../context/auth/authContext";
import MainPage from "../main-page/MainPage";
import Login from "../Login";
import Register from "../Register";
import RegisterLanding from "../RegisterLanding";
import { getAppStore } from "../external/bcanSatchel/store"
import RestrictedPage from "../main-page/restricted/RestrictedPage";

/**
 * AnimatedRoutes:
 * - Wraps routes with CSSTransition + TransitionGroup
 * - Applies .fade-enter / .fade-exit transitions from transitions.css
 */
const AnimatedRoutes = observer(() => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const user = getAppStore().user;

  return (
    <Routes location={location}>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/main/all-grants" /> : <Login />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/main/all-grants" /> : <Register />
        }
      /> 
      <Route
        path="/registered"
        element={<RegisterLanding />}
      />
      <Route path="/restricted" element={<RestrictedPage/>} />
      
      {/* Check user status and render MainPage or redirect */}
      <Route 
        path="/main/*" 
        element={
          user?.position === "Inactive" 
            ? <Navigate to="/restricted" replace /> 
            : <MainPage />
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

export default AnimatedRoutes;