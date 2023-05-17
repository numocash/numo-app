import CenterSwitch from "../CenterSwitch";
import AsyncButton from "../core/asyncButton";
import CurrencyAmountDisplay from "../currencyAmountDisplay";
import Slider from "../slider";
import { useSettings } from "@/contexts/settings";
import { useMintAmount } from "@/hooks/useAmounts";
import { useBalances } from "@/hooks/useBalances";
import { isV3, useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import { useMint } from "@/hooks/useMint";
import { useUniswapPositionsGamma } from "@/hooks/useUniswapV3";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { calculateAccrual } from "@/lib/amounts";
import { ONE_HUNDRED_PERCENT, scale } from "@/lib/constants";
import { fractionToPrice, priceToFraction } from "@/lib/price";
import { useHedge } from "@/pages/hedge-uniswap/[token0]/[token1]";
import { Beet } from "@/utils/beet";
import { CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export default function Add() {
  const { address } = useAccount();
  const settings = useSettings();
  const { lendgines, market, selectedLendgine } = useHedge();
  const lendginesQuery = useLendgines(lendgines);
  const balancesQuery = useBalances(
    useMemo(() => lendgines.map((l) => l.lendgine), [lendgines]),
    address,
  );
  const priceQuery = useMostLiquidMarket(market);
  const gammaQuery = useUniswapPositionsGamma(address, market);

  const { currentGamma, hedge, maxSlide, minSlide } = useMemo(() => {
    if (!priceQuery.data || !balancesQuery.data || !lendginesQuery.data)
      return {};
    const currentGamma = balancesQuery.data!.reduce((acc, cur, i) => {
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
    if (gammaQuery.status !== "success") return { currentGamma };

    const hedge = gammaQuery.gamma.equalTo(0)
      ? new Percent(0)
      : new Percent(
          currentGamma.divide(gammaQuery.gamma).numerator,
          currentGamma.divide(gammaQuery.gamma).denominator,
        );

    const maxSlide = hedge.greaterThan(new Percent(1))
      ? +hedge.toFixed(0)
      : 100;

    const minSlide = hedge.greaterThan(new Percent(0))
      ? Math.ceil(+hedge.toFixed(2))
      : 0;

    return { currentGamma, hedge, maxSlide, minSlide };
  }, [priceQuery.data, balancesQuery.data, lendgines]);
  const [hedgePercent, setHedgePercent] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    !!maxSlide && hedgePercent === undefined && setHedgePercent(maxSlide);
  }, [maxSlide]);

  // determine the ideal gamma from the hedge percent
  const { amountIn } = useMemo(() => {
    if (
      gammaQuery.status !== "success" ||
      hedgePercent === undefined ||
      !lendginesQuery.data ||
      !currentGamma ||
      !priceQuery.data ||
      hedgePercent > 100 ||
      gammaQuery.gamma.equalTo(0)
    )
      return {};

    const idealGamma = gammaQuery.gamma
      .multiply(Math.floor(hedgePercent))
      .divide(100);
    const deltaGamma = idealGamma.subtract(currentGamma);

    const liquidity = CurrencyAmount.fromRawAmount(
      selectedLendgine.lendgine,
      deltaGamma.divide(2).multiply(scale).quotient,
    );
    const index = lendgines.findIndex(
      (l) => l.address === selectedLendgine.address,
    )!;

    // convert liquidity to balance
    const accruedLendgineInfo = calculateAccrual(
      selectedLendgine,
      lendginesQuery.data[index]!,
      "pmmp",
    );

    const shares = accruedLendgineInfo.totalLiquidityBorrowed.equalTo(0)
      ? liquidity
      : liquidity
          .multiply(accruedLendgineInfo.totalSupply)
          .divide(accruedLendgineInfo.totalLiquidityBorrowed);

    const collateral = fractionToPrice(
      priceToFraction(lendgines[index]!.bound).multiply(2),
      lendgines[index]!.lendgine,
      lendgines[index]!.token1,
    ).quote(liquidity);

    const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
      lendgines[index]!,
      lendginesQuery.data[index]!,
      liquidity,
    );

    // determine value
    const dexFee = isV3(priceQuery.data.pool)
      ? new Percent(priceQuery.data.pool.feeTier, "1000000")
      : new Percent("3000", "1000000");

    // token1
    const expectedSwapOutput = priceQuery.data.price
      .invert()
      .quote(amount0)
      .multiply(ONE_HUNDRED_PERCENT.subtract(dexFee))
      .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent));

    const amountIn = collateral.subtract(amount1.add(expectedSwapOutput));

    return { shares, amountIn };
  }, [
    gammaQuery,
    hedgePercent,
    lendginesQuery,
    currentGamma,
    selectedLendgine,
    lendgines,
  ]);

  const mintAmounts = useMintAmount(selectedLendgine, amountIn, "pmmp");
  const mint = useMint(selectedLendgine, amountIn, "pmmp");

  const disableReason = useMemo(
    () =>
      hedgePercent === undefined
        ? "Loading"
        : hedgePercent === 0
        ? "Slide to amount"
        : !hedge || gammaQuery.status !== "success"
        ? "Loading"
        : gammaQuery.gamma.equalTo(0)
        ? "Deposit in Uniswap first"
        : hedge.greaterThan(new Percent(1))
        ? "Remove hedge"
        : mintAmounts.status !== "success" ||
          mint.status !== "success" ||
          !lendginesQuery.data
        ? "Loading"
        : mintAmounts.liquidity.greaterThan(
            lendginesQuery.data[
              lendgines.findIndex(
                (l) => l.address === selectedLendgine.address,
              )!
            ]!.totalLiquidity,
          )
        ? "Insufficient liqudity"
        : null,
    [hedgePercent, hedge],
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col rounded-xl border-2 border-gray-200 bg-white">
        <div className=" flex h-20 w-full flex-col justify-center gap-2 px-6 py-2">
          <Slider
            label="Hedge"
            input={hedgePercent ?? 0}
            onChange={setHedgePercent}
            max={maxSlide}
            min={minSlide}
          />
        </div>
        <div className=" w-full border-b-2 border-gray-200" />
        <CenterSwitch icon="arrow" />
        <CurrencyAmountDisplay
          label="Input"
          amount={
            amountIn ?? CurrencyAmount.fromRawAmount(selectedLendgine.token1, 0)
          }
        />
      </div>
      <AsyncButton
        variant="primary"
        className="h-12 items-center text-xl font-bold"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(mint.data);
          await Beet(mint.data);
        }}
      >
        {disableReason ?? "Add hedge"}
      </AsyncButton>
    </div>
  );
}
