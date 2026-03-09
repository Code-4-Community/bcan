import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/Button";
import { getCroppedImg } from "./cropUtils";
import {
  ALLOWED_PROFILE_PIC_MIME_TYPES,
  ALLOWED_PROFILE_PIC_EXTENSIONS,
  MAX_PROFILE_PIC_SIZE_BYTES,
  MAX_PROFILE_PIC_SIZE_MB,
} from "./profilePictureConstants";
import { api } from "../../api";
import { getAppStore } from "../../external/bcanSatchel/store";
import { updateUserProfile } from "../../external/bcanSatchel/actions";
import { setActiveUsers } from "../../external/bcanSatchel/actions";
import { User } from "../../../../middle-layer/types/User";

type ProfilePictureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export default function ProfilePictureModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: ProfilePictureModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const user = getAppStore().user;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setUploadError(null);
    setValidationError(null);
    setIsUploading(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    setValidationError(null);
    setUploadError(null);

    if (!file) return;

    if (!ALLOWED_PROFILE_PIC_MIME_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_PIC_MIME_TYPES)[number])) {
      setValidationError(
        `Invalid file type. Allowed: ${ALLOWED_PROFILE_PIC_EXTENSIONS.join(", ")}`
      );
      return;
    }

    if (file.size > MAX_PROFILE_PIC_SIZE_BYTES) {
      setValidationError(`File too large. Maximum size is ${MAX_PROFILE_PIC_SIZE_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("profilePic", blob, "profilepic.jpg");
      formData.append(
        "user",
        JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          position: user.position,
        })
      );

      const response = await api("/user/upload-pfp", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message =
          (errBody as { message?: string }).message ||
          `Upload failed (${response.status})`;
        throw new Error(message);
      }

      const raw = await response.text();
      let url: string;
      try {
        const parsed = JSON.parse(raw);
        url = typeof parsed === "string" ? parsed : String(parsed);
      } catch {
        url = raw.replace(/^"|"$/g, "").trim();
      }

      updateUserProfile({ ...user, profilePicUrl: url });

      const store = getAppStore();
      const updatedActiveUsers = (store.activeUsers || []).map((u: User) =>
        u.email === user.email ? { ...u, profilePicUrl: url } : u
      );
      setActiveUsers(updatedActiveUsers);

      handleClose();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload profile picture.";
      setUploadError(message);
      onError?.(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-picture-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2
            id="profile-picture-title"
            className="text-2xl font-bold text-black"
          >
            Profile Picture
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded p-1 text-grey-600 hover:bg-grey-200 hover:text-grey-800 disabled:opacity-50"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
          </button>
        </div>

        {!imageSrc ? (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-grey-400 bg-grey-100 py-12 px-6 cursor-pointer hover:bg-grey-200">
              <span className="text-grey-700 font-medium">Choose an image</span>
              <span className="text-sm text-grey-500 mt-1">
                {ALLOWED_PROFILE_PIC_EXTENSIONS.join(", ")} up to {MAX_PROFILE_PIC_SIZE_MB} MB
              </span>
              <input
                type="file"
                accept={ALLOWED_PROFILE_PIC_MIME_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {validationError && (
              <div className="rounded-2xl bg-[#FFEEEE] px-4 py-3 text-sm font-bold text-[#CC0000]">
                {validationError}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="relative w-full h-80 rounded-full overflow-hidden bg-grey-200 [&_.reactEasyCrop_Container]:rounded-full">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{ containerStyle: { borderRadius: "9999px" } }}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-grey-300 accent-primary-900"
              />
              <div className="text-sm text-grey-600 mt-1">{zoom.toFixed(1)}x</div>
            </div>

            {(uploadError || validationError) && (
              <div className="mt-4 rounded-2xl bg-[#FFEEEE] px-4 py-3 text-sm font-bold text-[#CC0000]">
                {uploadError ?? validationError}
              </div>
            )}

            <div className="mt-6 flex justify-between gap-3">
              <Button
                text="Choose different image"
                onClick={() => {
                  setImageSrc(null);
                  setValidationError(null);
                  setUploadError(null);
                }}
                disabled={isUploading}
                className="bg-white text-gray-600 border-2 border-grey-500 text-sm"
              />
              <div className="flex gap-3">
                <Button
                  text="Cancel"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="bg-white text-gray-600 border-2 border-grey-500"
                />
                <Button
                  text={isUploading ? "Uploading…" : "Save"}
                  onClick={handleSave}
                  disabled={isUploading || !croppedAreaPixels}
                  className="bg-primary-900 text-white"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
