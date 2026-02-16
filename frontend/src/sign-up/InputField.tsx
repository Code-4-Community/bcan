import type { InputHTMLAttributes } from "react";

type InputFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

/**
 * Reusable text input with label and optional required asterisk.
 * Uses Tailwind and project color tokens (grey-400, red, etc.).
 */
export default function InputField({
  id,
  label,
  required,
  error,
  ...inputProps
}: InputFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-left font-bold text-black">
        {label}
        {required && <span className="text-red">*</span>}
      </label>
      <div className="mt-2 flex items-center rounded-md">
        <input
          id={id}
          className={`block w-full rounded-md border bg-white py-2.5 pl-4 pr-3 text-base placeholder:text-grey-500 ${
            error ? "border-red" : "border-grey-400"
          }`}
          {...inputProps}
        />
      </div>
    </div>
  );
}
