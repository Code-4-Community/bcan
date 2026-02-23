import POC from "../../../../../middle-layer/types/POC";
import logo from "../../../images/logo.svg";

type ContactCardProps = {
  contact?: POC;
  type?: "BCAN" | "Granter";
};

export default function ContactCard({ contact, type }: ContactCardProps) {
  return (
    <div className="flex flex-row gap-4 w-full justify-items-start rounded-sm border p-3 h-full border-grey-500">
      <img
        src={logo}
        alt="Profile"
        className="max-w-14 rounded-full hidden lg:block"
      />
      <div className="flex flex-col align-middle justify-center">
        <p className="text-black text-md font-semibold ">
          {contact?.POC_name || "N/A"}
        </p>
        <p className="text-black text-sm break-all">
          <a
            href={"mailto:" + contact?.POC_email}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-words"
          >
            {contact?.POC_email}
          </a>
        </p>
      </div>
      <div className="place-items-end justify-end ml-auto flex items-start">
        <div
          className={`w-fit h-fit p-2 text-xs rounded-full text-white ${type === "BCAN" ? "bg-primary-900" : "bg-secondary-500"}`}
        >
          {type}
        </div>
      </div>
    </div>
  );
}
