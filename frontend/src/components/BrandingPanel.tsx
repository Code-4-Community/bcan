import logo from "../images/logo.svg";

/**
 * Right-hand branding panel with orange background and BostonCAN logo.
 * Uses Tailwind and primary-800 for panel background.
 */
export default function BrandingPanel() {
  return (
    <div className="w-full h-full bg-primary-900 rounded-[1.2rem]  flex items-center justify-center">
          <img
            className="w-1/2 h-1/2 object-contain"
            src={logo}
            alt="BCAN Logo"
          />
        </div>
  );
}
