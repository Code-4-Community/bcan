import { useNavigate } from "react-router-dom";

/**
 * "Already have an account? Log in here" prompt with link.
 * Uses Tailwind and secondary-500 for link.
 */
export default function LoginPrompt() {
  const navigate = useNavigate();

  return (
    <p className="mt-6 text-center text-sm text-grey-600">
      Already have an account?{" "}
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="font-medium text-secondary-500 hover:underline border-none"
      >
        Log in here
      </button>
    </p>
  );
}
