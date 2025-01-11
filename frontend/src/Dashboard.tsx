// src/Dashboard.tsx

import { observer } from 'mobx-react-lite';
import { useAuthContext } from './context/auth/authContext';
import { logoutUser } from './external/bcanSatchel/actions';
import Profile from './Profile';

const Dashboard = observer(() => {
  const { user } = useAuthContext();

  const handleLogout = () => {
    logoutUser();
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
    
    <h1>Welcome, {user?.userId}</h1>
    
    <Profile />
  </div>
  );
});

export default Dashboard;