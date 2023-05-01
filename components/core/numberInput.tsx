import { clsx } from "clsx";

const DIGIT_ONLY = /^(\d)*$/;
const DECIMAL_ONLY = /^-?\d*(\.\d*)?$/;

export default function NumberInput({
  integerOnly,
  onChange,
  className,
  placeholder,
  ...props
}: {
  integerOnly: boolean;
  onChange: (val: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <input
      {...props}
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      className={clsx(
        className,
        "p2 w-full rounded-lg px-2 py-1 text-right placeholder:text-secondary",
      )}
      placeholder={placeholder ?? "0"}
      type="text"
      spellCheck="false"
      onChange={(e) => {
        const { value } = e.target;
        if (integerOnly) {
          if (
            value === "" ||
            (DIGIT_ONLY.test(value) && !Number.isNaN(parseInt(value)))
          ) {
            onChange(value);
          }
          return;
        }
        if (
          (!Number.isNaN(value) && DECIMAL_ONLY.test(value)) ||
          value === "" ||
          value === "-"
        ) {
          onChange(value);
        }
      }}
    />
  );
}
