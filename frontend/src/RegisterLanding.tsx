import { Link } from "react-router-dom";
import logo from "./images/logo.svg";
import { ButtonColorOption } from "./custom/RingButton";
import { useAuthContext } from "./context/auth/authContext";

/**
 * Registered user landing page after signing up
 */
const RegisterLanding = () => {
  const {logout} = useAuthContext();
  return (
    <div className="bg-white grid grid-cols-2 position-relative w-screen h-screen m-0 p-0 overflow-hidden flex justify-center items-start text-start">
      <div className="w-[35%] h-full flex flex-col justify-center items-center pb-32">
        <div className="w-full h-[70%] bg-medium-orange rounded-r-4xl flex flex-col justify-center items-center">
          <img
            className="w-[90%] h-[90%] object-contain p-20 ml-10"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
      </div>
      <div className="w-[65%] h-full py-20 px-24 flex flex-col justify-center items-start mb-32">
        <div className="mb-24">
          <h1 className="text-[40px] pb-8 font-bold">
            Account registration successful!
          </h1>
          <h2 className="text-lg">
            Thank you for registering. Your account is currently under review by
            our team. You'll receive an email notification once your account has
            been approved. Please try logging in after receiving approval.
          </h2>
          <Link to="/login">
                    <button
                      style={{
                        backgroundColor: ButtonColorOption.ORANGE ,
                        color: 'black',
                        borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                      }}
                      className="py-2 px-4 rounded"
                      onClick={() => {
                        logout()
                      }}
                    >
                      Back to Login
                    </button>
                  </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterLanding;
