import { RadioGroup } from "@headlessui/react";
import { objectKeys } from "ts-extras";

export default function Toggle<T extends string | number>({
  items,
  value,
  onChange,
  className,
}: {
  items: { [key in T]: React.ReactNode };
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  return (
    <RadioGroup className={className} value={value} onChange={onChange}>
      <RadioGroup.Label className="sr-only">Bound</RadioGroup.Label>

      {objectKeys(items).map((t) => (
        <RadioGroup.Option
          value={t}
          key={t}
          className=" cursor-pointer ui-checked:bg-white h-9 w-9 rounded-[10px] items-center justify-center flex"
        >
          {items[t as T]}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}
