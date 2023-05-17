import { scale } from "../constants";
import { fractionToPrice } from "../price";
import { Lendgine, LendgineInfo } from "../types/lendgine";
import { lendgineABI } from "@/abis/lendgine";
import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { PublicClient } from "wagmi";

export const totalPositionSize = async (
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

export const totalLiquidityBorrowed = async (
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

export const totalSupply = async (
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

export const totalLiquidity = async (
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

export const rewardPerPositionStored = async (
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

export const lastUpdate = async (
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

export const reserve0 = async (
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

export const reserve1 = async (
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

export const factory = async (
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

export const getLendgineInfo = async <TLendgine extends Lendgine>(
  publicClient: PublicClient,
  args: { lendgine: TLendgine },
): Promise<LendgineInfo<TLendgine>> => {
  const data = await Promise.all([
    totalPositionSize(publicClient, args),
    totalLiquidity(publicClient, args),
    rewardPerPositionStored(publicClient, args),
    lastUpdate(publicClient, args),
    totalSupply(publicClient, args),
    reserve0(publicClient, args),
    reserve1(publicClient, args),
    totalLiquidity(publicClient, args),
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
