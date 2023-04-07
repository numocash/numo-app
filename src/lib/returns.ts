import { CurrencyAmount } from "@uniswap/sdk-core";

import type { Lendgine } from "./types/lendgine";
import type { UserTrade } from "../hooks/useUserTrades";

export const calculateAmountBoughtAndSold = ({
  trades,
  lendgine,
}: {
  trades: UserTrade[];
  lendgine: Lendgine;
}) => {
  return trades.reduce(
    (acc, cur) => {
      if (cur.trade === "Buy") {
        return {
          ...acc,
          totalAmountBought: acc.totalAmountBought.add(cur.value),
        };
      } else {
        return {
          ...acc,
          totalAmountSold: acc.totalAmountSold.add(cur.value),
        };
      }
    },
    {
      totalAmountSold: CurrencyAmount.fromRawAmount(lendgine.token1, 0),
      totalAmountBought: CurrencyAmount.fromRawAmount(lendgine.token1, 0),
    }
  );
};
