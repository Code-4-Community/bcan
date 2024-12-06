// src/Dashboard.tsx

import { observer } from 'mobx-react-lite';
import { getStore } from './external/bcanSatchel/store';
import { logout } from './external/bcanSatchel/actions';
import Profile from './Profile';
import './styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = observer(() => {
  const store = getStore();
  const navigate = useNavigate();

  /** Log the user out (all auth dropped) */
  const handleLogout = () => {
    logout();
  };

  /** Enter the grant-info main app */
  const handleEnterApp = () => {
    navigate('/grant-info');
  }

  return (
      <div className="dashboard-container">
        <div className="dashboard-actions">
        <button
         className="dashboard-gotoBCAN"
         onClick={handleEnterApp}
         >
          Turn Page
        </button>
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
        </div>
        <h1 className="dashboard-heading">Welcome, {store.user?.userId}</h1>
        <Profile/>
      </div>
  );
});

export default Dashboard;

