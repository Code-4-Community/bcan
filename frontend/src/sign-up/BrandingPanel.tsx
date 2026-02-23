import logo from "../images/logo.svg";

/**
 * Right-hand branding panel with orange background and BostonCAN logo.
 * Uses Tailwind and primary-800 for panel background.
 */
export default function BrandingPanel() {
  return (
    <div className="flex h-full flex-col justify-center items-center rounded-r-3xl bg-primary-800 p-10">
      <img
        className="max-h-[60%] w-auto max-w-[70%] object-contain"
        src={logo}
        alt="BostonCAN"
      />
    </div>
  );
}
