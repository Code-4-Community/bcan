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
  const [failure, setFailure] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
      navigate("/grant-info");
    } else {
      setFailure(true);
    }
  };

  return (
    <div className="bg-white grid grid-cols-[60%_40%] w-screen h-screen relative m-0 p-0 overflow-hidden flex justify-center items-start text-start">
      {/*/ Left side: Registration form */}
      <div className="h-full py-20 px-24 flex flex-col justify-center items-start">
        <div className="mb-12">
          <h1 className="text-[32px] pb-4">Welcome back!</h1>
          <h2 className="text-lg">
            Enter your credentials to access your account.
          </h2>
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
                  placeholder="Enter your email"
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-medium-gray"
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block min-w-0 rounded-md grow bg-white py-1.5 pr-3 pl-4 text-base placeholder:text-gray-500 border border-medium-gray"
                />
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
      <div className="h-full flex flex-col justify-center items-center">
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
