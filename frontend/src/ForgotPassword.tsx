import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.svg";

/**
 * Forgot Password page - allows users to request a password reset email
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Add API call to backend when endpoint is ready
    // For now, just show success message
    console.log("Password reset requested for:", email);
    setSubmitted(true);
  };

  return (
    <div className="bg-white w-screen h-screen flex overflow-hidden">
      {/* Left side: Forgot Password form */}
      <div className="w-1/2 h-full py-20 px-24 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-[2.5rem] font-semibold mb-0 text-left">Forgot Password</h1>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full">
            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-lg font-medium mb-2 text-left">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-gray bg-white py-3 px-4 text-base text-black placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-dark-orange focus:border-transparent"
              />
            </div>

            {/* Send Email Button */}
            <button
              type="submit"
              className="w-full bg-medium-orange hover:bg-[#d95a1f] text-white rounded-full py-3 px-4 text-base font-medium transition-colors"
            >
              Send Email
            </button>

            {/* Back to Login Link */}
            <div className="mt-8 text-center text-base">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-dark-blue hover:underline font-medium"
              >
                Log in here
              </button>
            </div>
          </form>
        ) : (
          // Success message after submission
          <div className="w-full">
            <div className="mb-6 bg-light-blue text-dark-blue rounded-xl py-3 px-4 text-center">
              If an account exists with this email, you'll receive password reset instructions.
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-medium-orange hover:bg-[#d95a1f] text-white rounded-full py-3 px-4 text-base font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Right side: Logo */}
      <div className="w-1/2 h-full bg-white flex items-center justify-center p-8">
        <div className="w-full h-full bg-medium-orange rounded-[1.2rem] flex items-center justify-center">
          <img
            src={logo}
            alt="BCAN Logo"
            className="w-1/2 h-1/2 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;