import React, { useState } from "react";
import { useAuthContext } from "../context/auth/authContext";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import "../external/bcanSatchel/mutators";
import Button from "../components/Button";
import { BrandingPanel, InputField, PasswordField } from "../sign-up";

/**
 * Registered users can log in here
 */
const Login = observer(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [failure, setFailure] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(email, password);

    if (success) {
      navigate("/main/all-grants");
    } else {
      setFailure(true);
    }
  };

  return (
    <div className="bg-white w-screen h-screen flex overflow-hidden">
      {/*/ Left side: Registration form */}
      <div className="w-3/4 lg:w-1/2 h-full px-12 lg:px-20 py-14 flex flex-col justify-center">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold flex justify-start">Log in</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="mb-4">
              <div>
                <InputField id="email" label="Email" type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} error={failure} />
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <PasswordField
                            id="password"
                            label="Password"
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={failure}
                          />
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
                className="w-4 h-4 rounded border-grey-400 text-primary-900 focus:ring-primary-900 focus:ring-2 cursor-pointer"
              />
              <span className="ml-2 text-base text-start">Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-base text-start text-black hover:text-primary-900 transition-colors border-0"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error Message */}
          <div className="">
            {failure && (
              <div className="mb-6 bg-red-light text-red rounded-xl py-3 px-4 text-center">
                Your password is incorrect or this account doesn't exist.
              </div>
            )}
          </div>
          <Button
            text="Log in"
            disabled={!email || !password}
            type="submit"
            onClick={() => {}}
            className="w-full block grow bg-primary-900 text-white mt-8 text-base placeholder:text-gray-500"
          />

          <div className="mt-8 text-center font-semibold text-base">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-secondary-500 hover:underline border-none"
            >
              Sign up here
            </button>
          </div>
        </form>
      </div>

      {/*/ Right side: logo */}
      <div className="w-1/4 lg:w-1/2 h-full bg-white flex items-center justify-center p-8">
        <BrandingPanel />
      </div>
    </div>
  );
});

export default Login;
