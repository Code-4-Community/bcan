import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useAuthContext } from "./context/auth/authContext";
import { updateUserProfile } from "./external/bcanSatchel/actions";

/**
 * (1) Profile component that handles user profile display and updates
 */
const Profile = observer(() => {
  const { user } = useAuthContext();
  const [email, setEmail] = useState(user?.email || "");
  const [biography, setBiography] = useState(user?.biography || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken ?? ""}`,
        },
        body: JSON.stringify({ email, biography }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update profile.");
        return;
      }

      const data = await response.json();
      updateUserProfile(data);
      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <h2 style={styles.heading}>Profile</h2>

      {/* Username (read-only) */}
      <div style={styles.field}>
        <label style={styles.label}>Username:</label>
        <span style={styles.readonlyValue}>{user?.userId}</span>
      </div>

      {/* Email */}
      <div style={styles.field}>
        <label style={styles.label}>Email:</label>
        <input
          type="email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Biography */}
      <div style={styles.field}>
        <label style={styles.label}>Biography:</label>
        <textarea
          style={styles.textarea}
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />
      </div>

      {/* Save Changes button */}
      <button type="submit" style={styles.button}>
        Save Changes
      </button>
    </form>
  );
});

export default Profile;

// Style objects
const styles: { [key: string]: React.CSSProperties } = {
  formContainer: {
    width: "500px",
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    margin: "0 auto", // center within the parent
  },
  heading: {
    marginBottom: "1.5rem",
    fontSize: "2rem",
    fontWeight: 500,
    textAlign: "center",
  },
  field: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "1.2rem",
    fontWeight: 500,
  },
  readonlyValue: {
    marginLeft: "0.5rem",
    fontSize: "1.2rem",
  },
  input: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.2rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    color: "lightgray",
  },
  textarea: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.2rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    minHeight: "120px",
    color: 'lightgray',
  },
  button: {
    padding: "1rem",
    fontSize: "1.1rem",
    backgroundColor: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    alignSelf: "flex-start", // keep button left-aligned
  },
};
