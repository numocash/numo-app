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

const SwitchButton = styled.button<{ active: boolean; selected: boolean }>(
  ({ active, selected }) => [
    tw`flex-1 p-3 font-semibold transition rounded-xl`,
    active && !selected && tw`bg-white bg-opacity-80`,
    active && selected && tw`bg-white`,
  ]
);
