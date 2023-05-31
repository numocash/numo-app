import { lendgineRouterABI } from "../abis/lendgineRouter";
import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import { useSettings } from "../contexts/settings";
import type { UniswapV2Pool } from "../graphql/uniswapV2";
import type { UniswapV3Pool } from "../graphql/uniswapV3";
import { ONE_HUNDRED_PERCENT, scale } from "../lib/constants";
import { priceToFraction } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import { toaster } from "../pages/_app";
import type { BeetStage, TxToast } from "../utils/beet";
import type { HookArg } from "./internal/types";
import { useFastClient } from "./internal/useFastClient";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { useMintAmount } from "./useAmounts";
import { useApprove } from "./useApprove";
import { isV3, useMostLiquidMarket } from "./useExternalExchange";
import { useIsWrappedNative } from "./useTokens";
import { erc20Allowance, erc20BalanceOf } from "@/lib/reverseMirage/token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { useMemo } from "react";
import {
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  parseAbiParameters,
} from "viem";
import type { Address } from "wagmi";
import { useAccount } from "wagmi";
import { SendTransactionResult } from "wagmi/actions";
import { prepareWriteContract, writeContract } from "wagmi/actions";

export const useMint = <L extends Lendgine>(
  lendgine: HookArg<L>,
  amountIn: HookArg<CurrencyAmount<L["token0"]>>,
  protocol: Protocol,
) => {
  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;
  const settings = useSettings();
  const { address } = useAccount();

  const queryClient = useQueryClient();
  const client = useFastClient();
  const allowanceQuery = useQueryGenerator(erc20Allowance);
  const balanceQuery = useQueryGenerator(erc20BalanceOf);

  const mintAmounts = useMintAmount(lendgine, amountIn, protocol);
  const mostLiquid = useMostLiquidMarket(
    lendgine ? { quote: lendgine.token0, base: lendgine.token1 } : undefined,
  );

  const approve = useApprove(amountIn, protocolConfig.lendgineRouter);

  const native = useIsWrappedNative(lendgine?.token1);

  const title = useMemo(
    () => `Buy ${lendgine?.token1.symbol}+`,
    [lendgine?.token1.symbol],
  );

  const approveMutation = useMutation({
    mutationFn: async ({
      approveTx,
      toast,
    }: { approveTx: () => Promise<SendTransactionResult> } & {
      toast: TxToast;
    }) => {
      const transaction = await approveTx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await client.waitForTransactionReceipt(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      lendgine &&
        address &&
        (await queryClient.invalidateQueries({
          queryKey: allowanceQuery({
            token: lendgine.lendgine,
            address: getAddress(address),
            spender: getAddress(protocolConfig.lendgineRouter),
          }).queryKey,
        }));
    },
  });

  const mintMutation = useMutation({
    mutationFn: async ({
      lendgine,
      borrowAmount,
      shares,
      address,
      amountIn,
      mostLiquidPool,
      toast,
    }: {
      lendgine: Lendgine;
      borrowAmount: CurrencyAmount<Token>;
      shares: CurrencyAmount<Token>;
      address: Address;
      amountIn: CurrencyAmount<Token>;
      mostLiquidPool: UniswapV2Pool | UniswapV3Pool;
    } & { toast: TxToast }) => {
      const args = [
        {
          token0: lendgine.token0.address as Address,
          token1: lendgine.token1.address as Address,
          token0Exp: BigInt(lendgine.token0.decimals),
          token1Exp: BigInt(lendgine.token1.decimals),
          upperBound: BigInt(
            priceToFraction(lendgine.bound).multiply(scale).quotient.toString(),
          ),
          amountIn: BigInt(amountIn.quotient.toString()),
          amountBorrow: BigInt(borrowAmount.quotient.toString()),
          sharesMin: BigInt(
            shares
              .multiply(
                ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent),
              )
              .quotient.toString(),
          ),
          swapType: isV3(mostLiquidPool) ? 1 : 0,
          swapExtraData: isV3(mostLiquidPool)
            ? encodeAbiParameters(parseAbiParameters("uint24 fee"), [
                +mostLiquidPool.feeTier,
              ])
            : "0x",
          recipient: address,
          deadline: BigInt(
            Math.round(Date.now() / 1000) + settings.timeout * 60,
          ),
        },
      ] as const;

      const tx = native
        ? async () => {
            const config = await prepareWriteContract({
              abi: lendgineRouterABI,
              functionName: "multicall",
              address: protocolConfig.lendgineRouter,
              args: [
                [
                  encodeFunctionData({
                    abi: lendgineRouterABI,
                    functionName: "mint",
                    args,
                  }),
                  encodeFunctionData({
                    abi: lendgineRouterABI,
                    functionName: "refundETH",
                  }),
                ],
              ],
              value: args[0].amountIn,
            });
            return await writeContract(config.request);
          }
        : async () => {
            const config = await prepareWriteContract({
              abi: lendgineRouterABI,
              functionName: "mint",
              address: protocolConfig.lendgineRouter,
              args,
              value: BigInt(0),
            });
            return await writeContract(config.request);
          };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await client.waitForTransactionReceipt(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: allowanceQuery({
            token: input.amountIn.currency,
            address: input.address,
            spender: protocolConfig.lendgineRouter,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: balanceQuery({
            token: input.amountIn.currency,
            address: input.address,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: balanceQuery({
            token: input.shares.currency,
            address: input.address,
          }).queryKey,
        }),
      ]);
    },
  });

  return useMemo(() => {
    if (approve.status === "loading" || mintAmounts.status === "loading")
      return { status: "loading" } as const;
    if (
      mintAmounts.status !== "success" ||
      !lendgine ||
      !address ||
      !amountIn ||
      !mostLiquid.data ||
      approve.status === "error"
    )
      return { status: "error" } as const;

    return {
      status: "success",
      data: (
        [
          !native && approve.tx
            ? {
                title: approve.title,
                parallelTxs: [
                  {
                    title: approve.title,
                    description: approve.title,
                    callback: (toast: TxToast) =>
                      approveMutation.mutateAsync({
                        approveTx: approve.tx!,
                        toast,
                      }),
                  },
                ],
              }
            : undefined,
          {
            title,
            parallelTxs: [
              {
                title,
                description: title,
                callback: (toast: TxToast) =>
                  mintMutation.mutateAsync({
                    lendgine,
                    borrowAmount: mintAmounts.borrowAmount,
                    shares: mintAmounts.shares,
                    address,
                    amountIn,
                    mostLiquidPool: mostLiquid.data.pool,
                    toast,
                  }),
              },
            ],
          },
        ] as readonly (BeetStage | undefined)[]
      ).filter((s): s is BeetStage => !!s),
    } as const satisfies { data: readonly BeetStage[]; status: "success" };
  }, [
    address,
    amountIn,
    approve.status,
    approve.title,
    approve.tx,
    approveMutation,
    lendgine,
    mintAmounts.borrowAmount,
    mintAmounts.shares,
    mintAmounts.status,
    mintMutation,
    mostLiquid.data,
    native,
    title,
  ]);
};
