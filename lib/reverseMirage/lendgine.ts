import { scale } from "../constants";
import { fractionToPrice } from "../price";
import { CurrencyAmount } from "../types/currency";
import { Lendgine, LendgineInfo } from "../types/lendgine";
import { lendgineABI } from "@/abis/lendgine";
import { Fraction } from "@uniswap/sdk-core";
import { PublicClient } from "wagmi";

const lendgineTotalPositionSize = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "totalPositionSize",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString());
};

const lendgineTotalLiquidityBorrowed = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "totalLiquidityBorrowed",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString());
};

const lendgineTotalSupply = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "totalSupply",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString());
};

const lendgineTotalLiquidity = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "totalLiquidity",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString());
};

const lendgineRewardPerPositionStored = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "rewardPerPositionStored",
  });

  return fractionToPrice(
    new Fraction(data.toString(), scale),
    args.lendgine.lendgine,
    args.lendgine.token1,
  );
};

const lendgineLastUpdate = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "lastUpdate",
  });

  return +data.toString();
};

const lendgineReserve0 = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "reserve0",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.token0, data.toString());
};

const lendgineReserve1 = async (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "reserve1",
  });

  return CurrencyAmount.fromRawAmount(args.lendgine.token1, data.toString());
};

const lendgineFactory = async (
  publicClient: PublicClient,
  args: { lendgine: Pick<Lendgine, "address"> },
) => {
  const data = await publicClient.readContract({
    abi: lendgineABI,
    address: args.lendgine.address,
    functionName: "factory",
  });

  return data;
};

const lendgineGetInfo = async <TLendgine extends Lendgine>(
  publicClient: PublicClient,
  args: { lendgine: TLendgine },
): Promise<LendgineInfo<TLendgine>> => {
  const data = await Promise.all([
    lendgineTotalPositionSize(publicClient, args),
    lendgineTotalLiquidity(publicClient, args),
    lendgineRewardPerPositionStored(publicClient, args),
    lendgineLastUpdate(publicClient, args),
    lendgineTotalSupply(publicClient, args),
    lendgineReserve0(publicClient, args),
    lendgineReserve1(publicClient, args),
    lendgineTotalLiquidity(publicClient, args),
  ]);

  return {
    totalPositionSize: data[0],
    totalLiquidityBorrowed: data[1],
    rewardPerPositionStored: data[2],
    lastUpdate: data[3],
    totalSupply: data[4],
    reserve0: data[5],
    reserve1: data[6],
    totalLiquidity: data[7],
  };
};

export const lendgineMirage = {
  lendgineTotalPositionSize,
  lendgineTotalLiquidityBorrowed,
  lendgineTotalSupply,
  lendgineTotalLiquidity,
  lendgineRewardPerPositionStored,
  lendgineLastUpdate,
  lendgineReserve0,
  lendgineReserve1,
  lendgineFactory,
  lendgineGetInfo,
} as const;
