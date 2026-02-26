import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/auth/authContext";
import Button from "../../components/Button";
import BrandingPanel from "../../components/BrandingPanel";

function RestrictedPage() {
  const { logout } = useAuthContext();
  return (
    <div className="bg-white grid grid-cols-[75%_25%] lg:grid-cols-[50%_50%] relative w-screen h-screen m-0 p-0 overflow-hidden text-start">
      <div className="h-full  px-24 flex flex-col justify-center items-start ">
        <div className="w-full">
          <h1 className="text-4xl pb-8 font-bold">So Sorry!</h1>
          <h2 className="text-lg">
            You don't have access to this page. Contact the admin if you think
            there's a mistake.
          </h2>
          <Link to="/login">
            <Button
              text="Back to Login"
              className="py-2 my-8 px-4 bg-primary-900 text-white border-2"
              onClick={() => {
                logout();
              }}
            />
          </Link>
        </div>
      </div>
      <div className="h-full flex flex-col justify-center items-center p-8">
        <BrandingPanel />
      </div>
    </div>
  );
}

export default RestrictedPage;
