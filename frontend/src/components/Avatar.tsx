import { useState } from "react";

type AvatarProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc: string;
};

/**
 * Renders a profile image with fallback when the URL fails to load.
 * Use for profile pictures and avatars across the app.
 */
export default function Avatar({ src, alt, className = "", fallbackSrc }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const effectiveSrc = src && !imgError ? src : fallbackSrc;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}
