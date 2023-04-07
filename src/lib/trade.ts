import type { Price } from "@uniswap/sdk-core";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";

import { ONE_HUNDRED_PERCENT } from "./constants";
import { liquidityPerCollateral } from "./lendgineMath";
import type { Lendgine, LendgineInfo } from "./types/lendgine";
import type { WrappedTokenInfo } from "./types/wrappedTokenInfo";
import { isV3 } from "../hooks/useExternalExchange";
import type { UniswapV2Pool } from "../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../services/graphql/uniswapV3";

export const determineBorrowAmount = (
  userAmount: CurrencyAmount<WrappedTokenInfo>,
  lendgine: Lendgine,
  lendgineInfo: LendgineInfo<Lendgine>,
  referenceMarket: {
    pool: UniswapV2Pool | UniswapV3Pool;
    price: Price<WrappedTokenInfo, WrappedTokenInfo>;
  },
  slippageBps: Percent
) => {
  const liqPerCol = liquidityPerCollateral(lendgine);
  const userLiquidity = liqPerCol.quote(userAmount);

  if (lendgineInfo.totalLiquidity.equalTo(0))
    return CurrencyAmount.fromRawAmount(userAmount.currency, 0);

  const token0Amount = lendgineInfo.reserve0
    .multiply(userLiquidity)
    .divide(lendgineInfo.totalLiquidity);

  const token1Amount = lendgineInfo.reserve1
    .multiply(userLiquidity)
    .divide(lendgineInfo.totalLiquidity);

  // token0 / token1
  const referencePrice = lendgine.token0.equals(
    referenceMarket.price.quoteCurrency
  )
    ? referenceMarket.price
    : referenceMarket.price.invert();

  const dexFee = isV3(referenceMarket.pool)
    ? new Percent(referenceMarket.pool.feeTier, "1000000")
    : new Percent("3000", "1000000");

  const expectedSwapOutput = referencePrice
    .invert()
    .quote(token0Amount)
    .multiply(ONE_HUNDRED_PERCENT.subtract(dexFee))
    .multiply(ONE_HUNDRED_PERCENT.subtract(slippageBps));

  const userLiquidityValue = userAmount.subtract(
    token1Amount.add(expectedSwapOutput)
  );

  const multiple = userAmount.divide(userLiquidityValue).asFraction;

  return userAmount.multiply(multiple.subtract(1));
};
