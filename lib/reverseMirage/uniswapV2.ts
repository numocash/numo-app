import { ReverseMirage } from "./types";
import { uniswapV2PairABI } from "@/abis/uniswapV2Pair";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";
import { Hex, encodePacked, getCreate2Address, keccak256 } from "viem";
import { Address, PublicClient } from "wagmi";

export const uniswapV2GetPair = <TToken extends Token>(
  publicClient: PublicClient,
  args: {
    tokenA: TToken;
    tokenB: TToken;
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
      encodePacked(
        ["address", "address"],
        [token0.address as Address, token1.address as Address],
      ),
    ),
  });

  return {
    read: () =>
      publicClient.readContract({
        abi: uniswapV2PairABI,
        address,
        functionName: "getReserves",
      }),
    parse: (data) => {
      const token0Amount = CurrencyAmount.fromRawAmount(
        token0,
        data[0].toString(),
      );
      const token1Amount = CurrencyAmount.fromRawAmount(
        token1,
        data[1].toString(),
      );

      return new Pair(token0Amount, token1Amount);
    },
  } satisfies ReverseMirage<readonly [bigint, bigint, number], Pair>;
};
