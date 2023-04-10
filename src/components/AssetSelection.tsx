import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { clsx } from "clsx";
import React, { useState } from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { BigNumericInput } from "./BigNumericInput";
import SelectTokenDialog from "./SelectTokenDialog";
import { TokenAmountDisplay } from "./TokenAmountDisplay";
import { TokenIcon } from "./TokenIcon";

export const AssetSelectButton = styled.button(
  ({ noAsset }: { noAsset?: boolean }) => [
    tw`relative flex items-center justify-between flex-none px-2 text-left`,
    tw`text-base appearance-none cursor-pointer`,
    tw`whitespace-nowrap`,
    tw`shadow-none`,
    noAsset && tw`text-white bg-black rounded-lg`,
  ]
);

const Accent = styled.span<{ onClick?: () => void }>`
  margin-left: 0.5em;

  ${({ onClick }) =>
    onClick !== undefined &&
    css`
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    `}
`;

const Balance = styled.div(tw`flex items-center`);

const Section = styled.div(tw`flex items-center justify-between`);

// const DEFAULT_TOKEN_DECIMALS = 3;

type Props<T extends WrappedTokenInfo> = {
  tokens?: readonly T[];
  onSelect?: (token: T) => void;
  selectedValue: T | null;
  inputOnChange?: (val: string) => void;
  inputValue?: string;
  hideInput?: boolean;
  inputDisabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  currentAmount?: {
    amount?: CurrencyAmount<T>;
    allowSelect?: boolean;
    label?: string;
  };
};

export const AssetSelection: React.FC<Props<WrappedTokenInfo>> = ({
  onSelect,
  selectedValue,
  inputValue,
  className,
  inputDisabled = false,
  hideInput = false,
  inputOnChange,
  label,
  currentAmount,
  tokens,
}: Props<WrappedTokenInfo>) => {
  // const { width } = useWindowDimensions();

  // const uiDecimals =
  //   width < 600 ? 4 : selectedValue?.decimals ?? DEFAULT_TOKEN_DECIMALS;

  const token = selectedValue;

  const [show, setShow] = useState(false);

  // const disp

  return (
    <div className={clsx(className, "flex flex-col w-full px-2 pt-2")}>
      <>
        <Section>
          <div className="text-xs text-secondary">{label}</div>
          <div className="flex text-xs text-secondary">
            {selectedValue &&
              (currentAmount && !hideInput ? (
                <Balance>
                  <span>{currentAmount.label ?? "Balance"}:</span>
                  <Accent
                    onClick={
                      currentAmount.allowSelect && inputOnChange
                        ? () => {
                            if (
                              !currentAmount.amount ||
                              currentAmount.amount.equalTo("0")
                            ) {
                              inputOnChange("0");
                              return;
                            }
                            inputOnChange(currentAmount.amount.toExact());
                          }
                        : undefined
                    }
                  >
                    <TokenAmountDisplay
                      className="text-black "
                      amount={
                        currentAmount.amount ??
                        CurrencyAmount.fromRawAmount(selectedValue, 0)
                      }
                      // locale="en-US"
                      // numberFormatOptions={{
                      //   minimumFractionDigits: uiDecimals,
                      //   maximumFractionDigits: uiDecimals,
                      // }}
                    />
                  </Accent>
                </Balance>
              ) : (
                <div />
              ))}
          </div>
        </Section>
      </>
      <div className="flex items-center w-full gap-3">
        <div>
          <SelectTokenDialog
            className="w-full rounded-xl"
            isOpen={show}
            onDismiss={() => setShow(false)}
            selectedToken={selectedValue ?? undefined}
            onSelect={(token) => {
              onSelect?.(token);
              setShow?.(false);
            }}
            tokens={tokens}
          />
          <div className={"flex relative py-0 rounded-xl"}>
            <div>
              <AssetSelectButton
                onClick={() => {
                  if (onSelect) {
                    setShow(true);
                  }
                }}
                noAsset={!token}
              >
                {!token ? (
                  <div className={"flex p-1.5 space-x-2 items-center"}>
                    <div className="text-lg font-semibold leading-none text-white">
                      Select a token
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <TokenIcon size={24} token={token} />
                    <div className="mr-1 space-y-1">
                      <div className="text-xl font-semibold leading-none">
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                )}

                {onSelect &&
                  (!token ? (
                    <div className="flex items-center ml-2 text-sm text-white">
                      <FontAwesomeIcon fixedWidth icon={faChevronDown} />
                    </div>
                  ) : (
                    <div className="flex items-center ml-2 text-sm">
                      <FontAwesomeIcon fixedWidth icon={faChevronDown} />
                    </div>
                  ))}
              </AssetSelectButton>
            </div>
          </div>
        </div>
        {!hideInput && (
          <div className="flex flex-1 grow">
            <BigNumericInput
              className="w-full py-1 text-right text-black"
              disabled={inputDisabled}
              value={inputValue}
              onChange={inputOnChange}
              placeholder="0.0"
            />
          </div>
        )}
      </div>
    </div>
  );
};
