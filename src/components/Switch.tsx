import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import React from "react";

interface Props {
  selected: boolean;
  onSelect: (on: boolean) => void;
}

export const Switch: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="flex rounded-2xl p-1 justify-between items-center bg-[#4f4f4f] border-2 border-stroke">
      <SwitchButton
        onClick={() => onSelect(!selected)}
        active={!selected}
        selected={false}
      />
      <SwitchButton
        onClick={() => onSelect(!selected)}
        active={selected}
        selected={true}
      />
    </div>
  );
};

interface ButtonProps {
  active: boolean;
  selected: boolean;
}
const SwitchButton: React.FC<
  ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
> = ({ active, selected }: ButtonProps) => (
  <button
    className={clsx(
      "flex-1 p-3 font-semibold transistion rounded-xl",
      active && !selected && "bg-white bg-opacity-80",
      active && selected && "bg-white"
    )}
  />
);
