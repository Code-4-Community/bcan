type SignUpButtonProps = {
  disabled?: boolean;
};

/**
 * Primary Sign Up submit button.
 * When requirements are met: primary-900 (#E16F39), clickable.
 * When not met: primary-700 (current/inactive), disabled.
 */
export default function SignUpButton({ disabled }: SignUpButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`mt-8 w-full rounded-md py-2.5 text-base font-bold text-white transition-opacity ${
        disabled
          ? "cursor-not-allowed bg-primary-700 opacity-70"
          : "bg-primary-900 hover:opacity-95"
      }`}
    >
      Sign Up
    </button>
  );
}
