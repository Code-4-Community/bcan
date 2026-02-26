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
                className={`mt-6 w-full bg-primary-900 text-base font-bold text-white`}/>
  );
}
