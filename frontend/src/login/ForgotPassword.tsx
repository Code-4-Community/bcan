import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandingPanel, InputField } from "../sign-up";
import Button from "../components/Button";

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
      <div className="w-3/4 lg:w-1/2 h-full px-12 lg:px-20 py-14 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold flex justify-start text-left">Forgot Password</h1>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full">
            {/* Email Input */}
            <div className="mb-6">
              <InputField id="email" label="Email" type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* Send Email Button */}
            <Button text="Send email" className="w-full text-white" disabled={!email} type="submit" onClick={() => navigate("/login")} />

            {/* Back to Login Link */}
            <div className="mt-8 text-center text-base">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-secondary-500 hover:underline border-none"
              >
                Log in here
              </button>
            </div>
          </form>
        ) : (
          // Success message after submission
          <div className="w-full">
            <div className="mb-6 bg-secondary-100 text-secondary-900 rounded-xl py-3 px-4 text-center">
              If an account exists with this email, you'll receive password reset instructions.
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-primary-900 hover:bg-primary-800 text-white rounded-full py-3 px-4 text-base font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Right side: Logo */}
      <div className="w-1/4 lg:w-1/2  h-full bg-white flex items-center justify-center p-8">
        <BrandingPanel/>
      </div>
    </div>
  );
};

export default ForgotPassword;