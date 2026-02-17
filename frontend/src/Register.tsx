import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./context/auth/authContext";
import { SignUpForm, BrandingPanel } from "./sign-up";
import "./styles/index.css";

const PASSWORD_REGEX =
  /^(?=.*[!@#$%^&*])(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new BCAN user. Uses sign-up components and matches Figma layout.
 */
const Register = observer(() => {
  const navigate = useNavigate();
  const { register } = useAuthContext();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordRe: "",
  });
  const [failure, setFailure] = useState<{
    state: boolean;
    message: string;
    item: string;
  }>({ state: false, message: "", item: "" });

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (failure.state) {
      setFailure({ state: false, message: "", item: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMAIL_REGEX.test(values.email)) {
      setFailure({
        state: true,
        message: "Please enter a valid email address.",
        item: "email",
      });
      return;
    }
    if (!PASSWORD_REGEX.test(values.password)) {
      setFailure({
        state: true,
        message:
          "Password must have at least one special character (!@#$%^&*), one digit, one uppercase, one lowercase, and be at least 8 characters long.",
        item: "password",
      });
      return;
    }
    if (values.password !== values.passwordRe) {
      setFailure({
        state: true,
        message: "Passwords do not match.",
        item: "password",
      });
      return;
    }

    const first = values.firstName.trim();
    const last = values.lastName.trim();
    const username =
      first || last
        ? `${first}_${last}`.replace(/\s+/g, "_").replace(/_+/g, "_")
        : values.email;
    const success = await register(username, values.password, values.email);

    if (success.state) {
      navigate("/registered");
    } else {
      setFailure({
        state: true,
        message: success.message,
        item: "registration",
      });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <div className="flex w-[58%] flex-col justify-center px-16 py-14">
        <SignUpForm
          values={values}
          onChange={updateField}
          onSubmit={handleSubmit}
          error={failure}
          passwordRequirementsMet={PASSWORD_REGEX.test(values.password)}
          allFieldsFilled={
            values.firstName.trim() !== "" &&
            values.lastName.trim() !== "" &&
            values.email.trim() !== "" &&
            values.password !== "" &&
            values.passwordRe !== ""
          }
          passwordsMatch={values.password === values.passwordRe}
        />
      </div>
      <div className="w-[42%]">
        <BrandingPanel />
      </div>
    </div>
  );
});

export default Register;
