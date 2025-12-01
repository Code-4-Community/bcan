import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const UserButton = () => {
  return (
    <div>
      <Link to="users">
        <button className="text-[#000000] focus:outline-none">
          <FontAwesomeIcon icon={faUser} />
        </button>
      </Link>
    </div>
  );
};

export default UserButton;
