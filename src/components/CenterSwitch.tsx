import { faArrowDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  onClick?: () => void;
  icon: "arrow" | "plus";
}

export const CenterSwitch: React.FC<Props> = ({ onClick, icon }: Props) => {
  return (
    <div className="flex w-full items-center justify-center ">
      <button
        onClick={onClick}
        className="bg-background border-stroke absolute flex h-6 w-6 items-center  justify-center self-center rounded-lg border-2"
      >
        <div className="text-stroke flex items-center justify-center text-sm">
          <FontAwesomeIcon
            icon={icon === "arrow" ? faArrowDown : faPlus}
            fixedWidth
          />
        </div>
      </button>
    </div>
  );
};
