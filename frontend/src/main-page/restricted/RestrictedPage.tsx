import { Link } from "react-router-dom";
import logo from "../../images/logo.svg";
import { useAuthContext } from "../../context/auth/authContext";

function RestrictedPage() {
  const {logout} = useAuthContext();
  return (
    <div className="flex justify-center gap-20 items-center h-[70vh] text-left">
      <div>
        <h1 className="text-7xl font-bold mb-5">So Sorry!</h1>
        <p className="text-3xl font-bold mb-3">
          You don't have access to this page.
        </p>
        <p className="text-xl mb-9">
          Contact the admin if you think there's a mistake.
        </p>
        <Link to="/login">
          <button
            className="py-2 px-4 rounded w-48 font-semibold grant-button text-black bg-light-orange"
            onClick={() => {
              logout()
            }}
          >
            Back to Login
          </button>
        </Link>
      </div>
      <img
        className="w-[400px] h-[400px] object-contain"
        src={logo}
        alt="BCAN logo"
      />
    </div>
  );
}

export default RestrictedPage;
