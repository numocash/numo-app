import type { CSSProperties } from "react";
import React, { useCallback, useRef } from "react";
import { useVirtual } from "react-virtual";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { TokenItem } from "./TokenItem";

interface Props {
  // results: readonly {
  //   token: WrappedTokenInfo;
  //   balance: CurrencyAmount<WrappedTokenInfo>;
  //   hasBalance: boolean;
  // }[];
  results: readonly WrappedTokenInfo[];
  selectedToken?: WrappedTokenInfo;
  onSelect?: (token: WrappedTokenInfo) => void;
}

export const TokenResults: React.FC<Props> = ({
  results,
  onSelect,
  selectedToken,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // const sortedResults = useMemo(() => {
  //   const [hasBalance, hasNoBalance] = partition(results, (r) => r.hasBalance);
  //   return hasBalance.concat(hasNoBalance);
  // }, [results]);

  const rowVirtualizer = useVirtual({
    paddingStart: 8,
    paddingEnd: 8,
    size: results.length,
    parentRef,
    estimateSize: useCallback(() => 56, []),
    overscan: 5,
  });

  const Row = useCallback(
    ({
      token,
      // index,
      style,
    }: {
      token: WrappedTokenInfo | undefined;
      index: number;
      style: CSSProperties;
    }) => {
      if (!token) return null;

      return (
        <TokenItem
          style={style}
          onClick={() => onSelect?.(token)}
          token={token}
          isSelected={selectedToken && token.equals(selectedToken)}
        />
      );
    },
    [onSelect, selectedToken]
  );

  return (
    <div className="w-full h-full overflow-auto" ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <Row
            index={virtualRow.index}
            key={virtualRow.index}
            token={results[virtualRow.index]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
