import { clsx } from "clsx";
import React from "react";

interface IProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  onChange?: (val: string) => void;
  hasBackground?: boolean;
  integerOnly?: boolean;
}

const DIGIT_ONLY = /^(\d)*$/;
const DECIMAL_ONLY = /^-?\d*(\.\d*)?$/;

export const BigNumericInput: React.FC<IProps> = ({
  onChange,
  integerOnly,
  ...rest
}: IProps) => (
  <input
    {...rest}
    className={clsx(
      "active:(border-none outline-none) border-none outline-none",
      "w-100 flex-auto overflow-hidden text-ellipsis text-[#8f8f8f]",
      "placeholder:color-[#888]"
    )}
    style={{
      fontWeight: "400",
      fontSize: "24px",
      padding: "0px",
    }}
    inputMode="decimal"
    autoComplete="off"
    autoCorrect="off"
    type="text"
    spellCheck="false"
    // style={{ borderWidth: "0px" }}
    onChange={(e) => {
      const { value } = e.target;
      if (integerOnly) {
        if (
          value === "" ||
          (DIGIT_ONLY.test(value) && !Number.isNaN(parseInt(value)))
        ) {
          onChange?.(value);
        }
        return;
      }
      if (
        (!Number.isNaN(value) && DECIMAL_ONLY.test(value)) ||
        value === "" ||
        value === "-"
      ) {
        onChange?.(value);
      }
    }}
  />
);
