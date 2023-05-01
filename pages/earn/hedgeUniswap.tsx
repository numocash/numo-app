import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import Image from "next/image";
import { useMemo } from "react";

import LoadingBox from "@/components/loadingBox";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import TokenIcon from "@/components/tokenIcon";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { invert } from "@/lib/price";
import type { Lendgine } from "@/lib/types/lendgine";
import type { Market } from "@/lib/types/market";
import { formatPercent } from "@/utils/format";

import EarnCard from "./earnCard";

interface Props {
  lendgines: readonly Lendgine[];
  market: Market;
}

export default function HedgeUniswap({ lendgines, market }: Props) {
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
        "pmmp"
      );
      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        liquidity
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
    <EarnCard
      to={`hedge-uniswap/${market.quote.address}/${market.base.address}`}
    >
      <div className="grid h-24 w-full overflow-clip bg-gradient-to-tr from-[#fff] to-[#ff007a] p-2">
        <p className="p2 w-fit rounded-lg bg-white bg-opacity-50 p-2 ">
          Hedge Uniswap V3
        </p>
        <div className="w-full justify-end">
          <Image
            src="/uniswap.svg"
            height={100}
            width={100}
            className="relative -right-2/3 top-[-38px]"
            alt={"uniswap"}
          />
        </div>
      </div>
      <div className="relative left-[8px] top-[-32px] flex w-fit items-center rounded-lg bg-white p-2">
        <TokenIcon tokenInfo={market.quote} size={48} />
        <TokenIcon tokenInfo={market.base} size={48} />
      </div>

      <div className="-mt-8 flex flex-col gap-4  p-4">
        <h2 className="">
          {market.quote.symbol} + {market.base.symbol}
        </h2>
        <div className="flex flex-col ">
          <p className="p5">Est. APR</p>
          <p className="p1 text-green-500 ">
            {formatPercent(new Percent(34, 200))}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="p5">TVL</p>
          <p className="p1">
            {tvl ? (
              <TokenAmountDisplay amount={tvl} showSymbol />
            ) : (
              <LoadingBox />
            )}
          </p>
        </div>
      </div>
    </EarnCard>
  );
}
