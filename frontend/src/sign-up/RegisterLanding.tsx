import { Link } from "react-router-dom";
import logo from "../images/logo.svg";
import { useAuthContext } from "../context/auth/authContext";
import Button from "../components/Button";

/**
 * Registered user landing page after signing up
 */
const RegisterLanding = () => {
  const {logout} = useAuthContext();
  return (
    <div className="bg-white grid grid-cols-[35%_65%] relative w-screen h-screen m-0 p-0 overflow-hidden text-start">
      <div className="h-full flex flex-col justify-center items-center pb-32">
        <div className="w-full h-[70%] bg-primary-900 rounded-r-4xl flex flex-col justify-center items-center">
          <img
            className="w-[90%] h-[90%] object-contain p-20 ml-10"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
      </div>
      <div className="h-full py-20 px-24 flex flex-col justify-center items-start mb-32">
        <div className="mb-24">
          <h1 className="text-4xl pb-8 font-bold">
            Account registration successful!
          </h1>
          <h2 className="text-lg">
            Thank you for registering. Your account is currently under review by
            our team. You'll receive an email notification once your account has
            been approved. Please try logging in after receiving approval.
          </h2>
          <Link to="/login">
                    <Button
                      text="Back to Login"
                      className="py-2 my-8 px-4 bg-primary-900 text-white border-2"
                      onClick={() => {
                        logout()
                      }}
                    />
                  </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterLanding;