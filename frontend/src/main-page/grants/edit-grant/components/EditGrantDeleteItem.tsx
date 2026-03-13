import { FaXmark } from "react-icons/fa6";

type EditGrantDeleteItemProps = {
  item: React.ReactNode;
  onDelete: () => void;
  position?: 'middle' | 'top'
};

export default function EditGrantDeleteItem({
  item,
  onDelete,
  position = "middle",
}: EditGrantDeleteItemProps) {
  return (
    <div className="relative">
      <div
        className={`rounded-full bg-red w-fit p-1 hover:cursor-pointer absolute ${position === "middle" ? "-left-2 bottom-2" : "-left-2"}`}
        onClick={onDelete}
      >
        <FaXmark className="text-white text-xs" />
      </div>
      {item}
    </div>
  );
}
