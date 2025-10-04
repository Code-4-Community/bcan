import React, { useState } from "react";
import { useAuthContext } from "./context/auth/authContext";
import { observer } from "mobx-react-lite";
import logo from "./images/bcan_logo.svg";
import { useNavigate } from "react-router-dom";
import "./external/bcanSatchel/mutators";
import "./styles/button.css"


/**
 * Registered users can log in here
 */
const Login = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
      navigate("/grant-info");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Blurred background layer */}
      <div style={styles.backgroundLayer} />

      {/* Foreground content (not blurred) */}
      <div style={styles.foregroundContent}>
        {/* Crest area */}
        <div style={styles.logoContainer}>
          <img className="logo" style={{
            width: "175px",
            height: "175px",
            marginRight: "16px",
          }} src={logo} alt="BCAN Logo" />
          <h1 style={styles.appName}>Grant Portal</h1>
        </div>
        

        {/* Single form container with both Sign In and Register */}
        <form onSubmit={handleSubmit} style={styles.formContainer}>
          <h2 style={styles.heading}>Sign In</h2>

          {/* UserID field */}
          <label htmlFor="username" style={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your username (e.g., bcanuser33)"
          />

          {/* Password field */}
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
          />

          {/* Buttons row: Sign In, vertical separator, and Register */}
          <div style={styles.buttonRow}>
            <button 
            type="submit"
             style={{ ...styles.button, ...styles.helloButton }}
             >
              Sign In
            </button>

            <div style={styles.verticalSeparator}>
              <div style={styles.separatorLine} />
              <div style={styles.separatorOr}>OR</div>
              <div style={styles.separatorLine} />
            </div>

            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{ ...styles.button, ...styles.helloButton }}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Login;

// Inline style objects
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
    linear-gradient(135deg,
     rgb(164, 183, 251) 0%,
      rgb(212, 240, 255) 47%, rgb(111, 147, 237) 96%)
    `,
    backgroundSize: "cover",
    backgroundBlendMode: "overlay",
    filter: "blur(7px)",
  },
  foregroundContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    wordSpacing: "4px",
    flexDirection: "row",
    marginBottom: "2rem",
    width: "50%",
  },
  logoSquare: {
    width: "28px",
    height: "28px",
    backgroundColor: "#f25022",
  },
  logoText: {
    fontSize: "1.6rem",
    fontWeight: "bold",
  },
  formContainer: {
    width: "500px",
    padding: "3rem",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#000",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "2rem",
    fontSize: "2.2rem",
    fontWeight: 500,
    textAlign: "left",
  },
  appName: {
    marginBottom: "0.4rem",
    fontSize: "2.2rem",
    fontWeight: 700,
    textAlign: "left",
    color: "rgba(255, 105, 0, 1)",
  },
  label: {
    marginBottom: "0.75rem",
    fontSize: "1.2rem",
    textAlign: "left",
  },
  input: {
    marginBottom: "1.75rem",
    padding: "1rem",
    fontSize: "1.2rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
    color: "lightgray",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  verticalSeparator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 1rem",
  },
  separatorLine: {
    width: "1px",
    height: "15px",
    backgroundColor: "#ccc",
  },
  separatorOr: {
    margin: "0.25rem 0",
    fontWeight: "bold",
    color: "#555",
  },
  button: {
    marginBottom: "1.2rem",
    padding: "1.2rem",
    fontSize: "1.4rem",
    cursor: "pointer",
    border: "2px solid",
    borderRadius: "24px",
  },
  helloButton: {
    backgroundColor: "#0b303b",
    border: "1px solid #ccc",
    borderWidth: 0,
    borderRadius: "100px",
    color: "#fff",
  },
};
