import { RadioGroup } from "@headlessui/react";

export default function Toggle<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: T[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  return (
    <RadioGroup className={className} value={value} onChange={onChange}>
      <RadioGroup.Label className="sr-only">Bound</RadioGroup.Label>

      {items.map((t) => (
        <RadioGroup.Option
          value={t}
          key={t}
          className="text-center overflow-clip cursor-pointer ui-checked:bg-white h-9 w-9 rounded-[10px] items-center justify-center flex p-1"
        >
          {t}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}
