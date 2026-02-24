import { useState } from "react";
import {
  PasswordField,
  PasswordRequirements,
  isPasswordValid,
} from "../../sign-up";


export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  
  onSubmit?: (values: ChangePasswordFormValues) => void;
  error?: string | null;
};

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  error = null,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");

  if (!isOpen) return null;

  const newPasswordValid = isPasswordValid(newPassword);
  const passwordsMatch = newPassword !== "" && newPassword === reEnterPassword;
  const allFilled =
    currentPassword.trim() !== "" &&
    newPassword !== "" &&
    reEnterPassword !== "";
  const canSave =
    allFilled && newPasswordValid && passwordsMatch;

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setReEnterPassword("");
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    onSubmit?.({
      currentPassword: currentPassword.trim(),
      newPassword,
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="change-password-title"
            className="text-2xl font-bold text-black"
          >
            Change Password
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-grey-600 hover:bg-grey-200 hover:text-grey-800"
            aria-label="Close"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <PasswordField
            id="change-password-current"
            label="Current Password"
            required
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={!!error}
          />

          <PasswordField
            id="change-password-new"
            label="New Password"
            required
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <PasswordField
            id="change-password-reenter"
            label="Re-enter Password"
            required
            placeholder="Re-enter your password"
            value={reEnterPassword}
            onChange={(e) => setReEnterPassword(e.target.value)}
          />

          <PasswordRequirements password={newPassword} />

          {error && (
            <div className="rounded-md bg-red-lightest p-3 text-sm text-red-dark">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-md py-2.5 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-primary-900 enabled:hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
