import Button from "./core/button";
import NumberInput from "./core/numberInput";
import TokenInfo from "./tokenInfo";
import TokenSearch from "./tokenSearch";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type InputProps = Pick<
  React.ComponentProps<typeof NumberInput>,
  "value" | "onChange"
>;

type DisplayTokenProps = {
  selectedToken: React.ComponentProps<typeof TokenInfo>["token"];
};

type SelectTokenProps = Pick<
  React.ComponentProps<typeof TokenSearch>,
  "onSelect" | "tokens" | "selectedToken"
>;
export default function CurrencyAmountSelection(
  props:
    | (InputProps & DisplayTokenProps & { type: "display" })
    | (InputProps & SelectTokenProps & { type: "select" }),
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
      <div className="flex h-20  w-full items-center justify-between gap-1 px-2 pl-4">
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
    </>
  );
}
