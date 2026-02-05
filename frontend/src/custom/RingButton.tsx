import "../styles/button.css";

/* Maintained with button.css */
export enum ButtonColorOption {
  GREEN = "var(--color-green)",
  GRAY = "var(--color-grey-400)",
  ORANGE = "var(--color-primary-700)",
}

/* API for components to setup a button with expected system colors */
interface RingButtonProps {
  /* The text to display for the button */
  text: string;

  /* The color of the button */
  color: ButtonColorOption;
}

/* Generic Button Component With:
 * Text
 * Color
 */
export default function RingButton({ text, color }: RingButtonProps) {
  return (
    <>
      {ButtonColorOption.GREEN === color && (
        <div
          className="bg-green button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.ORANGE === color && (
        <div
          className="bg-primary-700 button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.GRAY === color && (
        <div
          className="bg-grey-400 button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
    </>
  );
}
