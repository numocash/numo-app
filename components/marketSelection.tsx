import LoadingBox from "./loadingBox";
import MarketSearch from "./marketSearch";
import TokenIcon from "./tokenIcon";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type SelectTokenProps = Pick<
  React.ComponentProps<typeof MarketSearch>,
  "onSelect" | "markets" | "selectedMarket"
>;

export default function MarketSelection({
  onSelect,
  markets,
  selectedMarket,
}: SelectTokenProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MarketSearch
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        markets={markets}
        selectedMarket={selectedMarket}
      />
      <button
        type="button"
        className="rounded-xl border-2 border-gray-200 bg-white w-full max-w-lg h-20 flex items-center p-6 gap-2 justify-between"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <TokenIcon tokenInfo={selectedMarket.base} size={32} />
            <TokenIcon tokenInfo={selectedMarket.quote} size={32} />
          </div>
          <p className="p1">
            {selectedMarket.base.symbol} / {selectedMarket.quote.symbol}
          </p>
        </div>
        <div className="w-1/3 transform animate-pulse duration-3000 ease-in-out border-b-2 border-gray-200 border-dashed" />
        <div className="flex items-center gap-2">
          <LoadingBox className=" bg-gray-200" />
          <FaChevronDown />
        </div>
      </button>
    </>
  );
}
