import React from "react";
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
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        {/* Top row with Home and Logout buttons */}
        <div style={styles.topRow}>
          <Link to="/grant-info" style={{ textDecoration: "none" }}>
            <button style={styles.navButton}>Home</button>
          </Link>
          <button onClick={handleLogout} style={styles.navButton}>
            Logout
          </button>
        </div>

        <h1 style={styles.heading}>Welcome, {user?.userId}</h1>

        {/* Profile section */}
        <Profile />
      </div>
    </div>
  );
});

export default Account;

/* Style objects for a consistent "grainy, multi-color gradient" look. */
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    /* 
      Multi-stop gradient (greens, blues, pinks, browns) + 
      optional grainy texture overlay for the background.
      Replace '/path/to/grain-texture.png' with your actual texture file or remove if not needed.
    */
    background: `
      linear-gradient(
        120deg,
        rgba(159, 189, 165, 0.75) 0%,   /* greenish */
        rgba(143, 170, 189, 0.75) 25%,  /* blueish */
        rgba(240, 165, 193, 0.75) 50%,  /* pinkish */
        rgba(192, 160, 128, 0.75) 75%,  /* brownish */
        rgba(159, 189, 165, 0.75) 100%  /* greenish */
      ),
      url("/path/to/grain-texture.png")
    `,
    backgroundSize: "cover",
    backgroundBlendMode: "overlay",
  },
  contentContainer: {
    width: "100%",
    padding: "3rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // Left-align content by default
  },
  topRow: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end", // Keep buttons on the right
    marginBottom: "1.5rem",
  },
  navButton: {
    padding: "1rem",
    fontSize: "1.1rem",
    marginLeft: "0.5rem",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  heading: {
    margin: 0,
    marginBottom: "1.5rem",
    fontSize: "2rem",
    fontWeight: 500,
  },
};