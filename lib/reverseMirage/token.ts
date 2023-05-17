import { CurrencyAmount, NativeCurrency, Token } from "@uniswap/sdk-core";
import { getAddress } from "viem";
import { Address, PublicClient, erc20ABI } from "wagmi";

export const balance = async (
  publicClient: PublicClient,
  args: { token: NativeCurrency; address: Address },
) => {
  const data = await publicClient.getBalance({ address: args.address });

  return CurrencyAmount.fromRawAmount(args.token, data.toString());
};

export const balanceOf = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: TToken; address: Address },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: args.token.address as Address,
    functionName: "balanceOf",
    args: [args.address],
  });

  return CurrencyAmount.fromRawAmount(args.token, data.toString());
};

export const allowance = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: TToken; address: Address; spender: Address },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: getAddress(args.token.address),
    functionName: "allowance",
    args: [args.address, args.spender],
  });

  return CurrencyAmount.fromRawAmount(args.token, data.toString());
};

export const totalSupply = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: TToken },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: getAddress(args.token.address),
    functionName: "totalSupply",
  });

  return CurrencyAmount.fromRawAmount(args.token, data.toString());
};

export const name = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: Pick<TToken, "address"> },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: getAddress(args.token.address),
    functionName: "name",
  });

  return data;
};

export const symbol = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: Pick<TToken, "address"> },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: getAddress(args.token.address),
    functionName: "symbol",
  });

  return data;
};

export const decimals = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: Pick<TToken, "address"> },
) => {
  const data = await publicClient.readContract({
    abi: erc20ABI,
    address: getAddress(args.token.address),
    functionName: "decimals",
  });

  return data;
};

export const getToken = async <TToken extends Token>(
  publicClient: PublicClient,
  args: { token: Pick<TToken, "address" | "chainId"> },
) => {
  const data = await Promise.all([
    name(publicClient, args),
    symbol(publicClient, args),
    decimals(publicClient, args),
  ]);

  return new Token(
    args.token.chainId,
    args.token.address,
    data[2],
    data[1],
    data[0],
  );
};
