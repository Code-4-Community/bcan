import Button from "../components/Button";

type SignUpButtonProps = {
  disabled?: boolean;
  submitting?: boolean;
};

/**
 * Primary Sign Up submit button.
 * When requirements are met: primary-900 (#E16F39), clickable.
 * When not met: primary-700 (current/inactive), disabled.
 */
export default function SignUpButton({ disabled, submitting }: SignUpButtonProps) {
  return (
    <Button
                text={submitting ? "Submitting..." : "Sign Up"}
                type="submit"
                disabled={disabled}
                onClick={() => {}}
                className={`mt-6 w-full bg-primary-900 text-base font-bold text-white`}/>
  );
}
