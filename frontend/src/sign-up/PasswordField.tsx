import { useState } from "react";
import type { InputHTMLAttributes } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "className">;

/** Eye icon (visible password). */
function EyeIcon({ className }: { className?: string }) {
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/** Eye-slash icon (hidden password). */
function EyeSlashIcon({ className }: { className?: string }) {
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
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

/**
 * Password input with label and show/hide toggle.
 * Uses Tailwind and project color tokens.
 */
export default function PasswordField({
  id,
  label,
  required,
  error,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-left font-bold text-black">
        {label}
        {required && <span className="text-red">*</span>}
      </label>
      <div className="relative mt-2 flex items-center rounded-md">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`block w-full rounded-md border-2 py-2.5 pl-4 pr-10 text-base placeholder:text-grey-500 ${
            error ? "border-red bg-red-lightest" : "border-grey-500 bg-white "
          }`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-600 hover:text-grey-700"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
