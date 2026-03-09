/** Allowed MIME types for profile picture upload (must match backend). */
export const ALLOWED_PROFILE_PIC_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

/** Allowed file extensions for display in UI. */
export const ALLOWED_PROFILE_PIC_EXTENSIONS = ["JPG", "JPEG", "PNG", "GIF", "WEBP"];

/** Max file size: 5MB (backend limit). */
export const MAX_PROFILE_PIC_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_PROFILE_PIC_SIZE_MB = 5;
