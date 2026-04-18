import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
};

/**
 * Reusable styled checkbox rendered as an ARIA checkbox.
 */
export default function CheckboxField({
  id,
  checked,
  onChange,
  label,
}: CheckboxFieldProps) {
  const labelId = `${id}-label`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange();
    }
  };

  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={checked}
      aria-labelledby={label ? labelId : undefined}
      tabIndex={0}
      className="flex items-center gap-2 cursor-pointer select-none focus:outline-none rounded-sm"
      onClick={onChange}
      onKeyDown={handleKeyDown}
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
      </div>
  );
}
