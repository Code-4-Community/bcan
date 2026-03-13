import Button from "../../../../components/Button";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type EditGrantProps = {};

export default function EditGrantDocuments({}: EditGrantProps) {
  return (
    <div className="w-full">
      <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
        Documents
      </label>
      <Button
        logo={faPlus}
        logoPosition="left"
        text="Add"
        className="text-white bg-primary-900 text-xs"
        onClick={() => alert("Add document clicked")}
      />
    </div>
  );
}
