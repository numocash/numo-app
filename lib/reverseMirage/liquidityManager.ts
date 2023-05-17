import { scale } from "../constants";
import { fractionToPrice } from "../price";
import { Lendgine, LendginePosition } from "../types/lendgine";
import { liquidityManagerABI } from "@/abis/liquidityManager";
import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { PublicClient } from "viem";
import { Address } from "wagmi";

export const position = async <TLendgine extends Lendgine>(
  publicClient: PublicClient,
  args: {
    lendgine: TLendgine;
    address: Address;
    liquidityManagerAddress: Address;
  },
): Promise<LendginePosition<TLendgine>> => {
  const data = await publicClient.readContract({
    abi: liquidityManagerABI,
    address: args.liquidityManagerAddress,
    functionName: "positions",
    args: [args.address, args.lendgine.address],
  });

  const size = CurrencyAmount.fromRawAmount(
    args.lendgine.lendgine,
    data[0].toString(),
  );

  const rewardPerPositionPaid = fractionToPrice(
    new Fraction(data[1].toString(), scale),
    args.lendgine.lendgine,
    args.lendgine.token1,
  );

  const tokensOwed = CurrencyAmount.fromRawAmount(
    args.lendgine.token1,
    data[2].toString(),
  );

  return { size, rewardPerPositionPaid, tokensOwed };
};
