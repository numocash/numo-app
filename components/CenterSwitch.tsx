import { FaArrowDown, FaPlus } from "react-icons/fa";

export default function CenterSwitch({
  icon,
}: {
  icon: "plus" | "arrow";
}) {
  return (
    <div className="flex w-full items-center justify-center ">
      <div className="absolute flex h-6 w-6 items-center justify-center self-center rounded-lg border-2 border-gray-200 bg-white text-secondary">
        {icon === "plus" ? <FaPlus /> : <FaArrowDown />}
      </div>
    </div>
  );
}
