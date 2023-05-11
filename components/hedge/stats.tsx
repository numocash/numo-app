import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import { useBalances } from "@/hooks/useBalances";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import { useUniswapPositionsGamma } from "@/hooks/useUniswapV3";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { scale } from "@/lib/constants";
import { calculateBorrowRate } from "@/lib/jumprate";
import { invert } from "@/lib/price";
import { useHedge } from "@/pages/hedge-uniswap/[token0]/[token1]";
import { formatPercent } from "@/utils/format";
import { CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export default function Stats() {
  const { address } = useAccount();
  const { lendgines, market, selectedLendgine } = useHedge();
  const lendginesQuery = useLendgines(lendgines);
  const balancesQuery = useBalances(
    useMemo(() => lendgines.map((l) => l.lendgine), [lendgines]),
    address,
  );
  const priceQuery = useMostLiquidMarket(market);
  const gammaQuery = useUniswapPositionsGamma(address, market);

  const borrowRate = useMemo(() => {
    if (!lendginesQuery.data) return undefined;
    const index = lendgines.findIndex(
      (l) => l.address === selectedLendgine.address,
    );
    const lendgineInfo = lendginesQuery.data[index]!;
    return calculateBorrowRate({ lendgineInfo, protocol: "pmmp" });
  }, [lendgines, lendginesQuery.data, selectedLendgine]);

  const gamma = useMemo(() => {
    if (!priceQuery.data || !balancesQuery.data || !lendginesQuery.data)
      return undefined;
    return balancesQuery.data!.reduce((acc, cur, i) => {
      const lendgine = lendgines[i]!;
      const lendgineInfo = lendginesQuery.data![i]!;

      if (priceQuery.data!.price.greaterThan(lendgine.bound)) return acc;

      // TODO: do we need to adjust for decimals
      const { liquidity } = calculateEstimatedBurnAmount(
        lendgine,
        lendgineInfo,
        cur,
        "pmmp",
      );

      return acc.add(new Fraction(2).multiply(liquidity).divide(scale));
    }, new Fraction(0));
  }, [priceQuery.data, balancesQuery.data, lendgines]);

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

  const userBalance = useMemo(() => {
    if (!priceQuery.data || !lendginesQuery.data || !balancesQuery.data)
      return undefined;
    return lendgines.reduce((acc, cur, i) => {
      const inverse = !cur.token0.equals(market.quote);
      const { collateral, liquidity } = calculateEstimatedBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        balancesQuery.data![i]!,
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
            label: "Funding APR",
            item: borrowRate ? (
              formatPercent(borrowRate)
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "Balance",
            item: userBalance ? (
              <TokenAmountDisplay amount={userBalance} showSymbol />
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "IL hedge",
            item:
              gammaQuery.status === "success" &&
              !!gamma &&
              !gammaQuery.gamma.equalTo(0) ? (
                formatPercent(
                  new Percent(
                    gamma.divide(gammaQuery.gamma).numerator,
                    gamma.divide(gammaQuery.gamma).denominator,
                  ),
                )
              ) : (
                <LoadingBox className="h-10 w-20 bg-gray-300" />
              ),
          },
        ] as const
      }
    />
  );
}
