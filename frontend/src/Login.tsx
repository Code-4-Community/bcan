import React, { useState } from "react";
import { useAuthContext } from "./context/auth/authContext";
import { observer } from "mobx-react-lite";
import logo from "./images/logo.svg";
import { useNavigate } from "react-router-dom";
import "./external/bcanSatchel/mutators";

/**
 * Registered users can log in here
 */
const Login = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failure, setFailure] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
      navigate("/main/all-grants");
    } else {
      setFailure(true);
    }
  };

  return (
    <div className="bg-white w-screen h-screen flex overflow-hidden">
      {/*/ Left side: Registration form */}
      <div className="w-3/5 h-full py-20 px-24 flex flex-col justify-center">
        <div className="mb-12">
          <h1 className="text-[2rem] font-bold mb-0">Log in</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="mb-6">
              <label htmlFor="email" className="block text-base font-medium mb-2">
                Email
              </label>
              <div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={username}
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-medium-gray bg-white py-3 px-4 text-base placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-dark-orange focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-base font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text": "password"}
                  name="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-medium-gray bg-white py-3 px-4 pr-12 text-base placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-dark-orange focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-black transition colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h" fill="none" stroke="currentColor" viewBox=" 0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="h-12 items-center">
            {failure ? (
              <div className="text-[#D33221] mt-4 bg-[#FFA399] h-full rounded-md text-center flex items-center justify-center p-2">
                Your password is incorrect or this account doesn't exist.
              </div>
            ) : (
              <div className="h-fit p-4 mt-4">{"    "}</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full block mt-8 min-w-0 rounded-md grow bg-dark-orange text-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500"
            style={{ ...styles.button, ...styles.helloButton }}
          >
            Login
          </button>
          <div className="flex items-center justify-between gap-4 mt-8">
            <hr className="border-[#757575] w-[45%]" />
            <div className="text-[#757575]">or</div>
            <hr className="border-[#757575] w-[45%]" />
          </div>
          <div className="flex items-center mt-8 justify-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline ml-2 text-dark-blue text-left"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>

      {/*/ Right side: logo */}
      <div className="w-[40%] h-full flex flex-col justify-center items-center">
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
    alignItems: "start",
    textAlign: "start",
  },
};
