// src/App.tsx

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import './App.css';

// Register store and mutators
import './external/bcanSatchel/mutators';
import { getStore } from './external/bcanSatchel/store';
import GrantPage from "./grant-info/components/GrantPage.tsx";

const App = observer(() => {
  const store = getStore();

  return (
    <Router>
      < div className="app-container">
      <Routes>
        <Route
          path="/login"
          element={store.isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={store.isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={store.isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
          <Route
              path='/grant-info'
              element={<GrantPage/>}
          />
          <Route
          path="*"
          element={<Navigate to={store.isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
      </div>
    </Router>
  );
});

export default App;