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
    // Outer container that covers the entire viewport
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#121212",
        margin: 0,
        padding: 0,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",            // Increased width for better visibility
          width: "90%",                 // Ensures responsiveness
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#fff",
          color: "#ff5370",             // Pinkish-red text
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          fontSize: "1.1rem",           // Larger font size
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              margin: "8px 0 20px 0",
              fontSize: "1rem",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              margin: "8px 0 20px 0",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            width: "100%",
            margin: "8px 0",
            backgroundColor: "black",
            color: "white",
            fontSize: "1rem",
          }}
        >
          Login
        </button>
        <button
          type="button"
          style={{
            padding: "12px",
            width: "100%",
            margin: "8px 0",
            backgroundColor: "white",
            color: "black",
            fontSize: "1rem",
          }}
          onClick={() => alert("Forgot Password clicked!")}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
});

export default Login;
