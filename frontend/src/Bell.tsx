// BellButton.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const currUserID = 1

const BellButton = () => {

    // TODO: function that handles when button is clicked and fetches notifications
    const handleClick = async () => {
        const response = await fetch(`http://localhost:3001/notifications/${currUserID}`, {
            method: 'GET'
        });
        console.log("Button clicked")
        return response
    }

    return (
        <button className="bell-button" onClick={handleClick}>
            <FontAwesomeIcon icon={faBell} />
        </button>
    );
};

export default BellButton;
