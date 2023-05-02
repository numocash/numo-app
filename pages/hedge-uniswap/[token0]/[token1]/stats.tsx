import { useHedge } from ".";
import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { invert } from "@/lib/price";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";

export default function Stats() {
  const { lendgines, market } = useHedge();
  const lendginesQuery = useLendgines(lendgines);
  const priceQuery = useMostLiquidMarket(market);

  const tvl = useMemo(() => {
    if (!priceQuery.data || !lendginesQuery.data) return undefined;
    return lendgines.reduce((acc, cur, i) => {
      const inverse = !cur.token0.equals(market.quote);
      const { collateral, liquidity } = calculateEstimatedBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        lendginesQuery.data![i]!.totalSupply,
        "pmmp",
      );
      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        liquidity,
      );

      // token0 / token1
      const price = inverse
        ? invert(priceQuery.data.price)
        : priceQuery.data.price;

      // token0
      const value = price
        .quote(collateral)
        .subtract(amount0.add(price.quote(amount1)));

      return acc.add(inverse ? priceQuery.data.price.quote(value) : value);
    }, CurrencyAmount.fromRawAmount(market.quote, 0));
  }, [lendgines, lendginesQuery.data, market.quote, priceQuery.data]);

  return (
    <MainStats
      items={
        [
          {
            label: "Total deposited",
            item: tvl ? (
              <TokenAmountDisplay amount={tvl} showSymbol />
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "Est. APR",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "Balance",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
          {
            label: "IL hedge",
            item: <LoadingBox className="h-10 w-20 bg-gray-300" />,
          },
        ] as const
      }
    />
  );
}
