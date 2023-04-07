/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from "@tanstack/react-query";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import invariant from "tiny-invariant";

import { useChain } from "./useChain";
import { useClient } from "./useClient";
import { AllTradesQueryDocument } from "../gql/numoen/graphql";
import { liquidityPerCollateral } from "../lib/lendgineMath";
import { invert, numoenPrice } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";

export const useTrades = ({
  lendgines,
}: {
  lendgines: readonly Lendgine[];
}) => {
  const client = useClient();
  const chainID = useChain();

  return useQuery(
    ["all trades", lendgines, chainID],
    async () => {
      const tradeData = await client.numoen.request(AllTradesQueryDocument, {
        lendgines: lendgines.map((l) => l.address.toLowerCase()),
      });

      const validMints = tradeData.mints.filter(
        (m) => m.transaction.pairBurns.length === 1
      );
      const validBurns = tradeData.burns.filter(
        (b) => b.transaction.pairMints.length === 1
      );

      const parsedBuy = validMints.map((m) => {
        const lendgine = lendgines.find(
          (l) => utils.getAddress(l.address) === utils.getAddress(m.lendgine.id)
        );
        invariant(lendgine, "can't find lendgine");
        const amount0 = CurrencyAmount.fromRawAmount(
          lendgine.token0,
          m.transaction.pairBurns[0]!.amount0
        );
        const amount1 = CurrencyAmount.fromRawAmount(
          lendgine.token1,
          m.transaction.pairBurns[0]!.amount1
        );
        const liquidity = CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          m.transaction.pairBurns[0]!.liquidity
        );

        // token0 / token1
        const price = numoenPrice(lendgine, {
          reserve0: amount0,
          reserve1: amount1,
          totalLiquidity: liquidity,
        });

        // token1
        const collateral = liquidityPerCollateral(lendgine)
          .invert()
          .quote(liquidity);

        const debtValue = amount1.add(invert(price).quote(amount0));

        const value = collateral.subtract(debtValue);
        const account = utils.getAddress(m.transaction.origin);

        return {
          lendgine,
          price,
          trade: "Buy",
          value,
          block: m.transaction.blockNumber,
          account,
        };
      });

      const parsedSells = validBurns.map((b) => {
        const lendgine = lendgines.find(
          (l) => utils.getAddress(l.address) === utils.getAddress(b.lendgine.id)
        );
        invariant(lendgine, "can't find lendgine");
        const amount0 = CurrencyAmount.fromRawAmount(
          lendgine.token0,
          b.transaction.pairMints[0]!.amount0
        );
        const amount1 = CurrencyAmount.fromRawAmount(
          lendgine.token1,
          b.transaction.pairMints[0]!.amount1
        );
        const liquidity = CurrencyAmount.fromRawAmount(
          lendgine.lendgine,
          b.transaction.pairMints[0]!.liquidity
        );

        // token0 / token1
        const price = numoenPrice(lendgine, {
          reserve0: amount0,
          reserve1: amount1,
          totalLiquidity: liquidity,
        });

        const collateral = liquidityPerCollateral(lendgine)
          .invert()
          .quote(liquidity);

        const debtValue = amount1.add(invert(price).quote(amount0));

        const value = collateral.subtract(debtValue);
        const account = utils.getAddress(b.transaction.origin);

        return {
          lendgine,
          price,
          trade: "Sell",
          value,
          block: b.transaction.blockNumber,
          account,
        };
      });

      return parsedBuy
        .concat(parsedSells)
        .sort((a, b) => (a.block > b.block ? -1 : 1));
    },
    {
      staleTime: Infinity,
      refetchInterval: 60 * 1000,
    }
  );
};
