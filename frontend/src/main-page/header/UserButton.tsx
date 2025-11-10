import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserButton = () => {
  return (
    <div>
      <a href="/main/users">
        <button className="text-[#000000] focus:outline-none">
          <FontAwesomeIcon icon={faUser} />
        </button>
      </a>
    </div>
  );
};

export default UserButton;
