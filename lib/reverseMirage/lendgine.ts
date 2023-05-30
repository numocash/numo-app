import { scale } from "../constants";
import { fractionToPrice } from "../price";
import { CurrencyAmount } from "../types/currency";
import { Lendgine, LendgineInfo } from "../types/lendgine";
import { ReverseMirage } from "./types";
import { lendgineABI } from "@/abis/lendgine";
import { Fraction } from "@uniswap/sdk-core";
import { getAddress } from "viem";
import { PublicClient } from "wagmi";

export const lendgineTotalPositionSize = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "totalPositionSize",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineTotalLiquidityBorrowed = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "totalLiquidityBorrowed",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineTotalSupply = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "totalSupply",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineTotalLiquidity = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "totalLiquidity",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.lendgine, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineRewardPerPositionStored = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "rewardPerPositionStored",
      }),
    parse: (data) =>
      fractionToPrice(
        new Fraction(data.toString(), scale),
        args.lendgine.lendgine,
        args.lendgine.token1,
      ),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineLastUpdate = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "lastUpdate",
      }),
    parse: (data) => +data.toString(),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineReserve0 = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "reserve0",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.token0, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineReserve1 = (
  publicClient: PublicClient,
  args: { lendgine: Lendgine },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "reserve1",
      }),
    parse: (data) =>
      CurrencyAmount.fromRawAmount(args.lendgine.token1, data.toString()),
  } satisfies ReverseMirage<bigint>;
};

export const lendgineFactory = (
  publicClient: PublicClient,
  args: { lendgine: Pick<Lendgine, "address"> },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: lendgineABI,
        address: args.lendgine.address,
        functionName: "factory",
      }),
    parse: (data) => getAddress(data),
  } satisfies ReverseMirage<string>;
};

export const lendgineGetInfo = <TLendgine extends Lendgine>(
  publicClient: PublicClient,
  args: { lendgine: TLendgine },
) => {
  return {
    read: () =>
      Promise.all([
        lendgineTotalPositionSize(publicClient, args).read(),
        lendgineTotalLiquidityBorrowed(publicClient, args).read(),
        lendgineRewardPerPositionStored(publicClient, args).read(),
        lendgineLastUpdate(publicClient, args).read(),
        lendgineTotalSupply(publicClient, args).read(),
        lendgineReserve0(publicClient, args).read(),
        lendgineReserve1(publicClient, args).read(),
        lendgineTotalLiquidity(publicClient, args).read(),
      ]),
    parse: (data) => ({
      totalPositionSize: lendgineTotalPositionSize(publicClient, args).parse(
        data[0],
      ),
      totalLiquidityBorrowed: lendgineTotalLiquidityBorrowed(
        publicClient,
        args,
      ).parse(data[1]),
      rewardPerPositionStored: lendgineRewardPerPositionStored(
        publicClient,
        args,
      ).parse(data[2]),
      lastUpdate: lendgineLastUpdate(publicClient, args).parse(data[3]),
      totalSupply: lendgineTotalSupply(publicClient, args).parse(data[4]),
      reserve0: lendgineReserve0(publicClient, args).parse(data[5]),
      reserve1: lendgineReserve1(publicClient, args).parse(data[6]),
      totalLiquidity: lendgineTotalLiquidity(publicClient, args).parse(data[7]),
    }),
  } satisfies ReverseMirage<
    [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint],
    LendgineInfo<TLendgine>
  >;
};
