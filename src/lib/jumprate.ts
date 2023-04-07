import { Percent } from "@uniswap/sdk-core";

import type { Lendgine, LendgineInfo } from "./types/lendgine";

const kink = new Percent(8, 10);
const multiplier = new Percent(1375, 1_000);
const jumpMultiplier = new Percent(89, 2);

export const utilizationRate = (
  lendgineInfo: Pick<
    LendgineInfo<Lendgine>,
    "totalLiquidity" | "totalLiquidityBorrowed"
  >
): Percent => {
  const totalLiquiditySupplied = lendgineInfo.totalLiquidity.add(
    lendgineInfo.totalLiquidityBorrowed
  );
  if (totalLiquiditySupplied.equalTo(0)) return new Percent(0);
  const f = lendgineInfo.totalLiquidityBorrowed.divide(totalLiquiditySupplied);
  return new Percent(f.numerator, f.denominator);
};

export const borrowRate = (
  lendgineInfo: Pick<
    LendgineInfo<Lendgine>,
    "totalLiquidity" | "totalLiquidityBorrowed"
  >
): Percent => {
  const utilization = utilizationRate(lendgineInfo);

  if (utilization.greaterThan(kink)) {
    const normalRate = kink.multiply(multiplier);
    const excessUtil = utilization.subtract(kink);
    return excessUtil.multiply(jumpMultiplier).add(normalRate);
  } else {
    return utilization.multiply(multiplier);
  }
};

export const supplyRate = (
  lendgineInfo: Pick<
    LendgineInfo<Lendgine>,
    "totalLiquidity" | "totalLiquidityBorrowed"
  >
): Percent => {
  const utilization = utilizationRate(lendgineInfo);

  const borrow = borrowRate(lendgineInfo);
  return utilization.multiply(borrow);
};
