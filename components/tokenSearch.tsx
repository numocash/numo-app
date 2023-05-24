import Dialog from "./core/dialog";
import TokenInfo from "./tokenInfo";
import { Token } from "@/lib/types/currency";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useDebounce } from "use-debounce";

export default function TokenSearch({
  tokens,
  selectedToken,
  onSelect,
  open,
  onClose,
}: {
  tokens: readonly Token[] | undefined;
  selectedToken: Token | undefined;
  onSelect: (val: Token) => void;
} & Omit<React.ComponentProps<typeof Dialog>, "content">) {
  const [query, setQuery] = useState("");
  const [queryDebounced] = useDebounce(query, 200, {
    leading: true,
  });

  const fuse = useMemo(
    () =>
      new Fuse(tokens ?? [], {
        keys: ["address", "name", "symbol"],
      }),
    [tokens],
  );

  const results = useMemo(() => {
    const searchResults = fuse.search(queryDebounced).map((r) => r.item);
    return query.length === 0 ? tokens ?? [] : searchResults;
  }, [fuse, queryDebounced, query.length, tokens]);

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
              placeholder={"Search name or token address..."}
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
                    key={r.address}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-xl p-1 text-left",
                      selectedToken?.equals(r)
                        ? "opacity-50"
                        : "hover:bg-gray-200",
                    )}
                    onClick={() => {
                      onSelect(r);
                      onClose();
                    }}
                    type="button"
                    disabled={selectedToken?.equals(r)}
                  >
                    <TokenInfo currency={r} showName />
                    {selectedToken?.equals(r) && (
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
