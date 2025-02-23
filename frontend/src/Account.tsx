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
    // Outer container to center everything and cover the viewport
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#121212", // Dark background
        margin: 0,
        padding: 0,
      }}
    >
      {/* Inner container for the account page content */}
      <div
        style={{
          maxWidth: "600px",           // Larger width for visibility
          width: "90%",                // Responsive
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#fff",     // White background for contrast
          color: "#ff5370",            // Pinkish‐red text
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          fontSize: "1.1rem",          // Slightly larger font
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",      // Buttons and text to the right by default
        }}
      >
        <div>
          <Link to="/grant-info" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "10px",
                fontSize: "16px",
                marginRight: "5px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
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
              marginBottom: "10px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <h1 style={{ alignSelf: "flex-start" }}>Welcome, {user?.userId}</h1>

        {/* Include your profile info here */}
        <Profile />
      </div>
    </div>
  );
});

export default Account;
