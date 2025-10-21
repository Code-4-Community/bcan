import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import logo from "./images/bcan_logo.svg";
import { useAuthContext } from "./context/auth/authContext";

/**
 * Register a new BCAN user
 */
const Register = observer(() => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { register } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(username, password, email);
    if (success) {
      navigate("/login");
    } else {
      console.warn("Registration failed");
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
            width: "200px",
            height: "200px",
            marginRight: "16px",
        }} src={logo} alt="BCAN Logo" />
       <h1 style={styles.appName}>Grant Portal</h1>
      </div>

        {/* Form container with partial transparency */}
        <form onSubmit={handleSubmit} style={styles.formContainer}>
          <h2 style={styles.heading}>Register</h2>

          {/* "Go Back to Sign In" button */}
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/login")}
          >
            ← Back to Sign In
          </button>
          

          {/* Username field */}
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
            placeholder="Create a username"
          />

          {/* Email field */}
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your email address"
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
            placeholder="Create a password"
          />

          {/* Register button */}
          <button type="submit" style={{ ...styles.button, ...styles.helloButton }}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
});

export default Register;

// -- Inline style objects (mirroring Login.tsx) --
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
    filter: "blur(7px)", // blur only the background
  },
  foregroundContent: {
    position: "relative",
    zIndex: 1, // on top of the background layer
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
    marginBottom: "2rem",
    width: "50%",
    wordSpacing: "4px",
    flexDirection: "row",
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
    // Partially transparent background
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#000", // ensure text is dark enough to stand out
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "1.2rem",
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
  backButton: {
    background: "none",
    border: "none",
    color: "#0b303b",
    cursor: "pointer",
    fontSize: "1.1rem",
    marginBottom: "2rem",
    alignSelf: "flex-start",
    padding: 0,
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
  button: {
    marginBottom: "1.2rem",
    padding: "0.6rem",
    fontSize: "1.2rem",
    cursor: "pointer",
    border: "2px solid",
    borderRadius: "24px",
  },
  helloButton: {
    backgroundColor: "#0b303b",
    border: "1px solid #ccc",
    color: "#fff",
  },
};
