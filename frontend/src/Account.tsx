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
      {/* Blurred background layer */}
      <div style={styles.backgroundLayer} />

      {/* Foreground container */}
      <div style={styles.foregroundContent}>
        <div style={styles.accountContainer}>
          {/* Top row with navigation buttons */}
          <div style={styles.topRow}>
            <Link to="/grant-info" style={{ textDecoration: "none" }}>
              <button style={styles.navButton}>Home</button>
            </Link>
            <button onClick={handleLogout} style={styles.navButton}>
              Logout
            </button>
          </div>

          <h1 style={styles.heading}>Welcome, {user?.userId}</h1>
          <Profile />
        </div>
      </div>
    </div>
  );
});

export default Account;

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    background: `
      linear-gradient(
        120deg,
        rgba(159, 189, 165, 0.75) 0%,
        rgba(143, 170, 189, 0.75) 25%,
        rgba(240, 165, 193, 0.75) 50%,
        rgba(192, 160, 128, 0.75) 75%,
        rgba(159, 189, 165, 0.75) 100%
      ),
      url("../assets/images/boston_snow.jpg")
    `,
    backgroundSize: "cover",
    backgroundBlendMode: "overlay",
    filter: "blur(7px)",
  },
  foregroundContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  accountContainer: {
    width: "100%",
    padding: "3rem",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // partially transparent
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  topRow: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: "1.5rem",
  },
  navButton: {
    marginLeft: "0.5rem",
    padding: "1.2rem",
    fontSize: "1.2rem",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#00a2ed",
    border: "1px solid #ccc",
    color: "#fff",
  },
  heading: {
    marginBottom: "2rem",
    fontSize: "2.2rem",
    fontWeight: 500,
    textAlign: "center",
  },
};
