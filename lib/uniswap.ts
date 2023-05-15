import type { UniswapV3Pool } from "../graphql/uniswapV3";
import { fractionToPrice, priceToFraction } from "./price";
import type { Market } from "./types/market";
import type { WrappedTokenInfo } from "./types/wrappedTokenInfo";
import type { Price } from "@uniswap/sdk-core";
import type { Address } from "abitype";
import { utils } from "ethers";

export const sortTokens = (
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo],
) =>
  tokens[0].sortsBefore(tokens[1])
    ? ([tokens[0], tokens[1]] as const)
    : ([tokens[1], tokens[0]] as const);

export const calcV2Address = (
  sortedTokens: readonly [WrappedTokenInfo, WrappedTokenInfo],
  factoryAddress: Address,
  initCodeHash: string,
) =>
  utils.getCreate2Address(
    factoryAddress,
    utils.keccak256(
      utils.solidityPack(
        ["address", "address"],
        [sortedTokens[0].address, sortedTokens[1].address],
      ),
    ),
    initCodeHash,
  );

export const calcV3Address = (
  sortedTokens: readonly [WrappedTokenInfo, WrappedTokenInfo],
  feeTier: UniswapV3Pool["feeTier"],
  factoryAddress: Address,
  initCodeHash: string,
) =>
  utils.getCreate2Address(
    factoryAddress,
    utils.keccak256(
      utils.defaultAbiCoder.encode(
        ["address", "address", "uint24"],
        [sortedTokens[0].address, sortedTokens[1].address, feeTier],
      ),
    ),
    initCodeHash,
  );

export const calcMedianPrice = (
  prices: (Price<WrappedTokenInfo, WrappedTokenInfo> | undefined)[],
  market: Market,
) => {
  const filteredSortedPrices = prices
    .filter((d): d is Price<WrappedTokenInfo, WrappedTokenInfo> => !!d)
    .sort((a, b) => (a.greaterThan(b) ? 1 : -1));

  if (filteredSortedPrices.length % 2 === 1) {
    return filteredSortedPrices[(filteredSortedPrices.length - 1) / 2]!;
  }

  const lower = filteredSortedPrices[filteredSortedPrices.length / 2 - 1]!;
  const upper = filteredSortedPrices[filteredSortedPrices.length / 2]!;

  const sum = priceToFraction(lower).add(priceToFraction(upper));
  return fractionToPrice(sum.divide(2), market.base, market.quote);
};

// Takes a function, and the arguments to be applied, returns a function
// const partialApplication = <
//   TArgs extends {},
//   TAppliedArgs extends Partial<TArgs>,
//   TReturn,
// >(
//   func: (args: TArgs) => TReturn,
//   args: TAppliedArgs,
// ) => {
//   return (remainingArgs: Omit<TArgs, keyof TAppliedArgs>) =>
//     func({ ...args, ...remainingArgs } as unknown as TArgs);
// };
