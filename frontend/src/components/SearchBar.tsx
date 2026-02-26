import { IoMdSearch } from "react-icons/io";

type SearchBarProps = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userInput: string;
};

export default function SearchBar({
  handleInputChange,
  userInput,
}: SearchBarProps) {
  return (
    <div className="w-full relative">
      {/* Absolutely-positioned icon */}
      <IoMdSearch
        style={{
          position: "absolute",
          top: "50%",
          left: "0.7rem",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 2,
          marginLeft: "2px",
        }}
      />
      <input
        placeholder="Search for a user..."
        className="w-full px-4 py-2 rounded-3xl font-medium text-black border-2 flex items-center justify-center border-grey-500"
        onChange={handleInputChange}
        value={userInput}
        style={{ paddingLeft: "2rem" }} // make room for the icon
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}
