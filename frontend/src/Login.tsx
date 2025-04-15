import React, { useState } from "react";
import { useAuthContext } from "./context/auth/authContext";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import "./external/bcanSatchel/mutators";
import Footer from "./grant-info/components/Footer";

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
    try {
      await login(username, password);
      navigate("/account");
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Blurred background layer */}
      <div style={styles.backgroundLayer} />

      {/* Foreground content (not blurred) */}
      <div style={styles.foregroundContent}>
        {/* Logo area */}
        <div style={styles.logoContainer}>
          <div style={styles.logoSquare}></div>
          <div style={styles.logoText}>
            Boston Climate Action Network x Code4Community
          </div>
        </div>

        {/* Single form container with both Sign In and Register */}
        <form onSubmit={handleSubmit} style={styles.formContainer}>
          <h2 style={styles.heading}>Sign In</h2>

          {/* UserID field */}
          <label htmlFor="username" style={styles.label}>
            User Id
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
            <button type="submit" style={{ ...styles.button, ...styles.helloButton }}>
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
  logoContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
  },
  logoSquare: {
    width: "28px",
    height: "28px",
    backgroundColor: "#f25022",
    marginRight: "10px",
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
    textAlign: "center",
  },
  label: {
    marginBottom: "0.75rem",
    fontSize: "1.2rem",
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
    marginBottom: 0,
    padding: "1.2rem",
    fontSize: "1.2rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  helloButton: {
    backgroundColor: "#00a2ed",
    border: "1px solid #ccc",
  },
};
