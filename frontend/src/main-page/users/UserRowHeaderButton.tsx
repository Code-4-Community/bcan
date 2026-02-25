import Button from "../../components/Button";
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
    <Button
        text={props.header}
        logo={(props.sort == "asc" ? faSortUp : props.sort == "desc" ? faSortDown : faSort)}
        logoPosition="right"
        className="px-0 hover:border-white col-span-1 active:bg-white hover:text-grey-500 text-grey-600"
        alignment="left"
        onClick={props.onClick}
      />
  );
};

export default UserRowHeaderButton;
