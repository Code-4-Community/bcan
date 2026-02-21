import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type ButtonProps = {
    text: string;
    onClick: () => void;
    className?: string;
    logo?: IconProp;
    logoPosition?: 'left' | 'right';
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}


// Button component where you can pass in text, onClick handler, optional className
// for styling, and an optional logo with its position.
//Styling is default, but can be overridden by passing in a className prop
export default function Button({ text, onClick, className, logo, logoPosition, disabled, type }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled || false} type={type || "button"}
    className={`
        px-4 py-2 rounded-3xl font-medium text-black border-2
        flex items-center justify-center
        ${className}
      `}
    >
      {logo && logoPosition === 'left' &&
      <span className="mr-2">
        <FontAwesomeIcon icon={logo} className="text-lg w-4 h-4" />
      </span>}
      {text}
      {logo && logoPosition === 'right' &&
      <span className="ml-2">
        <FontAwesomeIcon icon={logo} className="text-lg w-4 h-4" />
      </span>}
    </button>
  );
}