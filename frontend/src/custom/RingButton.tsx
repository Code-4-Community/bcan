import "../styles/button.css";

/* Maintained with button.css */
export enum ButtonColorOption {
  GREEN = "var(--color-green-2)",
  GRAY = "var(--color-light-gray-2)",
  ORANGE = "var(--color-light-orange)",
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
          className="bg-green-2 button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.ORANGE === color && (
        <div
          className="bg-light-orange button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.GRAY === color && (
        <div
          className="bg-light-gray-2 button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
    </>
  );
}
