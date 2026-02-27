/**
 * Displays password criteria with checkmark-style layout.
 * Each requirement shows green (met) or gray (unmet) based on current password.
 * Uses Tailwind and project color tokens (green-light, green-dark, grey-200, grey-600).
 */
export type PasswordRequirement = {
  id: string;
  label: string;
  check: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: "length", label: "Minimum 8 characters", check: (p) => p.length >= 8 },
  { id: "upper", label: "1 Uppercase", check: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "1 Number", check: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "At least 1 special character",
    check: (p) => /[!@#$%^&*]/.test(p),
  },
  { id: "lower", label: "1 Lowercase", check: (p) => /[a-z]/.test(p) },
];

/** Returns true if the password meets all requirements (same logic as sign-up). */
export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.check(password));
}

type PasswordRequirementsProps = {
  password: string;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {PASSWORD_REQUIREMENTS.map(({ id, label, check }) => {
        const met = check(password);
        return (
          <span
            key={id}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
              met
                ? "bg-green-light text-green-dark"
                : "bg-grey-200 text-grey-600"
            }`}
          >
            <CheckIcon className="h-4 w-4 shrink-0" />
            {label}
          </span>
        );
      })}
    </div>
  );
}
