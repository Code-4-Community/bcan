import Button from "./components/Button";
import InfoCard from "./components/InfoCard";
import logo from "../../images/logo.svg";

export default function Settings() {
  return (
    <div className="settings-page px-12 py-4 mb-8 ">
      <h1 className="text-5xl font-bold mb-4 flex justify-start">Settings</h1>
      <div>
        <Button text="Upload Image" 
            onClick={() => alert('add functionality to upload image')} 
            className="bg-primary-800 text-white"
            logo={logo}
            logoPosition="left"
            />
            <Button text="Remove" 
            onClick={() => alert('add functionality to remove image')} 
            className="bg-white text-black border border-grey"
            />
        </div>
        
        <InfoCard title="Personal Information"
        fields={[{ label: "First Name", value: "John" }, { label: "Last Name", value: "Doe" }, { label: "Email", value: "john.doe@gmail.com" }]} />
    </div>
  );
}