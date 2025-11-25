import logo from "../../images/bcan_logo.svg";

function RestrictedPage() {
  return (
    <div className="flex justify-center items-center h-[100vh] text-left">
      <div>
        <h1 className="text-7xl font-bold mb-5">So Sorry!</h1>
        <p className="text-3xl font-bold mb-3">
          You don't have access to this page.
        </p>
        <p className="text-xl mb-9">
          Contact the admin if you think there's a mistake.
        </p>
        <a href="/main">
          <button
            className="py-2 px-4 rounded bg-medium-orange border border-black"
          >
            Go Home
          </button>
        </a>
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
