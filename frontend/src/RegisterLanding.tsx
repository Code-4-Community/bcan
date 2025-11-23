import logo from "./images/bcan_logo.svg";

/**
 * Registered users can log in here
 */
const RegisterLanding = () => {
  return (
    <div className="bg-white grid grid-cols-2" style={styles.pageContainer}>
      <div className="w-[35%] h-full flex flex-col justify-center items-center pb-32">
        <div className="w-full h-[70%] bg-medium-orange rounded-r-4xl flex flex-col justify-center items-center">
          <img
            className="w-[90%] h-[90%] object-contain p-10"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
      </div>
      <div className="w-[65%] h-full py-20 px-24 flex flex-col justify-center items-start mb-32">
        <div className="mb-24">
          <h1 className="text-[40px] pb-4 font-bold">
            Account registration successful!
          </h1>
          <h2 className="text-lg">
            Thank you for registering. Your account is currently under review by
            our team. You'll receive an email notification once your account has
            been approved. Please try logging in after receiving approval.
          </h2>
        </div>
      </div>
    </div>
  );
};

export default RegisterLanding;

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
