import { nonfungiblePositionManagerABI } from "@/abis/nonfungiblePositionManager";
import { uniswapV3PoolABI } from "@/abis/uniswapV3Pool";
import { FeeAmount } from "@/graphql/uniswapV3";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position } from "@uniswap/v3-sdk";
import {
  Hex,
  encodeAbiParameters,
  getCreate2Address,
  keccak256,
  parseAbiParameters,
} from "viem";
import { Address, PublicClient } from "wagmi";

const uniswapV3GetPool = async <TToken extends Token>(
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

  const data = await Promise.all([
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
  ] as const);

  return new Pool(
    args.tokenA,
    args.tokenB,
    args.feeAmount,
    data[0][0].toString(),
    data[1].toString(),
    data[0][1],
    [],
  );
};

const uniswapV3BalanceOf = async (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; address: Address },
) => {
  const data = await publicClient.readContract({
    abi: nonfungiblePositionManagerABI,
    address: args.positionManagerAddress,
    functionName: "balanceOf",
    args: [args.address],
  });

  return +data.toString();
};

const uniswapV3TokenOfOwnerByIndex = async (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; address: Address; balance: number },
) => {
  const data = await Promise.all(
    [...Array(args.balance).keys()].map((i) =>
      publicClient.readContract({
        abi: nonfungiblePositionManagerABI,
        address: args.positionManagerAddress,
        functionName: "tokenOfOwnerByIndex",
        args: [args.address, BigInt(i)],
      }),
    ),
  );

  return data.map((d) => +d.toString());
};

const uniswapV3Position = async (
  publicClient: PublicClient,
  args: { positionManagerAddress: Address; pool: Pool; tokenID: number },
) => {
  const data = await publicClient.readContract({
    abi: nonfungiblePositionManagerABI,
    address: args.positionManagerAddress,
    functionName: "positions",
    args: [BigInt(args.tokenID)],
  });

  return new Position({
    pool: args.pool,
    liquidity: data[7].toString(),
    tickLower: data[5],
    tickUpper: data[6],
  });
};

export const uniswapV3Mirage = {
  uniswapV3GetPool,
  uniswapV3BalanceOf,
  uniswapV3TokenOfOwnerByIndex,
  uniswapV3Position,
} as const;
