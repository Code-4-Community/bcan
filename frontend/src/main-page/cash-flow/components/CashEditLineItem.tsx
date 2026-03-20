import Button from "../../../components/Button";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function CashEditLineItem() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded border border-grey-500 p-4">
        <div className="flex flex-col text-lg lg:text-xl font-bold text-start">{"Source Name"}</div>
      <div className="flex flex-row gap-2">
      <Button
        text="Edit"
        onClick={() => alert("edit")}
        logo={faPenToSquare}
        logoPosition="right"
        className="bg-white text-black border-grey-500"
      />
      <Button
        text="Remove"
        logo={faTrash}
        logoPosition="right"
        onClick={() => alert("edit")}
        className="bg-red-light text-red"
      />
      </div>
    </div>
  );
}
