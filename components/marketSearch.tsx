import Dialog from "./core/dialog";
import TokenIcon from "./tokenIcon";
import { marketEqual } from "@/lib/lendgineValidity";
import { Market } from "@/lib/types/market";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useDebounce } from "use-debounce";

export default function MarketSearch({
  markets,
  selectedMarket,
  onSelect,
  open,
  onClose,
}: {
  markets: readonly Market[];
  selectedMarket: Market;
  onSelect: (val: Market) => void;
} & Omit<React.ComponentProps<typeof Dialog>, "content">) {
  const [query, setQuery] = useState("");
  const [queryDebounced] = useDebounce(query, 200, {
    leading: true,
  });

  const fuse = useMemo(
    () =>
      new Fuse(markets ?? [], {
        keys: ["base.name", "base.symbol", "quote.name", "quote.symbol"],
      }),
    [markets],
  );

  const results = useMemo(() => {
    const searchResults = fuse.search(queryDebounced).map((r) => r.item);
    return query.length === 0 ? markets ?? [] : searchResults;
  }, [fuse, queryDebounced, query.length, markets]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      content={
        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-clip">
          <div className="flex h-16 w-full items-center gap-4 px-6">
            <FiSearch size={24} />
            <input
              className="p1 w-full flex-grow appearance-none rounded-lg bg-transparent px-2 py-1 placeholder:text-secondary"
              autoComplete="off"
              placeholder={"Search markets..."}
              type={"text"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full border-b-2 border-gray-200 overflow-clip" />
          <ScrollArea.Root className=" h-[300px] overflow-clip">
            <ScrollArea.Viewport className="w-full h-full overflow-clip">
              <ul className="flex w-full flex-col   gap-1 p-4">
                {results.map((r) => (
                  <button
                    key={`${r.quote.address}_${r.base.address}`}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-xl p-1 text-left h-14",
                      marketEqual(selectedMarket, r)
                        ? "opacity-50"
                        : "hover:bg-gray-200",
                    )}
                    onClick={() => {
                      onSelect(r);
                      onClose();
                    }}
                    type="button"
                    disabled={marketEqual(selectedMarket, r)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <TokenIcon tokenInfo={r.base} size={32} />
                        <TokenIcon tokenInfo={r.quote} size={32} />
                      </div>
                      <p className="p1">
                        {r.base.symbol} / {r.quote.symbol}
                      </p>
                    </div>
                    {marketEqual(selectedMarket, r) && (
                      <FiCheck className="text-brand" size={24} />
                    )}
                  </button>
                ))}
              </ul>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-white transition-colors duration-[160ms] ease-out hover:bg-black data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-200 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
            {/* <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-gray-200 transition-colors duration-[160ms] ease-out hover:bg-black data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-200 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar> */}
            <ScrollArea.Corner className="bg-black" />
          </ScrollArea.Root>
        </div>
      }
    />
  );
}
