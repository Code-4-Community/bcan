import Button from "../components/Button";

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
    <Button
                text="Sign Up"
                type="submit"
                disabled={disabled}
                onClick={() => {}}
                className={`mt-8 w-full text-base font-bold text-white transition-opacity ${
        disabled
          ? "cursor-not-allowed bg-primary-700 opacity-70"
          : "bg-primary-900 hover:opacity-95"
      }`}/>
  );
}
