import { FaMinus, FaPlus } from "react-icons/fa";

export default function Plus({
  icon,
  onClick,
}: {
  icon: "plus" | "minus";
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-200 text-secondary"
    >
      {icon === "plus" ? <FaPlus /> : <FaMinus />}
    </button>
  );
}
