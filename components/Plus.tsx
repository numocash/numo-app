import { FaMinus, FaPlus } from "react-icons/fa";

export default function Plus({
  icon,
  onClick,
}: {
  icon: "plus" | "minus";
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-200"
    >
      {icon === "plus" ? <FaPlus /> : <FaMinus />}
    </button>
  );
}

// export const Plus: React.FC<Props> = ({ onClick, icon }: Props) => {
//   return (
//     <button
//       onClick={onClick}
//       tw="flex items-center justify-center bg-gray-200 rounded-lg h-6 w-6"
//     >
//       <div tw=" justify-center items-center flex text-sm">
//         <FontAwesomeIcon icon={icon === "plus" ? faPlus : faMinus} fixedWidth />
//       </div>
//     </button>
//   );
// };
