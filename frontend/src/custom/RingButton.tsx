import { Button } from "@chakra-ui/react";
import "../styles/button.css";

/* Maintained with button.css */
export enum ButtonColorOption {
    GREEN,
    GRAY,
    ORANGE,
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
export default function RingButton ({text, color}: RingButtonProps){
    return (
        <>
        { ButtonColorOption.GREEN === color &&
        <Button className="green-button button-default">
            {text}
        </Button>
        }
        { ButtonColorOption.ORANGE === color &&
        <Button className="orange-button button-default">
            {text}
        </Button>
        }
        { ButtonColorOption.GRAY === color &&
        <Button className="gray-button button-default">
            {text}
        </Button>
        }
        </>
    )
}