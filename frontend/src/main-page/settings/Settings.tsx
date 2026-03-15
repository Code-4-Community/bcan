import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import Button from "../../components/Button";
import InfoCard from "./components/InfoCard";
import Avatar from "../../components/Avatar";
import logo from "../../images/logo.svg";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ProfilePictureModal from "./ProfilePictureModal";
import { ALLOWED_PROFILE_PIC_EXTENSIONS, MAX_PROFILE_PIC_SIZE_MB } from "./profilePictureConstants";
import { removeProfilePic } from "../../external/bcanSatchel/actions";
import {api} from "../../api"
import ChangePasswordModal, { ChangePasswordFormValues } from "./ChangePasswordModal";
import { getAppStore } from "../../external/bcanSatchel/store";
import { setActiveUsers, updateUserProfile } from "../../external/bcanSatchel/actions";
import { User } from "../../../../middle-layer/types/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Settings() {
  const store = getAppStore();
  const user = store.user;
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
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [profilePictureMessage, setProfilePictureMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      const next = { firstName: user.firstName, lastName: user.lastName, email: user.email };
      setPersonalInfo((prev) => (prev.email === user.email ? prev : next));
      setEditForm((prev) => (prev.email === user.email ? prev : next));
    }
  }, [user]);

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
      updateUserProfile(updatedUser);
      setPersonalInfo(editForm);

      setIsEditingPersonalInfo(false);
      setPersonalInfoError(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setPersonalInfoError("An unexpected error occurred. Please try again.");
    }
  };

  const handleRemoveProfilePic = async () => {
    const store = getAppStore()
    if(!store.user!.profilePicUrl){
      return;
    }
    const email = store.user?.email

    const response = await api('/user/remove-pfp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email})
          });

    if(!response.ok){
      // TODO: Put a real design here
     alert("There was an error removing the profile picture")
    }
    removeProfilePic()
  }
  const changePasswordHandler = async (values : ChangePasswordFormValues) =>  {
          setChangePasswordError(null);
          if(values.currentPassword === values.newPassword){
            setChangePasswordError("Current and new password are the same")
            return;
          }
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
          <Avatar
            src={user?.profilePicUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
            fallbackSrc={logo}
          />

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold mb-1 flex justify-start">Profile Picture</h2>
            {profilePictureMessage && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                  profilePictureMessage.type === "success"
                    ? "bg-green-light text-green-dark"
                    : "bg-[#FFEEEE] text-[#CC0000]"
                }`}
              >
                {profilePictureMessage.text}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                text="Upload Image"
                onClick={() => {
                  setProfilePictureMessage(null);
                  setIsProfilePictureModalOpen(true);
                }}
                className="bg-primary-900 text-white"
              />
              <Button
                text="Remove"
                onClick={() => handleRemoveProfilePic()}
                className="bg-white text-black border-2 border-grey-500"
              />
            </div>

            <p className="text-sm text-gray-500">
              {ALLOWED_PROFILE_PIC_EXTENSIONS.join(", ")} up to {MAX_PROFILE_PIC_SIZE_MB} MB
            </p>
          </div>
        </div>
      </div>

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onSuccess={() => setProfilePictureMessage({ type: "success", text: "Profile picture updated." })}
        onError={(msg) => setProfilePictureMessage({ type: "error", text: msg })}
      />

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

export default observer(Settings);
