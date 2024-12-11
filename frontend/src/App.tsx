// src/App.tsx

import { BrowserRouter as Router, Route} from 'react-router-dom';
import { Navigate } from '../node_modules/react-router-dom/dist/index.js';
import { Routes } from '../node_modules/react-router-dom/dist/index.js';
import { observer } from 'mobx-react-lite';
import Login from './Login.js';
import Register from './Register.js';
import Dashboard from './Dashboard.js';
import './App.css';

// Register store and mutators
import './external/bcanSatchel/mutators';
import { getStore } from './external/bcanSatchel/store.js';
import GrantPage from "./grant-info/components/GrantPage.js";

const App = observer(() => {
  const store = getStore();

  return (
    <Router>
      <div className="app-container">
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