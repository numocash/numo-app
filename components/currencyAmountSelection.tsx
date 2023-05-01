import Button from "./core/button";
import NumberInput from "./core/numberInput";
import TokenAmountDisplay from "./tokenAmountDisplay";
import TokenInfo from "./tokenInfo";
import TokenSearch from "./tokenSearch";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type InputProps = Pick<
  React.ComponentProps<typeof NumberInput>,
  "value" | "onChange"
>;
type LabelProps = {
  label?: string;
};
type DisplayTokenProps = {
  selectedToken: React.ComponentProps<typeof TokenInfo>["token"];
};
type SelectTokenProps = Pick<
  React.ComponentProps<typeof TokenSearch>,
  "onSelect" | "tokens" | "selectedToken"
>;
type CurrentAmountProps = {
  amount?: CurrencyAmount<Token>;
};

export default function CurrencyAmountSelection(
  props:
    | (InputProps &
        LabelProps &
        CurrentAmountProps &
        DisplayTokenProps & { type: "display" })
    | (InputProps &
        LabelProps &
        CurrentAmountProps &
        SelectTokenProps & { type: "select" }),
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {props.type === "select" && (
        <TokenSearch
          open={open}
          onClose={() => setOpen(false)}
          onSelect={props.onSelect}
          tokens={props.tokens}
          selectedToken={props.selectedToken}
        />
      )}
      <div className="w-full flex flex-col gap-0 items-center h-20 justify-center">
        <div className="flex w-full justify-between items-center px-4">
          <p className="p5">{props.label ?? ""}</p>
          {props.amount && (
            <p className="p5">
              Balance{" "}
              <button
                className="p4 hover:underline focus:underline"
                onClick={() => props.onChange(props.amount!.toExact())}
              >
                <TokenAmountDisplay amount={props.amount} showSymbol />
              </button>
            </p>
          )}
        </div>
        <div className="flex  w-full items-center justify-between gap-1 px-2 pl-4">
          {props.type === "display" ? (
            <TokenInfo token={props.selectedToken} showName={false} />
          ) : !props.selectedToken ? (
            <Button
              variant="primary"
              onClick={() => setOpen(true)}
              className="flex items-center space-x-2"
            >
              <p>Select</p>
              <FaChevronDown />
            </Button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center space-x-2 rounded-xl p-1 text-left"
            >
              <TokenInfo token={props.selectedToken} showName={false} />
              <FaChevronDown />
            </button>
          )}
          <NumberInput
            onChange={props.onChange}
            value={props.value}
            integerOnly={false}
            className="flex w-full max-w-[230px] text-2xl"
          />
        </div>
      </div>
    </>
  );
}
