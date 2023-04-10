import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { clsx } from "clsx";
import { useState } from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { AssetSelectButton } from "./AssetSelection";
import SelectTokenDialog from "./SelectTokenDialog";
import { TokenIcon } from "./TokenIcon";

interface Props {
  selectedToken?: WrappedTokenInfo;
  onSelect: (val: WrappedTokenInfo) => void;
  tokens?: readonly WrappedTokenInfo[];
}

export const TokenSelection: React.FC<Props> = ({
  selectedToken,
  onSelect,
  tokens,
}: Props) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <SelectTokenDialog
        className={clsx("w-full rounded-xl")}
        isOpen={show}
        onDismiss={() => setShow(false)}
        selectedToken={selectedToken}
        onSelect={(token) => {
          onSelect(token);
          setShow(false);
        }}
        tokens={tokens}
      />
      <div className={"flex relative py-0 rounded-xl"}>
        <div>
          <AssetSelectButton
            onClick={() => {
              setShow(true);
            }}
            noAsset={!selectedToken}
          >
            {!selectedToken ? (
              <div className={"flex p-1.5 space-x-2 items-center"}>
                <div className="text-lg font-semibold leading-none text-white">
                  Select a token
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <TokenIcon size={24} token={selectedToken} />
                <div className="mr-1 space-y-1">
                  <div className="text-xl font-semibold leading-none">
                    {selectedToken.symbol}
                  </div>
                </div>
              </div>
            )}
            {!selectedToken ? (
              <div className="flex items-center ml-2 text-sm text-white">
                <FontAwesomeIcon fixedWidth icon={faChevronDown} />
              </div>
            ) : null}
          </AssetSelectButton>
        </div>
      </div>
    </>
  );
};
