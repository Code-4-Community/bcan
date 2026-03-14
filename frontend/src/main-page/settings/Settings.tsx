import { useState, useEffect } from "react";
import Button from "../../components/Button";
import InfoCard from "./components/InfoCard";
import logo from "../../images/logo.svg";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ChangePasswordModal from "./ChangePasswordModal";
import { api } from "../../api";
import { getAppStore } from "../../external/bcanSatchel/store";
import { setActiveUsers, updateUserProfile } from "../../external/bcanSatchel/actions";
import { User } from "../../../../middle-layer/types/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Settings() {
  const store = getAppStore();

  const [personalInfo, setPersonalInfo] = useState({
    firstName: store.user?.firstName ?? "",
    lastName: store.user?.lastName ?? "",
    email: store.user?.email ?? "",
  });
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editForm, setEditForm] = useState(personalInfo);
  const [personalInfoError, setPersonalInfoError] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (store.user) {
      const updated = {
        firstName: store.user.firstName,
        lastName: store.user.lastName,
        email: store.user.email,
      };
      setPersonalInfo(updated);
      if (!isEditingPersonalInfo) {
        setEditForm(updated);
      }
    }
  }, [store.user, isEditingPersonalInfo]);

  const handleStartEdit = () => {
    setEditForm(personalInfo);
    setPersonalInfoError(null);
    setIsEditingPersonalInfo(true);
  };

  const handleCancelEdit = () => {
    setEditForm(personalInfo);
    setPersonalInfoError(null);
    setIsEditingPersonalInfo(false);
  };

  const handleSaveEdit = async () => {
    if (!EMAIL_REGEX.test(editForm.email)) {
      setPersonalInfoError("Email is not valid.");
      return;
    }

    try {
      const response = await api("/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          (errorBody && (errorBody.message as string)) ||
          "Failed to update profile. Please try again.";
        setPersonalInfoError(message);
        return;
      }
      const updatedUser = {
        ...store.user!,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      }
      setActiveUsers([
              ...store.activeUsers.filter((u) => u.email !== store.user!.email),
              updatedUser as User,
            ]);
      updateUserProfile({
        ...store.user!,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      });
      setPersonalInfo(editForm);

      setIsEditingPersonalInfo(false);
      setPersonalInfoError(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setPersonalInfoError("An unexpected error occurred. Please try again.");
    }
  };

  const changePasswordHandler = async (values) =>  {
          setChangePasswordError(null);
          try {
            const response = await api("/auth/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              }),
            });

            if (!response.ok) {
              const errorBody = await response.json().catch(() => ({}));
              const rawMessage =
                (errorBody && (errorBody.message as string | string[])) || null;
              const message = Array.isArray(rawMessage)
                ? rawMessage[0]
                : rawMessage || "Failed to change password. Please try again.";
              setChangePasswordError(message);
              return;
            }

            setIsChangePasswordModalOpen(false);
          } catch (error) {
            console.error("Error changing password:", error);
            setChangePasswordError(
              "An unexpected error occurred. Please try again.",
            );
          }
        }

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

      <InfoCard
        title="Personal Information"
        action={
          !isEditingPersonalInfo && (
            <Button
              text="Edit"
              onClick={handleStartEdit}
              className="bg-white text-black border-2 border-grey-500"
              logo={faPenToSquare}
              logoPosition="right"
            />
          )
        }
        fields={[
          { label: "First Name", value: personalInfo.firstName },
          { label: "Last Name", value: personalInfo.lastName },
          { label: "Email Address", value: personalInfo.email },
        ]}
        isEditing={isEditingPersonalInfo}
        editContent={
          <>
            <div className="grid grid-cols-2 gap-6 text-left mb-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={`w-full px-3 py-2 rounded-md border bg-white text-gray-900 ${
                    personalInfoError ? "border-[#CC0000]" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            {personalInfoError && (
              <div className="mb-4 rounded-2xl bg-[#FFEEEE] px-4 py-3 text-sm font-bold text-[#CC0000]">
                {personalInfoError}
              </div>
            )}
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
          </>
        }
      />

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
        onSubmit={async (values) => changePasswordHandler(values)}
      />
    </div>
  );
}
