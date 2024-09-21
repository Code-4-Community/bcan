import { useAuthContext } from './authContext';

const Dashboard = () => {
  const { user } = useAuthContext();

  return (
    <div>
      <h1>Welcome, {user}</h1>
    </div>
  );
};

export default Dashboard;