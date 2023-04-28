import Fuse from "fuse.js";
import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { SearchInput } from "./SearchInput";
import { TokenResults } from "./TokenResults";
import { LoadingSpinner } from "../LoadingSpinner";

interface TokenSearchProps {
  isOpen: boolean;
  tokens?: readonly WrappedTokenInfo[];

  onSelect?: (value: WrappedTokenInfo) => void;
  selectedToken?: WrappedTokenInfo;
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
  isOpen,
  tokens,
  onSelect,
  // showManageView,
  selectedToken,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // const { address } = useAccount();

  const [searchQueryDebounced] = useDebounce(searchQuery, 200, {
    leading: true,
  });
  // const debouncedQueryKey = getAddress(searchQueryDebounced);
  // const searchToken = useToken2(debouncedQueryKey);

  // const userTokenBalances = useBalances(tokens, address);

  // const tokensWithBalances = useMemo(
  //   () =>
  //     !tokens
  //       ? []
  //       : userTokenBalances.data
  //       ? zip(userTokenBalances.data, tokens)
  //           .map(([tokenBalance, t]) => {
  //             invariant(t, "token");

  //             const balance = tokenBalance;
  //             if (balance) {
  //               return { token: t, balance, hasBalance: !balance.equalTo("0") };
  //             }
  //             return {
  //               token: t,
  //               balance: CurrencyAmount.fromRawAmount(t, 0),
  //               hasBalance: false,
  //             };
  //           })
  //           .sort((a, b) => {
  //             if (!a.hasBalance && b.hasBalance) {
  //               return 1;
  //             } else if (a.hasBalance && !b.hasBalance) {
  //               return -1;
  //             } else if (a.hasBalance && b.hasBalance) {
  //               return a.balance.greaterThan(b.balance) ? -1 : 1;
  //             } else {
  //               if (a.token.symbol > b.token.symbol) {
  //                 return 1;
  //               } else {
  //                 return -1;
  //               }
  //             }
  //           })
  //       : address === null
  //       ? tokens.map((t) => ({
  //           token: t,
  //           balance: CurrencyAmount.fromRawAmount(t, 0),
  //           hasBalance: false,
  //         }))
  //       : [],
  //   [userTokenBalances, tokens, address]
  // );

  const fuse = useMemo(
    () =>
      new Fuse(tokens ?? [], {
        keys: ["address", "name", "symbol"],
      }),
    [tokens]
  );

  const { results } = useMemo(() => {
    const searchResults = fuse.search(searchQueryDebounced).map((r) => r.item);

    return searchQuery.length === 0
      ? { results: tokens ?? [] }
      : { results: searchResults };
  }, [fuse, searchQueryDebounced, searchQuery.length, tokens]);

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  return (
    <div className={"relative flex flex-1 flex-col p-0"}>
      {/*<div*/}
      {/*  onClick={onDismiss}*/}
      {/*  className="fixed inset-0 bg-black bg-opacity-75"*/}
      {/*  aria-hidden="true"*/}
      {/*/>*/}

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-default">
            Select a token
          </div>
        </div>
        <div>
          <SearchInput
            onChange={(value) => setSearchQuery(value)}
            searchQuery={searchQuery}
            onClear={() => setSearchQuery("")}
          />
          {/* <FavoriteTokens onSelect={(token) => onSelect?.(token)} /> */}
        </div>
      </div>

      <div className={"flex-1 overflow-y-scroll"}>
        {(results.length === 0 || !tokens) && (
          <div className={"flex w-full items-center justify-center p-8"}>
            <LoadingSpinner />
          </div>
        )}
        {/* {!loading && results.length === 0 && !searchToken && (
          <div className="py-[3rem]">
            <div className="text-center">Nothing Found</div>
          </div>
        )} */}

        {results.length > 0 && (
          <TokenResults
            selectedToken={selectedToken}
            results={results}
            onSelect={onSelect}
          />
        )}
      </div>
      <div className="flex justify-between bg-white p-4 py-2 text-default">
        <div className="text-sm">{results.length} Tokens</div>
        <div className="flex items-center space-x-1.5">
          <div className="text-sm font-semibold">Numoen Token Browser</div>
        </div>
      </div>
    </div>
  );
};
