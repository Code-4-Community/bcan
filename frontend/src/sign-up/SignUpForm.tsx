import InputField from "../components/InputField";
import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";
import SignUpButton from "./SignUpButton";
import LoginPrompt from "./LoginPrompt";

export type SignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordRe: string;
};

export type SignUpFormProps = {
  values: SignUpFormValues;
  onChange: (field: keyof SignUpFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: { state: boolean; message: string; item: string };
  /** When true, Sign Up button uses primary-900 and is clickable; when false, primary-700 and disabled. */
  passwordRequirementsMet?: boolean;
  /** When true, all required fields (first name, last name, email, password, re-enter password) are filled. */
  allFieldsFilled?: boolean;
  /** When true, password and re-enter password are exactly the same. */
  passwordsMatch?: boolean;
};

/**
 * Sign Up form layout: title, fields, requirements, button, login prompt.
 * Composes sign-up subcomponents; state and submit logic live in the parent.
 */
export default function SignUpForm({
  values,
  onChange,
  onSubmit,
  error,
  passwordRequirementsMet = false,
  allFieldsFilled = false,
  passwordsMatch = false,
}: SignUpFormProps) {
  const hasError = error?.state ?? false;
  const errorItem = error?.item ?? "";
  const canSubmit =
    passwordRequirementsMet && allFieldsFilled && passwordsMatch;

  return (
    <div className="flex w-full flex-col text-left">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 flex justify-start">Sign Up</h1>

      <form onSubmit={onSubmit} className="flex w-full flex-col text-left">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-6">
          <InputField
            id="firstName"
            label="First Name"
            required
            placeholder="Enter your first name"
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            error={errorItem === "firstName"}
          />
          <InputField
            id="lastName"
            label="Last Name"
            required
            placeholder="Enter your last name"
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            error={errorItem === "lastName"}
          />
        </div>

        <div className="mt-4">
          <InputField
            id="email"
            label="Email"
            required
            placeholder="Enter your email address"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errorItem === "email"}
          />
        </div>

        <div className="mt-4">
          <PasswordField
            id="password"
            label="Password"
            required
            placeholder="Enter your password"
            value={values.password}
            onChange={(e) => onChange("password", e.target.value)}
            error={errorItem === "password"}
          />
        </div>

        <div className="mt-4">
          <PasswordField
            id="passwordRe"
            label="Re-enter Password"
            required
            placeholder="Re-enter your password"
            value={values.passwordRe}
            onChange={(e) => onChange("passwordRe", e.target.value)}
            error={errorItem === "password" || passwordsMatch === false}
          />
        </div>

        {!hasError && (<PasswordRequirements password={values.password} />)}

        {hasError && error?.message && (
          <div className="bg-red-light text-red rounded-xl py-3 px-4 text-center mt-9">
            {error.message}
          </div>
        )}

        <SignUpButton disabled={!canSubmit} />
        <LoginPrompt />
      </form>
    </div>
  );
}
