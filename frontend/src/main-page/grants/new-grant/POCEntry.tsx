import { forwardRef, useImperativeHandle, useState } from "react";
import "../styles/NewGrantModal.css";

const POCEntry = forwardRef((_props, ref) => {
  const [poc, setPoc] = useState("");
  const [pocType, setPocType] = useState("Email");
  const [inputType, setInputType] = useState("email");

  useImperativeHandle(ref, () => ({
    getPOC: () => `${pocType}: ${poc}`,
  }));

  const handlePOCType = (e: { target: { value: any } }) => {
    const val = e.target.value;
    setPocType(val);
    if (val === "Email") {
      setInputType("email");
      setPoc("");
    } else if (val === "Phone Number") {
      setInputType("tel");
      setPoc("");
    } else {
      setInputType("text");
    }
  };

  return (
    <div className="poc-entry">
      <select value={pocType} onChange={handlePOCType}>
        <option value="Email">Email</option>
        <option value="Phone Number">Phone Number</option>
      </select>
      <input
        type={inputType}
        placeholder="Click to edit name"
        value={poc}
        onChange={(e) => setPoc(e.target.value)}
      />
    </div>
  );
});

export default POCEntry;
