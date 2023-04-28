import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import React from "react";

interface Props {
  selected: boolean;
  onSelect: (on: boolean) => void;
}

export const Switch: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="border-stroke flex items-center justify-between rounded-2xl border-2 bg-[#4f4f4f] p-1">
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
      "transistion flex-1 rounded-xl p-3 font-semibold",
      active && !selected && "bg-white bg-opacity-80",
      active && selected && "bg-white"
    )}
  />
);
