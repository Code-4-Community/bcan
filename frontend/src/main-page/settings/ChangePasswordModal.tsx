import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  PasswordField,
  PasswordRequirements,
  isPasswordValid,
} from "../../sign-up";
import ActionConfirmation from "../../components/ActionConfirmation";
import Button from "../../components/Button";

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

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  error = null,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const newPasswordValid = isPasswordValid(newPassword);
  const passwordsMatch = newPassword !== "" && newPassword === reEnterPassword;
  const passwordsDontMatch =
    reEnterPassword !== "" && newPassword !== reEnterPassword;
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
    setShowConfirm(false);
    onClose();
  };

  const requestSave = () => {
    if (!canSave) return;
    setShowConfirm(true);
  };

  const handleConfirmedSave = () => {
    onSubmit?.({
      currentPassword: currentPassword.trim(),
      newPassword,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <ActionConfirmation
        isOpen={showConfirm}
        onCloseDelete={() => setShowConfirm(false)}
        onConfirmDelete={handleConfirmedSave}
        title="Change Password"
        subtitle="Are you sure you want to change"
        boldSubtitle="your password"
        warningMessage="You will use your new password the next time you sign in."
        variant="update"
      />
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="change-password-title"
            className="text-2xl font-bold text-black "
          >
            Change Password
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-grey-600 hover:bg-grey-200 hover:text-grey-800"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
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
            error={!!error || passwordsDontMatch}
          />

          <PasswordRequirements password={newPassword} />

          {(error || passwordsDontMatch) && (
            <div className="rounded-2xl bg-[#FFEEEE] px-4 py-3 text-sm font-bold text-[#CC0000]">
              {error ?? "Your passwords do not match."}
            </div>
          )}
          <Button text="Save" onClick={requestSave} disabled={!canSave} className="bg-primary-900 text-white w-full" />
        </div>
      </div>
    </div>
  );
}
