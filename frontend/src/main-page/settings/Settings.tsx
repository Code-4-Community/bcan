import { useState } from "react";
import Button from "../../components/Button";
import InfoCard from "./components/InfoCard";
import logo from "../../images/logo.svg";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ChangePasswordModal from "./ChangePasswordModal";

const initialPersonalInfo = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@gmail.com",
};

export default function Settings() {
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editForm, setEditForm] = useState(initialPersonalInfo);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditForm(personalInfo);
    setIsEditingPersonalInfo(true);
  };

  const handleCancelEdit = () => {
    setEditForm(personalInfo);
    setIsEditingPersonalInfo(false);
  };

  const handleSaveEdit = () => {
    setPersonalInfo(editForm);
    setIsEditingPersonalInfo(false);
  };

  return (
    <div className="max-w-5xl ">
      <h1 className="text-3xl lg:text-4xl font-bold mb-8 flex justify-start">Settings</h1>

      <div className="mb-12">
        <div className="flex items-center gap-6">
          <img
            src={logo}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold mb-1 flex justify-start">Profile Picture</h2>
            <div className="flex gap-3">
              <Button
                text="Upload Image"
                onClick={() => alert("add upload functionality")}
                className="bg-primary-900 text-white"
              />
              <Button
                text="Remove"
                onClick={() => alert("remove image")}
                className="bg-white text-black border-2 border-grey-500"
              />
            </div>

            <p className="text-sm text-gray-500">
              We support PNGs, JPEGs, and PDFs under 10 MB
            </p>
          </div>
        </div>
      </div>

      {isEditingPersonalInfo ? (
        <div className="w-full max-w-3xl rounded-lg bg-gray-50 p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex justify-start">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6 text-left mb-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">First Name</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Last Name</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              text="Cancel"
              onClick={handleCancelEdit}
              className="bg-white text-gray-600 border-2 border-grey-500"
            />
            <Button
              text="Save"
              onClick={handleSaveEdit}
              className="bg-primary-900 text-white"
            />
          </div>
        </div>
      ) : (
        <InfoCard
          title="Personal Information"
          action={
            <Button
              text="Edit"
              onClick={handleStartEdit}
              className="bg-white text-black border-2 border-grey-500"
              logo={faPenToSquare}
              logoPosition="right"
            />
          }
          fields={[
            { label: "First Name", value: personalInfo.firstName },
            { label: "Last Name", value: personalInfo.lastName },
            { label: "Email Address", value: personalInfo.email },
          ]}
        />
      )}

      <div className="flex gap-24 items-center mt-12">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex justify-start">Change Password</h2>
          <p className="text-gray-500 text-start">
            Re-enter your current password in order to change your password.
          </p>
        </div>

        <Button
          text="Change Password"
          onClick={() => {
            setChangePasswordError(null);
            setIsChangePasswordModalOpen(true);
          }}
          className="bg-white text-black border-2 border-grey-500"
        />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        error={changePasswordError}
        onSubmit={(values) => {
          // Backend: call API with values.currentPassword and values.newPassword
          void values;
        }}
      />
    </div>
  );
}
