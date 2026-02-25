import { useState } from "react";
import { User } from "../../../../../middle-layer/types/User";
import { updateUserSort } from "../../../external/bcanSatchel/actions";
import UserRowHeaderButton from "./UserRowHeaderButton";

// Did not change this to using the email/first name last name due to user page redesign so someone will be changing all of this anyway

const UserRowHeader = () => {
  const [labels, setLabels] = useState({
    header: "lastName",
    sort: "desc",
  } as { header: keyof User; sort: "asc" | "desc" | "none" });

  function buttonHandler(header: keyof User) {
    const isAsc =
      labels.header == header
        ? labels.sort == "asc"
          ? "desc"
          : labels.sort == "desc"
            ? "asc"
            : "none"
        : "desc";
    updateUserSort({ header, sort: isAsc });
    setLabels({ header: header, sort: isAsc });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-[30%_35%_25%_10%] cols border-b-2 border-grey-150 py-3 px-8 items-center">
      <UserRowHeaderButton
        header="Name"
        sort={labels.header == "lastName" ? labels.sort : "none"}
        onClick={() => buttonHandler("lastName")}
      />
      <UserRowHeaderButton
        header="Email"
        sort={labels.header == "email" ? labels.sort : "none"}
        onClick={() => buttonHandler("email")}
      />
      <UserRowHeaderButton
        header="Position"
        sort={labels.header == "position" ? labels.sort : "none"}
        onClick={() => buttonHandler("position")}
      />
      <div className="col-span-1 font-medium text-grey-600">{"Action"}</div>
    </div>
  );
};

export default UserRowHeader;
