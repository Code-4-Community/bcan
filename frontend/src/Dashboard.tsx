// src/Dashboard.tsx

import { observer } from 'mobx-react-lite';
import { getStore } from './store';
import { logout } from './actions';
import Profile from './Profile';

const Dashboard = observer(() => {
  const store = getStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {store.user?.userId}</h1>
      <button onClick={handleLogout} style={{ padding: '10px', fontSize: '16px' }}>
        Logout
      </button>
      <Profile />
    </div>
  );
});

export default Dashboard;