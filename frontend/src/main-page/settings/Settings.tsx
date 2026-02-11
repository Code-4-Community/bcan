import Button from "./components/Button";
import InfoCard from "./components/InfoCard";
import logo from "../../images/logo.svg";

export default function Settings() {
  return (
    <div className="px-12 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 flex justify-start">Settings</h1>

      <div className="mb-12">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <img
            src={logo}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />

          {/* Buttons + helper text */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold mb-4 flex justify-start">Profile Picture</h2>
            <div className="flex gap-3">
              
              <Button
                text="Upload Image"
                onClick={() => alert("add upload functionality")}
                className="bg-primary-800 text-white"
              />
              <Button
                text="Remove"
                onClick={() => alert("remove image")}
                className="bg-white text-black border border-gray-300"
              />
            </div>

            <p className="text-sm text-gray-500">
              We support PNGs, JPEGs, and PDFs under 10 MB
            </p>
          </div>
        </div>
      </div>

      <InfoCard
        title="Personal Information"
        fields={[
          { label: "First Name", value: "John" },
          { label: "Last Name", value: "Doe" },
          { label: "Email Address", value: "john.doe@gmail.com" },
        ]}
      />

      <div className="flex justify-between items-center mt-12">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex justify-start">Change Password</h2>
          <p className="text-gray-500">
            Re-enter your current password in order to change your password.
          </p>
        </div>

        <Button
          text="Change Password"
          onClick={() => alert("change password")}
          className="bg-white text-black border border-gray-300"
        />
      </div>
    </div>
  );
}
