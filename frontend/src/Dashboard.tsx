// src/Dashboard.tsx

import { observer } from 'mobx-react-lite';
import { getStore } from './external/bcanSatchel/store';
import { logout } from './external/bcanSatchel/actions';
import Profile from './Profile';

const Dashboard = observer(() => {
  const store = getStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: '20px'}}>
      <button onClick={handleLogout} style={{ 
        padding: '10px', 
        fontSize: '16px',}}>
        Logout
      </button>
      <h1>Welcome, {store.user?.userId}</h1>
      
      <Profile />
    </div>
  );
});

export default Dashboard;