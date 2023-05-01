import { clsx } from "clsx";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useDebounce } from "use-debounce";

import type { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";

import Dialog from "./core/dialog";
import TokenInfo from "./tokenInfo";

export default function TokenSearch({
  tokens,
  selectedToken,
  onSelect,
  open,
  onClose,
}: {
  tokens: readonly WrappedTokenInfo[] | undefined;
  selectedToken: WrappedTokenInfo | undefined;
  onSelect: (val: WrappedTokenInfo) => void;
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
    [tokens]
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
        <div className="rounded-2xl border-2 border-gray-200 bg-white">
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
          <div className="w-full border-b-2 border-gray-200" />
          <ul className="flex w-full flex-col   gap-1 p-4">
            {results.map((r) => (
              <button
                key={r.address}
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl p-1 text-left",
                  selectedToken?.equals(r) ? "opacity-50" : "hover:bg-gray-200"
                )}
                onClick={() => {
                  onSelect(r);
                  onClose();
                }}
                disabled={selectedToken?.equals(r)}
              >
                <TokenInfo token={r} showName />
                {selectedToken?.equals(r) && (
                  <FiCheck className="text-[#3b82f6]" size={24} />
                )}
              </button>
            ))}
          </ul>
        </div>
      }
    />
  );
}
