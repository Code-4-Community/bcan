import Button from "../../../../components/Button";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import ContactCard from "../../grant-view/ContactCard";
import { GrantFormState } from "../EditGrant";
import EditGrantDeleteItem from "./EditGrantDeleteItem";
import { Action } from "../processGrantDataEditSave";
import { useState } from "react";
import AddContactPopup from "./AddContactPopup";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>;
};

export default function EditGrantContacts({ form, dispatch }: EditGrantProps) {

  const [showPopup, setShowPopup] = useState(false);
  
  const onDelete = (type: "BCAN" | "Granter") => {
  const prefix = type === "BCAN" ? "bcanPoc" : "grantProviderPoc";

  dispatch({
    type: "SET_FIELD",
    field: `${prefix}Email`,
    value: "",
  });

  dispatch({
    type: "SET_FIELD",
    field: `${prefix}Name`,
    value: "",
  });
};

  return (
    <div className="w-full">
      <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
        Contacts
      </label>
      <div className="grid grid-cols-3 gap-4 h-24 w-full">
        {!(form.bcanPocEmail && form.grantProviderPocEmail) && (
          <Button
            text=""
            logoPosition="center"
            className="rounded-md border-grey-400 text-primary-900 text-2xl"
            logo={faPlusCircle}
            onClick={() => setShowPopup(true)}
          />
        )}
        {form.bcanPocEmail !== "" && (
          <EditGrantDeleteItem
            position="top"
            item={
              <ContactCard
                contact={{
                  POC_name: form.bcanPocName,
                  POC_email: form.bcanPocEmail,
                }}
                type="BCAN"
              />
            }
            onDelete={()=>onDelete("BCAN")}
          />
        )}
        {form.grantProviderPocEmail !== "" && (
          <EditGrantDeleteItem
            position="top"
            item={
              <ContactCard
                contact={{
                  POC_name: form.grantProviderPocName,
                  POC_email: form.grantProviderPocEmail,
                }}
                type="Granter"
              />
            }
            onDelete={()=>onDelete("Granter")}
          />
        )}
        {/* Add Popup */}
              {showPopup && (
                <AddContactPopup
                  dispatch={dispatch}
                  form={form}
                  setShowPopup={() => setShowPopup(false)}
                />
              )}
      </div>
    </div>
  );
}
