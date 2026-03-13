import Button from "../../../../components/Button";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import ContactCard from "../../grant-view/ContactCard";
import { GrantFormState } from "../EditGrant";

type EditGrantProps = {
  form: GrantFormState;
};

export default function EditGrantContacts({ form }: EditGrantProps) {
  return (
    <div className="w-full">
      <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
        Contacts
      </label>
      <div className="grid grid-cols-3 gap-2 h-24 w-full">
        {!(form.bcanPocEmail && form.grantProviderPocEmail) && (
          <Button
            text=""
            logoPosition="center"
            className="rounded-md border-grey-400 text-primary-900"
            logo={faPlusCircle}
            onClick={() => alert("add contact")}
          />
        )}
        {form.bcanPocEmail !== "" && (
          <ContactCard
            contact={{
              POC_name: form.bcanPocName,
              POC_email: form.bcanPocEmail,
            }}
            type="BCAN"
          />
        )}
        {form.grantProviderPocEmail !== "" && (
          <ContactCard
            contact={{
              POC_name: form.grantProviderPocName,
              POC_email: form.grantProviderPocEmail,
            }}
            type="Granter"
          />
        )}
      </div>
    </div>
  );
}
