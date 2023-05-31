import EarnCard from "./earnCard";
import CurrencyAmountDisplay from "@/components/currencyAmountDisplay";
import CurrencyIcon from "@/components/currencyIcon";
import LoadingBox from "@/components/loadingBox";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import {
  calculateAccrual,
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { calculateBorrowRate } from "@/lib/jumprate";
import {
  fractionToPrice,
  invert,
  nextHighestLendgine,
  nextLowestLendgine,
  priceToFraction,
} from "@/lib/price";
import type { Lendgine } from "@/lib/types/lendgine";
import type { Market } from "@/lib/types/market";
import { formatPercent } from "@/utils/format";
import { CurrencyAmount } from "@uniswap/sdk-core";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
  lendgines: Lendgine[];
  market: Market;
}

export default function HedgeUniswap({ lendgines, market }: Props) {
  const lendginesQuery = useLendgines(lendgines);
  const priceQuery = useMostLiquidMarket(market);

  const borrowRate = useMemo(() => {
    if (!priceQuery.data?.price || lendginesQuery.some((d) => !d.data))
      return undefined;

    const lh = nextHighestLendgine({
      price: fractionToPrice(
        priceToFraction(priceQuery.data.price).multiply(3).divide(2),
        market.base,
        market.quote,
      ),
      lendgines,
    });
    const l = nextHighestLendgine({
      price: priceQuery.data.price,
      lendgines,
    });
    const ll = nextLowestLendgine({
      price: priceQuery.data.price,
      lendgines,
    });
    const selectedLendgine = lh ?? l ?? ll ?? lendgines[0]!;

    const index = lendgines.findIndex(
      (l) => l.address === selectedLendgine.address,
    )!;

    const accruedInfo = calculateAccrual(
      selectedLendgine,
      lendginesQuery[index]!.data!,
      "pmmp",
    );

    const borrowRate = calculateBorrowRate({
      lendgineInfo: accruedInfo,
      protocol: "pmmp",
    });

    return borrowRate;
  }, [priceQuery.data?.price, lendginesQuery, lendgines]);

  const tvl = useMemo(() => {
    if (!priceQuery.data?.price || lendginesQuery.some((d) => !d.data))
      return undefined;
    return lendgines.reduce((acc, cur, i) => {
      const inverse = !cur.token0.equals(market.quote);
      const { collateral, liquidity } = calculateEstimatedBurnAmount(
        cur,
        lendginesQuery[i]!.data!,
        lendginesQuery[i]!.data!.totalSupply,
        "pmmp",
      );
      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery[i]!.data!,
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
  }, [lendgines, lendginesQuery, market.quote, priceQuery.data]);

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
        <CurrencyIcon currency={market.quote} size={48} />
        <CurrencyIcon currency={market.base} size={48} />
      </div>

      <div className="-mt-8 flex flex-col gap-4  p-4">
        <h2 className="">
          {market.quote.symbol} + {market.base.symbol}
        </h2>
        <div className="flex flex-col ">
          <p className="p5">Funding APR</p>
          <p className="p1 text-green-500 ">
            {borrowRate ? formatPercent(borrowRate) : <LoadingBox />}
          </p>
        </div>
        <div className="flex flex-col ">
          <p className="p5">TVL</p>
          <p className="p1">
            {tvl ? (
              <CurrencyAmountDisplay amount={tvl} showSymbol />
            ) : (
              <LoadingBox />
            )}
          </p>
        </div>
      </div>
    </EarnCard>
  );
}
