import './App.css';
// Components
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import GrantPage from "./grant-info/components/GrantPage.tsx";
// Libraries
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
// Register store and mutators
import './external/bcanSatchel/mutators';
import { useAuthContext } from './context/auth/authContext';


const App = observer(() => {
  const { isAuthenticated } = useAuthContext()

  return (
    <Router>
      <ChakraProvider value={defaultSystem}>
      < div className="app-container">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
          <Route
              path='/grant-info'
              element={<GrantPage/>}
          />
          <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
      </div>
      </ChakraProvider>
    </Router>
  );
});

export default App;