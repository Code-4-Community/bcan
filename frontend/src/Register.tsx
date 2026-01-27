import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import logo from "./images/bcan_logo.svg";
import { useAuthContext } from "./context/auth/authContext";
import "./styles/index.css";

/**
 * Register a new BCAN user
 */
const Register = observer(() => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRe, setPasswordRe] = useState("");
  const [failure, setFailure] = useState({
    state: false,
    message: "",
    item: "",
  });
  const navigate = useNavigate();

  const { register } = useAuthContext();
  const passswordRegex: RegExp =
    /^(?=.*[!@#$%^&*])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const defaultPasswordMessage: string = `• Passwords must have at least one special character (!@#$%^&*)
• Passwords must have at least one digit character ('0'-'9')
• Passwords must have at least one uppercase letter ('A'-'Z') and one lowercase letter ('a'-'z')
• Passwords must be at least 8 characters long`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Input validation
    if (!emailRegex.test(email)) {
      setFailure({
        state: true,
        message: "Please enter a valid email address.",
        item: "email",
      });
      return;
    }
    if (!passswordRegex.test(password)) {
      setFailure({
        state: true,
        message: defaultPasswordMessage,
        item: "password",
      });
      return;
    }
    const success = await register(username, password, email);
    if (password === passwordRe && success.state) {
      navigate("/registered");
    } else {
      setFailure({
        state: true,
        message: "Registration failed: " + success.message,
        item: "registration",
      });
      console.warn("Registration failed");
    }
  };

  // Handlers for password and password confirmation inputs
  const handlePassword = (e: string) => {
    setPassword(e);
    if (e !== passwordRe && passwordRe !== "") {
      setFailure({
        state: true,
        message: "Passwords do not match.",
        item: "password",
      });
    } else {
      setFailure({ state: false, message: "", item: "" });
    }
  };

  const handlePasswordMatch = (e: string) => {
    setPasswordRe(e);
    if (e !== password) {
      setFailure({
        state: true,
        message: "Passwords do not match.",
        item: "password",
      });
    } else {
      setFailure({ state: false, message: "", item: "" });
    }
  };

  return (
    <div className="bg-white grid grid-cols-2" style={styles.pageContainer}>
      <div className="sm:w-3/4 lg:w-[60%] h-full py-20 px-20 flex flex-col justify-center items-start">
        {/*/ Left side: Registration form */}
        <div className="mb-4">
          <h1 className="text-[32px]">Get Started Now</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="">
              <label htmlFor="username" className="block">
                Username
              </label>
              <div className="flex items-center rounded-md pt-2">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  style={styles.inputContainer}
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-[#D9D9D9]"
                />
              </div>
            </div>
            <div className="">
              <label htmlFor="email" className="block">
                Email address
              </label>
              <div className="flex items-center rounded-md pt-2">
                <input
                  id="email"
                  type="text"
                  name="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={
                    failure.item === "email"
                      ? styles.errorItem
                      : styles.inputContainer
                  }
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-[#D9D9D9]"
                />
              </div>
            </div>
            <div className="">
              <label htmlFor="password" className="block">
                Password
              </label>
              <div className="flex items-center rounded-md pt-2">
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  required
                  onChange={(e) => handlePassword(e.target.value)}
                  placeholder="Enter your password"
                  style={
                    failure.item === "password"
                      ? styles.errorItem
                      : styles.inputContainer
                  }
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-[#D9D9D9]"
                />
              </div>
            </div>
            <div className="">
              <label htmlFor="password-re" className="block">
                Confirm Password
              </label>
              <div className="flex items-center rounded-md pt-2">
                <input
                  id="password-re"
                  type="password"
                  name="password-re"
                  value={passwordRe}
                  onChange={(e) => handlePasswordMatch(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  style={
                    failure.item === "password"
                      ? styles.errorItem
                      : styles.inputContainer
                  }
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-[#D9D9D9]"
                />
              </div>
            </div>
          </div>
          <div className="items-center">
            <div
              style={failure.state ? styles.error : styles.warning}
              className={`min-h-28 mt-4 text-sm rounded-md flex items-center justify-center p-4 whitespace-pre-line text-left`}
            >
              {failure.state ? failure.message : defaultPasswordMessage}
            </div>
          </div>

          <button
            type="submit"
            className="w-full block mt-8 min-w-0 rounded-md grow bg-dark-orange text-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500"
            style={{ ...styles.button, ...styles.helloButton }}
          >
            Register
          </button>
          <div className="flex items-center justify-between gap-4 mt-4">
            <hr className="border-[#757575] w-[45%]" />
            <div className="text-[#757575]">or</div>
            <hr className="border-[#757575] w-[45%]" />
          </div>
          <div className="flex items-center mt-4 justify-center">
            Have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline ml-2 text-dark-blue text-left"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
      {/*/ Right side: logo */}
      <div className="sm:w-1/4 lg:w-[40%] h-full flex flex-col justify-center items-center">
        <div className="w-full h-full  bg-medium-orange rounded-l-4xl flex flex-col justify-center items-center">
          <img
            className="w-[60%] h-[60%] object-contain p-10 mb-40"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
      </div>
    </div>
  );
});

export default Register;

// Inline style objects
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    position: "relative",
    width: "100%",
    height: "100vh",
    margin: 0,
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    textAlign: "start",
  },
  warning: {
    color: "#616161",
    backgroundColor: "#E7E7E7",
  },
  error: {
    color: "#D33221",
    backgroundColor: "#FFA399",
  },
  errorItem: {
    borderColor: "#D33221",
  },
};
