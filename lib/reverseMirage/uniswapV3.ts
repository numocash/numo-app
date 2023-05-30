import { ReverseMirage } from "./types";
import { nonfungiblePositionManagerABI } from "@/abis/nonfungiblePositionManager";
import { uniswapV3PoolABI } from "@/abis/uniswapV3Pool";
import { FeeAmount } from "@/graphql/uniswapV3";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position } from "@uniswap/v3-sdk";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import {
  Hex,
  encodeAbiParameters,
  getCreate2Address,
  keccak256,
  parseAbiParameters,
} from "viem";
import { Address, PublicClient } from "wagmi";

export const uniswapV3GetPool = <TToken extends Token>(
  publicClient: PublicClient,
  args: {
    tokenA: TToken;
    tokenB: TToken;
    feeAmount: keyof typeof FeeAmount;
    factoryAddress: Address;
    bytecode: Hex;
  },
) => {
  const [token0, token1] = args.tokenA.sortsBefore(args.tokenB)
    ? [args.tokenA, args.tokenB]
    : [args.tokenB, args.tokenA];

  const address = getCreate2Address({
    from: args.factoryAddress,
    bytecode: args.bytecode,
    salt: keccak256(
      encodeAbiParameters(
        parseAbiParameters("address tokenA, address tokenB, uint24 fee"),
        [token0.address as Address, token1.address as Address, args.feeAmount],
      ),
    ),
  });

  return {
    read: () =>
      Promise.all([
        publicClient.readContract({
          abi: uniswapV3PoolABI,
          address,
          functionName: "slot0",
        }),
        publicClient.readContract({
          abi: uniswapV3PoolABI,
          address,
          functionName: "liquidity",
        }),
      ] as const),
    parse: (data) =>
      new Pool(
        args.tokenA,
        args.tokenB,
        args.feeAmount,
        data[0][0].toString(),
        data[1].toString(),
        data[0][1],
        [],
      ),
  } satisfies ReverseMirage<
    [
      AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<typeof uniswapV3PoolABI, "slot0">["outputs"]
      >,
      bigint,
    ]
  >;
};

export const uniswapV3BalanceOf = (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; address: Address },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: nonfungiblePositionManagerABI,
        address: args.positionManagerAddress,
        functionName: "balanceOf",
        args: [args.address],
      }),
    parse: (data) => +data.toString(),
  } satisfies ReverseMirage<bigint>;
};

export const uniswapV3TokenOfOwnerByIndex = (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; address: Address; balance: number },
) => {
  return {
    read: () =>
      Promise.all(
        [...Array(args.balance).keys()].map((i) =>
          publicClient.readContract({
            abi: nonfungiblePositionManagerABI,
            address: args.positionManagerAddress,
            functionName: "tokenOfOwnerByIndex",
            args: [args.address, BigInt(i)],
          }),
        ),
      ),
    parse: (data) => data.map((d) => +d.toString()),
  } satisfies ReverseMirage<bigint[]>;
};

export const uniswapV3Position = (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; pool: Pool; tokenID: number },
) => {
  return {
    read: () =>
      publicClient.readContract({
        abi: nonfungiblePositionManagerABI,
        address: args.positionManagerAddress,
        functionName: "positions",
        args: [BigInt(args.tokenID)],
      }),
    parse: (data) =>
      new Position({
        pool: args.pool,
        liquidity: data[7].toString(),
        tickLower: data[5],
        tickUpper: data[6],
      }),
  } satisfies ReverseMirage<
    AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<
        typeof nonfungiblePositionManagerABI,
        "positions"
      >["outputs"]
    >
  >;
};
