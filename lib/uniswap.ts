import { fractionToPrice, priceToFraction } from "./price";
import { Token } from "./types/currency";
import type { Market } from "./types/market";
import type { Price } from "@uniswap/sdk-core";

export const sortTokens = (tokens: readonly [Token, Token]) =>
  tokens[0].sortsBefore(tokens[1])
    ? ([tokens[0], tokens[1]] as const)
    : ([tokens[1], tokens[0]] as const);

export const calcMedianPrice = (
  prices: (Price<Token, Token> | undefined)[],
  market: Market,
) => {
  const filteredSortedPrices = prices
    .filter((d): d is Price<Token, Token> => !!d)
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
//   TAppliedArgs extends keyof TArgs,
//   TReturn,
// >(
//   func: (args: TArgs) => TReturn,
//   args: Pick<TArgs, TAppliedArgs>,
// ) => {
//   return (remainingArgs: Omit<TArgs, TAppliedArgs>) =>
//     func({ ...args, ...remainingArgs } as unknown as TArgs);
// };

// const add = ({ x, y }: { x: number; y: number }) => x + y;

// const add2 = partialApplication(add, { y: 2 });
