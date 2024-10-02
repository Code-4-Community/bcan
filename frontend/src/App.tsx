// src/App.tsx

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import { setAuthentication } from './actions';

// Import mutators to ensure they are registered
import './mutators';
import { getStore } from './store';

const App = observer(() => {
  const store = getStore();
  const vari = 0;

  return (
    <Router>
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
          path="*"
          element={<Navigate to={store.isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </Router>
  );
});

export default App;