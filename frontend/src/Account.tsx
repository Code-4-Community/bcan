import { observer } from "mobx-react-lite";
import { useAuthContext } from "./context/auth/authContext";
import { logoutUser } from "./external/bcanSatchel/actions";
import Profile from "./Profile";
import { Link } from "react-router-dom";

const Account = observer(() => {
  const { user } = useAuthContext();

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <div>
        <Link style={{ color: "white" }} to="/grant-info">
          <button
            style={{
              padding: "10px",
              fontSize: "16px",
              marginRight: "5px",
              backgroundColor: "black",
              color: "white",
            }}
          >
            Home
          </button>
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginBottom: "10px", // Adds space below the button
            backgroundColor: "black",
            color: "white",
          }}
        >
          Logout
        </button>
      </div>
      <h1>Welcome, {user?.userId}</h1>

      <Profile />
    </div>
  );
});

export default Account;
