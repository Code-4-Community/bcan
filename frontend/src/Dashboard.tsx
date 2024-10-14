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
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
    <button onClick={handleLogout} style={{ 
      padding: '10px', 
      fontSize: '16px', 
      marginBottom: '10px', // Add space below the button
      backgroundColor: 'black',
      color: 'white'
    }}>
      Logout
    </button>
    
    <h1>Welcome, {store.user?.userId}</h1>
    
    <Profile />
  </div>
  );
});

export default Dashboard;