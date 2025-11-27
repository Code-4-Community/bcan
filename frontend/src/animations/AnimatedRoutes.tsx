import { Routes, Route, useLocation, Navigate } from "react-router-dom";
// import { TransitionGroup, CSSTransition } from "react-transition-group";

// static transitions sheet
import "./transitions.css";

import { observer } from "mobx-react-lite";
import Account from "../Account";
import { useAuthContext } from "../context/auth/authContext";
import MainPage from "../main-page/MainPage";
import Login from "../Login";
import Register from "../Register";
import RegisterLanding from "../RegisterLanding";

/**
 * AnimatedRoutes:
 * - Wraps routes with CSSTransition + TransitionGroup
 * - Applies .fade-enter / .fade-exit transitions from transitions.css
 */
const AnimatedRoutes = observer(() => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes location={location}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/account" /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/account" /> : <Register />
            }
          /> 
          <Route
            path="/registered"
            element={
             <RegisterLanding />
            }
          /> 
          <Route
            path="/account"
            element={isAuthenticated ? <Account /> : <Navigate to="/login" />}
          />
          <Route path="/main/*" element={<MainPage/>} />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/account" : "/login"} />
            }
          />
        </Routes>
  );
});

export default AnimatedRoutes;