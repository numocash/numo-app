import { FaArrowDown, FaPlus } from "react-icons/fa";

export default function CenterSwitch({
  icon,
  onClick,
}: {
  icon: "plus" | "arrow";
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <div className="flex w-full items-center justify-center ">
      <button
        onClick={onClick}
        className="absolute flex h-6 w-6 items-center justify-center self-center  rounded-lg border-2 border-gray-200 bg-white"
      >
        {icon === "plus" ? <FaPlus /> : <FaArrowDown />}
      </button>
    </div>
  );
}
