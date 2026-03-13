import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

// Did not change this to using the email/first name last name due to user page redesign so someone will be changing all of this anyway

interface UserRowHeaderButtonProps {
  header: string;
  sort: "asc" | "desc" | "none";
  onClick: () => void;
}

const UserRowHeaderButton = (props: UserRowHeaderButtonProps) => {
  return (
    <button
      className="font-medium flex items-centerpx-0 hover:border-white col-span-1 justify-start hover:text-grey-500 text-grey-600"
      onClick={props.onClick}
    >
      <button />
      <span className="mr-2">
        <FontAwesomeIcon
          icon={
            props.sort == "asc"
              ? faSortUp
              : props.sort == "desc"
                ? faSortDown
                : faSort
          }
          className="text-lg w-4 h-4"
        />
      </span>

      {props.header}
    </button>
  );
};

export default UserRowHeaderButton;
