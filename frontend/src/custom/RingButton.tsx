import { Button } from "@chakra-ui/react";
import "../styles/button.css";

/* Maintained with button.css */
export enum ButtonColorOption {
  GREEN = "#5AB911",
  GRAY = "#D3D3D3",
  ORANGE = "#F7A781",
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
          className="green-button button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.ORANGE === color && (
        <div
          className="orange-button button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
      {ButtonColorOption.GRAY === color && (
        <div
          className="gray-button button-default"
          style={{ width: "100%", border: "none", cursor: "default" }}
        >
          {text}
        </div>
      )}
    </>
  );
}
