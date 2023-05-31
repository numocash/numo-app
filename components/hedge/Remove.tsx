import CenterSwitch from "../CenterSwitch";
import AsyncButton from "../core/asyncButton";
import CurrencyAmountDisplay from "../currencyAmountRow";
import Slider from "../slider";
import { useBurnAmount } from "@/hooks/useAmounts";
import { useBalances } from "@/hooks/useBalances";
import { useBurn } from "@/hooks/useBurn";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgines } from "@/hooks/useLendgines";
import { useUniswapPositionsGamma } from "@/hooks/useUniswapV3";
import { calculateAccrual, calculateEstimatedBurnAmount } from "@/lib/amounts";
import { scale } from "@/lib/constants";
import { Token } from "@/lib/types/currency";
import { useHedge } from "@/pages/hedge-uniswap/[token0]/[token1]";
import { Beet } from "@/utils/beet";
import { CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export default function Remove() {
  const { address } = useAccount();
  const { lendgines, market, selectedLendgine } = useHedge();
  const lendginesQuery = useLendgines(lendgines);
  const balancesQuery = useBalances(
    useMemo(() => lendgines.map((l) => l.lendgine), [lendgines]),
    address,
  );
  const priceQuery = useMostLiquidMarket(market);
  const gammaQuery = useUniswapPositionsGamma(address, market);

  const { currentGamma, maxSlide } = useMemo(() => {
    if (
      !priceQuery.data ||
      balancesQuery.some((b) => !b.data) ||
      lendginesQuery.some((l) => l.data)
    )
      return {};
    const currentGamma = balancesQuery.reduce((acc, cur, i) => {
      const lendgine = lendgines[i]!;
      const lendgineInfo = lendginesQuery[i]!.data!;

      if (priceQuery.data!.price.greaterThan(lendgine.bound)) return acc;

      // TODO: do we need to adjust for decimals
      const { liquidity } = calculateEstimatedBurnAmount(
        lendgine,
        lendgineInfo,
        cur.data as CurrencyAmount<Token>,
        "pmmp",
      );

      return acc.add(new Fraction(2).multiply(liquidity).divide(scale));
    }, new Fraction(0));
    if (gammaQuery.status !== "success") return { currentGamma };

    const hedge = new Percent(
      currentGamma.divide(gammaQuery.gamma).numerator,
      currentGamma.divide(gammaQuery.gamma).denominator,
    );

    const maxSlide = hedge.equalTo(0)
      ? 100
      : hedge.greaterThan(new Percent(1))
      ? 100
      : +hedge.toFixed(0);

    return { currentGamma, hedge, maxSlide };
  }, [priceQuery.data, balancesQuery, lendginesQuery, lendgines]);
  const [hedgePercent, setHedgePercent] = useState<number | undefined>(
    undefined,
  );

  // determine the ideal gamma from the hedge percent
  const { withdrawShares } = useMemo(() => {
    if (
      gammaQuery.status !== "success" ||
      hedgePercent === undefined ||
      lendginesQuery.some((l) => !l.data) ||
      !currentGamma
    )
      return {};

    const idealGamma = gammaQuery.gamma
      .multiply(Math.floor(hedgePercent))
      .divide(100);
    const deltaGamma = currentGamma.subtract(idealGamma);

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
      lendginesQuery[index]!.data!,
      "pmmp",
    );

    const withdrawShares = accruedLendgineInfo.totalLiquidityBorrowed.equalTo(0)
      ? liquidity
      : liquidity
          .multiply(accruedLendgineInfo.totalSupply)
          .divide(accruedLendgineInfo.totalLiquidityBorrowed);

    return { withdrawShares };
  }, [
    gammaQuery,
    hedgePercent,
    lendginesQuery,
    currentGamma,
    selectedLendgine,
    lendgines,
  ]);

  const burnAmount = useBurnAmount(selectedLendgine, withdrawShares, "pmmp");
  const burn = useBurn(selectedLendgine, withdrawShares, "pmmp");

  useEffect(() => {
    !!maxSlide && hedgePercent === undefined && setHedgePercent(maxSlide);
  }, [maxSlide]);

  const disableReason = useMemo(
    () =>
      hedgePercent === undefined ||
      burn.status !== "success" ||
      !withdrawShares ||
      currentGamma === undefined ||
      balancesQuery.some((b) => !b.data)
        ? "Loading"
        : currentGamma.equalTo(0)
        ? "Insufficient balance"
        : withdrawShares.lessThan(0) ||
          withdrawShares.greaterThan(
            balancesQuery
              .map((b) => b.data!)
              .find((b) => b.currency.equals(selectedLendgine.lendgine))!,
          )
        ? "Slide to amount"
        : null,
    [hedgePercent, burn.status, withdrawShares, currentGamma, balancesQuery],
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
            min={0}
          />
        </div>
        <div className=" w-full border-b-2 border-gray-200" />
        <CenterSwitch icon="arrow" />
        <CurrencyAmountDisplay
          label="Output"
          amount={
            burnAmount.status === "success"
              ? burnAmount.collateral
              : CurrencyAmount.fromRawAmount(selectedLendgine.token1, 0)
          }
        />
      </div>
      <AsyncButton
        variant="primary"
        className="h-12 items-center text-xl font-bold"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(burn.data);
          await Beet(burn.data);
        }}
      >
        {disableReason ?? "Remove hedge"}
      </AsyncButton>
    </div>
  );
}
