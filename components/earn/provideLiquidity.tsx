import EarnCard from "./earnCard";
import LoadingBox from "@/components/loadingBox";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import {
  calculateAccrual,
  calculateEstimatedPairBurnAmount,
  calculateEstimatedWithdrawAmount,
} from "@/lib/amounts";
import { scale } from "@/lib/constants";
import { calculateSupplyRate } from "@/lib/jumprate";
import { fractionToPrice, priceToFraction } from "@/lib/price";
import type { Lendgine } from "@/lib/types/lendgine";
import { formatPercent } from "@/utils/format";
import { CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { clsx } from "clsx";
import { useMemo } from "react";

interface Props {
  lendgines: readonly Lendgine[];
  protocol: Protocol;
}

export default function ProvideLiquidity({ lendgines, protocol }: Props) {
  const token0 = lendgines[0]!.token0;
  const token1 = lendgines[0]!.token1;

  const lendginesQuery = useLendgines(lendgines);
  const priceQuery = useMostLiquidMarket({
    quote: token0,
    base: token1,
  });
  const tvl = useMemo(() => {
    if (!priceQuery.data || !lendginesQuery.data) return undefined;
    return lendgines.reduce((acc, cur, i) => {
      const { liquidity } = calculateEstimatedWithdrawAmount(
        cur,
        lendginesQuery.data![i]!,
        { size: lendginesQuery.data![i]!.totalPositionSize },
        protocol,
      );
      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        liquidity,
      );
      const value = amount0.add(priceQuery.data.price.quote(amount1));

      return acc.add(value);
    }, CurrencyAmount.fromRawAmount(token0, 0));
  }, [lendgines, lendginesQuery.data, priceQuery.data, protocol, token0]);

  const bestAPR = useMemo(() => {
    if (!priceQuery.data || !lendginesQuery.data) return undefined;

    return lendgines.reduce((acc, cur, i) => {
      const liquidity = CurrencyAmount.fromRawAmount(cur.lendgine, scale);
      const collateral = fractionToPrice(
        priceToFraction(cur.bound).multiply(2),
        cur.lendgine,
        cur.token1,
      ).quote(liquidity);

      const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
        cur,
        lendginesQuery.data![i]!,
        liquidity,
      );

      const ptValue = priceQuery.data.price
        .quote(collateral)
        .subtract(amount0.add(priceQuery.data.price.quote(amount1)));

      const lpValue = amount0.add(priceQuery.data.price.quote(amount1));

      const f = lpValue.equalTo(0) ? new Fraction(1) : ptValue.divide(lpValue);

      const accruedInfo = calculateAccrual(
        cur,
        lendginesQuery.data![i]!,
        protocol,
      );
      const supplyRate = calculateSupplyRate({
        lendgineInfo: accruedInfo,
        protocol,
      }).multiply(new Percent(f.numerator, f.denominator));
      return supplyRate.greaterThan(acc) ? supplyRate : acc;
    }, new Percent(0));
  }, [lendgines, lendginesQuery.data, protocol]);

  return (
    <EarnCard
      to={`provide-liquidity/${protocol}/${token0.address}/${token1.address}`}
    >
      <div
        className={clsx("h-24 w-full p-2")}
        style={{
          backgroundImage: `linear-gradient(to top right, ${
            token0.color?.muted ?? "#dfdfdf"
          }, ${token1.color?.vibrant ?? "#dfdfdf"})`,
        }}
      >
        <p className="p2 w-fit rounded-lg bg-white bg-opacity-50 p-2">
          Provide liquidity
        </p>
      </div>
      <div className="relative left-[8px] top-[-32px] flex w-fit items-center rounded-lg bg-white p-2">
        <TokenIcon tokenInfo={token0} size={48} />
        <TokenIcon tokenInfo={token1} size={48} />
      </div>

      <div className="-mt-8 flex flex-col gap-4  p-4">
        <h2 className="">
          {token0.symbol} + {token1.symbol}
        </h2>
        <div className="flex flex-col ">
          <p className="p5">Max APR</p>
          <p className="p1 text-green">
            {bestAPR ? formatPercent(bestAPR) : <LoadingBox />}
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
