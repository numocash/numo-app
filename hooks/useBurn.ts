import { lendgineRouterABI } from "../abis/lendgineRouter";
import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import { useSettings } from "../contexts/settings";
import type { UniswapV2Pool } from "../graphql/uniswapV2";
import type { UniswapV3Pool } from "../graphql/uniswapV3";
import type { HookArg } from "../hooks/internal/types";
import { useApprove } from "../hooks/useApprove";
import { isV3, useMostLiquidMarket } from "../hooks/useExternalExchange";
import { useIsWrappedNative } from "../hooks/useTokens";
import { AddressZero, ONE_HUNDRED_PERCENT, scale } from "../lib/constants";
import { priceToFraction } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import { toaster } from "../pages/_app";
import type { BeetStage, TxToast } from "../utils/beet";
import { useFastClient } from "./internal/useFastClient";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { useBurnAmount } from "./useAmounts";
import { erc20Allowance, erc20BalanceOf } from "@/lib/reverseMirage/token";
import { Token } from "@/lib/types/currency";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CurrencyAmount } from "@uniswap/sdk-core";
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

export const useBurn = <L extends Lendgine>(
  lendgine: HookArg<L>,
  shares: HookArg<CurrencyAmount<L["lendgine"]>>,
  protocol: Protocol,
) => {
  const { address } = useAccount();
  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;

  const settings = useSettings();

  const queryClient = useQueryClient();
  const client = useFastClient();
  const allowanceQuery = useQueryGenerator(erc20Allowance);
  const balanceQuery = useQueryGenerator(erc20BalanceOf);

  const burnAmounts = useBurnAmount(lendgine, shares, protocol);
  const mostLiquid = useMostLiquidMarket(
    lendgine ? { quote: lendgine.token0, base: lendgine.token1 } : undefined,
  );

  const native = useIsWrappedNative(lendgine?.token1);
  const approve = useApprove(shares, protocolConfig.lendgineRouter);

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
            spender: protocolConfig.lendgineRouter,
          }).queryKey,
        }));
    },
  });

  const title = `Sell ${lendgine?.token1.symbol}+`;

  const burnMutation = useMutation({
    mutationFn: async ({
      lendgine,
      shares,
      amount0,
      amount1,
      amountOut,
      mostLiquidPool,
      address,
      toast,
    }: {
      lendgine: Lendgine;
      shares: CurrencyAmount<Lendgine["lendgine"]>;
      amount0: CurrencyAmount<Token>;
      amount1: CurrencyAmount<Token>;
      amountOut: CurrencyAmount<Token>;
      mostLiquidPool: UniswapV2Pool | UniswapV3Pool;
      address: Address;
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
          shares: BigInt(shares.quotient.toString()),
          collateralMin: BigInt(
            amountOut
              .multiply(
                ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent),
              )
              .quotient.toString(),
          ),
          amount0Min: BigInt(
            amount0
              .multiply(
                ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent),
              )
              .quotient.toString(),
          ),
          amount1Min: BigInt(
            amount1
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
          recipient: native ? AddressZero : address,
          deadline: BigInt(
            Math.round(Date.now() / 1000) + settings.timeout * 60,
          ),
        },
      ] as const;

      const unwrapArgs = [
        BigInt(
          amountOut
            .multiply(ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent))
            .quotient.toString(),
        ),
        address,
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
                    functionName: "burn",
                    args,
                  }),
                  encodeFunctionData({
                    abi: lendgineRouterABI,
                    functionName: "unwrapWETH",
                    args: unwrapArgs,
                  }),
                ],
              ],
              value: BigInt(0),
            });

            const data = await writeContract(config.request);
            return data;
          }
        : async () => {
            const config = await prepareWriteContract({
              abi: lendgineRouterABI,
              functionName: "burn",
              address: protocolConfig.lendgineRouter,
              args,
              value: BigInt(0),
            });

            const data = await writeContract(config.request);
            return data;
          };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return client.waitForTransactionReceipt(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: allowanceQuery({
            token: input.shares.currency,
            address: input.address,
            spender: protocolConfig.lendgineRouter,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: balanceQuery({
            token: input.amountOut.currency,
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
    if (approve.status === "loading" || burnAmounts.status === "loading")
      return { status: "loading" } as const;

    if (
      !shares ||
      burnAmounts.status !== "success" ||
      !mostLiquid.data ||
      !address ||
      !lendgine
    )
      return { status: "error" } as const;

    return {
      status: "success",
      data: (
        [
          approve.tx
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
                  burnMutation.mutateAsync({
                    lendgine,
                    shares,
                    amount0: burnAmounts.amount0,
                    amount1: burnAmounts.amount1,
                    amountOut: burnAmounts.collateral,
                    address,
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
    approve.status,
    approve.title,
    approve.tx,
    approveMutation,
    burnAmounts.amount0,
    burnAmounts.amount1,
    burnAmounts.collateral,
    burnAmounts.status,
    burnMutation,
    lendgine,
    mostLiquid.data,
    shares,
    title,
  ]);
};
