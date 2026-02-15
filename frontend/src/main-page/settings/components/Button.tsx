type ButtonProps = {
    text: string;
    onClick: () => void;
    className?: string;
    logo?: string;
    logoPosition?: 'left' | 'right';
}


// Button component where you can pass in text, onClick handler, optional className
// for styling, and an optional logo with its position.
//Styling is default, but can be overridden by passing in a className prop
export default function Button({ text, onClick, className, logo, logoPosition }: ButtonProps) {
  return (
    <button onClick={onClick}
    className={`
        px-4 py-2 rounded-3xl font-medium bg-primary-800 text-black border
        flex items-center justify-center
        ${className}
      `}
    >
      {logo && logoPosition === 'left' &&
      <span className="mr-2">
        <img src={logo}
        alt="" className="w-4 h-4" />
      </span>}
      {text}
      {logo && logoPosition === 'right' &&
      <span className="ml-2">
        <img src={logo} alt="" className="w-4 h-4" />
      </span>}
    </button>
  );
}