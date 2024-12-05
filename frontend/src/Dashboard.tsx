// src/Dashboard.tsx

import { observer } from 'mobx-react-lite';
import { getStore } from './external/bcanSatchel/store';
import { logout } from './external/bcanSatchel/actions';
import Profile from './Profile';
import './styles/Dashboard.css';

const Dashboard = observer(() => {
  const store = getStore();

  const handleLogout = () => {
    logout();
  };

  return (
      <div className="dashboard-container">
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
        <h1 className="dashboard-heading">Welcome, {store.user?.userId}</h1>
        <Profile/>
      </div>
  );
});

export default Dashboard;

