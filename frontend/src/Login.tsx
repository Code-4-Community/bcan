import React, { useState } from "react";
import { useAuthContext } from "./context/auth/authContext";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import "./external/bcanSatchel/mutators";

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
      {/* Logo area (top) */}
      <div style={styles.logoContainer}>
        <div style={styles.logoSquare}></div>
        {/* Updated text */}
        <div style={styles.logoText}>Boston Climate Action Network x Code4Community</div>
      </div>

      {/* Form container */}
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <h2 style={styles.heading}>Sign In</h2>

        {/* "Email, phone or Skype" field */}
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

        {/* "Password" field */}
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

        {/* Sign In button */}
        <button type="submit" style={{ ...styles.button, ...styles.helloButton }}>
          Sign In
        </button>
      </form>
    </div>
  );
});

export default Login;

/* Inline style objects */
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
      Below is an example of a multi-stop gradient using greens, blues, pinks, browns.
      We also layer a texture image for a “grainy” look. Adjust colors and stops as needed.
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
    backgroundBlendMode: "overlay", // blends gradient over texture
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem", // increased spacing for visibility
  },
  logoSquare: {
    width: "28px",
    height: "28px",
    backgroundColor: "#f25022", // approximate "red" tile
    marginRight: "10px",
  },
  logoText: {
    fontSize: "1.6rem", // slightly larger text
    fontWeight: "bold",
  },
  formContainer: {
    width: "500px", // widened further for magnification
    padding: "3rem", // more padding for clarity
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    marginBottom: "2rem",
    fontSize: "2.2rem", // larger heading
    fontWeight: 500,
    textAlign: "center",
  },
  label: {
    marginBottom: "0.75rem",
    fontSize: "1.2rem", // larger label text
  },
  input: {
    marginBottom: "1.75rem",
    padding: "1rem",
    fontSize: "1.2rem", // increased font size
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
    color: "lightgray",
  },
  button: {
    marginBottom: "1.2rem",
    padding: "1.2rem",
    fontSize: "1.2rem", // bigger button text
    borderRadius: "4px",
    cursor: "pointer",
  },
  helloButton: {
    backgroundColor: "#f3f3f3",
    border: "1px solid #ccc",
  },
  signInButton: {
    backgroundColor: "#0078d4",
    color: "#fff",
    border: "none",
  },
};