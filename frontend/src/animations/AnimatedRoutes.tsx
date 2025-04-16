import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";

// static transitions sheet
import "./transitions.css";

import { observer } from "mobx-react-lite";
import Account from "../Account";
import { useAuthContext } from "../context/auth/authContext";
import GrantPage from "../grant-info/components/GrantPage";
import Login from "../Login";
import Register from "../Register";

/**
 * AnimatedRoutes:
 * - Wraps routes with CSSTransition + TransitionGroup
 * - Applies .fade-enter / .fade-exit transitions from transitions.css
 */
const AnimatedRoutes = observer(() => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  return (
    <TransitionGroup component={null}>
      {/* 
        key the transition by location.key 
        so each route triggers an enter/exit animation
      */}
      <CSSTransition key={location.key} timeout={800} classNames="fade">
        {/* 
          Pass `location` to <Routes> to let RTG track route changes 
        */}
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
            path="/account"
            element={isAuthenticated ? <Account /> : <Navigate to="/login" />}
          />
          <Route path="/grant-info" element={<GrantPage />} />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/account" : "/login"} />
            }
          />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
});

export default AnimatedRoutes;