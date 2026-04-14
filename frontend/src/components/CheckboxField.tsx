import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
};

/**
 * Reusable styled checkbox. Renders an orange filled box with a white
 * FontAwesome checkmark when checked; a grey border when unchecked.
 */
export default function CheckboxField({
  id,
  checked,
  onChange,
  label,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className={`flex items-center justify-center w-4 h-4 flex-shrink-0 border-2 ${
          checked
            ? "bg-primary-900 border-primary-900"
            : "bg-white border-grey-600"
        }`}
      >
        {checked && (
          <FontAwesomeIcon
            icon={faCheck}
            className="text-white"
            style={{ fontSize: "0.55rem" }}
          />
        )}
      </span>
      {label}
    </label>
  );
}
