import { Fraction } from "@uniswap/sdk-core";

import { borrowRate } from "./jumprate";
import { fractionToPrice, priceToFraction, tokenToFraction } from "./price";
import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "./types/lendgine";

export const liquidityPerShare = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  if (lendgineInfo.totalSupply.equalTo(0))
    return fractionToPrice(
      new Fraction(1, 1),
      lendgine.lendgine,
      lendgine.lendgine
    );
  const f = lendgineInfo.totalLiquidityBorrowed.divide(
    lendgineInfo.totalSupply
  );
  return fractionToPrice(f, lendgine.lendgine, lendgine.lendgine);
};

export const liquidityPerCollateral = <L extends Lendgine>(lendgine: L) => {
  const f = new Fraction(1).divide(priceToFraction(lendgine.bound).multiply(2));
  return fractionToPrice(f, lendgine.token1, lendgine.lendgine);
};

export const liquidityPerPosition = <L extends Lendgine>(
  lendgine: L,
  lendgineInfo: LendgineInfo<L>
) => {
  const totalLiquiditySupplied = lendgineInfo.totalLiquidityBorrowed.add(
    lendgineInfo.totalLiquidity
  );
  if (lendgineInfo.totalPositionSize.equalTo(0))
    return fractionToPrice(
      new Fraction(1, 1),
      lendgine.lendgine,
      lendgine.lendgine
    );
  const f = totalLiquiditySupplied.divide(lendgineInfo.totalPositionSize);
  return fractionToPrice(f, lendgine.lendgine, lendgine.lendgine);
};

export const getT = () => Math.round(Date.now() / (1000 * 10)) * 10;

export const accruedLendgineInfo = <L extends Lendgine>(
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<L>,
  t: number
): LendgineInfo<L> => {
  if (
    lendgineInfo.totalSupply.equalTo(0) ||
    lendgineInfo.totalLiquidityBorrowed.equalTo(0)
  )
    return lendgineInfo;

  const timeElapsed = t - lendgineInfo.lastUpdate;

  const br = borrowRate(lendgineInfo);
  const dilutionLPRequested = lendgineInfo.totalLiquidityBorrowed
    .multiply(br)
    .multiply(timeElapsed)
    .divide(86400 * 365);
  const dilutionLP = dilutionLPRequested.greaterThan(
    lendgineInfo.totalLiquidityBorrowed
  )
    ? lendgineInfo.totalLiquidityBorrowed
    : dilutionLPRequested;

  const liqPerCol = liquidityPerCollateral(lendgine);

  const dilutionToken1 = liqPerCol.invert().quote(dilutionLP);

  const f = priceToFraction(lendgineInfo.rewardPerPositionStored).add(
    tokenToFraction(dilutionToken1).divide(
      tokenToFraction(lendgineInfo.totalPositionSize)
    )
  );

  return {
    ...lendgineInfo,
    totalLiquidityBorrowed:
      lendgineInfo.totalLiquidityBorrowed.subtract(dilutionLP),
    rewardPerPositionStored: fractionToPrice(
      f,
      lendgine.lendgine,
      lendgine.token1
    ),
  };
};

export const accruedLendginePositionInfo = <L extends Lendgine>(
  lendgineInfo: LendgineInfo<L>,
  lendginePosition: LendginePosition<L>
): LendginePosition<L> => {
  const newTokensOwed = lendgineInfo.rewardPerPositionStored
    .quote(lendginePosition.size)
    .subtract(
      lendginePosition.rewardPerPositionPaid.quote(lendginePosition.size)
    );

  return {
    ...lendginePosition,
    tokensOwed: lendginePosition.tokensOwed.add(newTokensOwed),
    rewardPerPositionPaid: lendgineInfo.rewardPerPositionStored,
  };
};
