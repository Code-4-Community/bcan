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
      <div className="w-1/2 h-full py-20 px-24 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-[2.75rem] font-bold mb-0 text-left">Log in</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-xl font-semibold mb-2 text-left">
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
                  className="w-full rounded-xl border border-gray bg-white py-3 px-4 text-base placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-dark-orange focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-xl font-semibold mb-2 text-left">
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
                  className="w-full rounded-xl border border-gray bg-white py-3 px-4 pr-12 text-base placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-dark-orange focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black transition colors"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center cursor pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-medium-gray text-dark-orange focus:ring-dark-orange focus:ring-2 cursor-pointer"
              />
              <span className="ml-2 text-base">Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-base text-black hover:text-dark-orange transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error Message */}
          <div className="">
            {failure && (
              <div className="mb-6 text-[#D33221] bg-[#FFA399] rounded-xl py-3 px-4 text-center">
                Your password is incorrect or this account doesn't exist.
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-dark-orange hover:bg-[#d95a1f] text-white rounded-full py-3 px-4 text-base font-medium transition-colors"
          >
            Log In
          </button>

          <div className="mt-8 text-center text-base">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-dark-blue hover:underline font-medium"
            >
              Sign up here
            </button>
          </div>
        </form>
      </div>

      {/*/ Right side: logo */}
      <div className="w-1/2 h-full bg-white flex items-center justify-center p-8">
        <div className="w-full h-full  bg-dark-orange rounded-[3rem] flex items-center justify-center">
          <img
            className="w-3/5 h-3/5 object-contain"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
      </div>
    </div>
  );
});

export default Login;
