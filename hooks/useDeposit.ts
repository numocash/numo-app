import { liquidityManagerABI } from "../abis/liquidityManager";
import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import { useSettings } from "../contexts/settings";
import type { HookArg } from "../hooks/internal/types";
import { useInvalidateCall } from "../hooks/internal/useInvalidateCall";
import { useApprove } from "../hooks/useApprove";
import { useLendgine } from "../hooks/useLendgine";
import { useIsWrappedNative } from "../hooks/useTokens";
import { ONE_HUNDRED_PERCENT, scale } from "../lib/constants";
import { priceToFraction } from "../lib/price";
import type { Lendgine, LendgineInfo } from "../lib/types/lendgine";
import { toaster } from "../pages/_app";
import type { BeetStage, BeetTx, TxToast } from "../utils/beet";
import { useDepositAmount } from "./useAmounts";
import { position as positionRead } from "@/lib/reverseMirage/liquidityManager";
import { allowance, balanceOf } from "@/lib/reverseMirage/token";
import { useMutation } from "@tanstack/react-query";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import { encodeFunctionData, getAddress } from "viem";
import type { Address } from "wagmi";
import { useAccount } from "wagmi";
import { SendTransactionResult, waitForTransaction } from "wagmi/actions";
import { prepareWriteContract, writeContract } from "wagmi/actions";

export const useDeposit = <L extends Lendgine>(
  lendgine: HookArg<L>,
  amount:
    | HookArg<CurrencyAmount<L["token0"]>>
    | HookArg<CurrencyAmount<L["token1"]>>,
  protocol: Protocol,
) => {
  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;
  const settings = useSettings();
  const { address } = useAccount();

  const invalidate = useInvalidateCall();

  const native0 = useIsWrappedNative(lendgine?.token0);
  const native1 = useIsWrappedNative(lendgine?.token1);

  const depositAmount = useDepositAmount(lendgine, amount, protocol);

  const approve0 = useApprove(
    depositAmount.amount0,
    protocolConfig.liquidityManager,
  );
  const approve1 = useApprove(
    depositAmount.amount1,
    protocolConfig.liquidityManager,
  );
  const lendgineInfo = useLendgine(lendgine);

  const title = `Add ${lendgine?.token0.symbol ?? ""} / ${
    lendgine?.token1.symbol ?? ""
  }`;

  const approve0Mutation = useMutation({
    mutationFn: async ({
      approveTx,
      toast,
    }: { approveTx: () => Promise<SendTransactionResult> } & {
      toast: TxToast;
    }) => {
      const transaction = await approveTx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await waitForTransaction(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      lendgine &&
        address &&
        (await invalidate(allowance, {
          token: lendgine.token0,
          address: address,
          spender: protocolConfig.liquidityManager,
        }));
    },
  });

  const approve1Mutation = useMutation({
    mutationFn: async ({
      approveTx,
      toast,
    }: { approveTx: () => Promise<SendTransactionResult> } & {
      toast: TxToast;
    }) => {
      const transaction = await approveTx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return await waitForTransaction(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      lendgine &&
        address &&
        (await invalidate(allowance, {
          token: lendgine.token1,
          address: address,
          spender: protocolConfig.liquidityManager,
        }));
    },
  });

  const depositMutation = useMutation({
    mutationFn: async ({
      lendgine,
      amount0,
      amount1,
      liquidity,
      size,
      address,
      toast,
    }: {
      lendgine: Lendgine;
      amount0: CurrencyAmount<L["token0"]>;
      amount1: CurrencyAmount<L["token1"]>;
      liquidity: CurrencyAmount<L["lendgine"]>;
      size: CurrencyAmount<L["lendgine"]>;
      address: Address;
      lendgineInfo: LendgineInfo<Lendgine>;
    } & { toast: TxToast }) => {
      const args = [
        {
          token0: getAddress(lendgine.token0.address),
          token1: getAddress(lendgine.token1.address),
          token0Exp: BigInt(lendgine.token0.decimals),
          token1Exp: BigInt(lendgine.token1.decimals),
          upperBound: BigInt(
            priceToFraction(lendgine.bound).multiply(scale).quotient.toString(),
          ),
          liquidity: BigInt(
            liquidity.multiply(999990).divide(1000000).quotient.toString(),
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
          sizeMin: BigInt(
            size
              .multiply(
                ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent),
              )
              .quotient.toString(),
          ),
          recipient: address,
          deadline: BigInt(
            Math.round(Date.now() / 1000) + settings.timeout * 60,
          ),
        },
      ] as const;

      const tx =
        native0 || native1
          ? async () => {
              const config = await prepareWriteContract({
                // TODO: use the previous transaction block number to make sure that the simulation is being run against an up to date block
                abi: liquidityManagerABI,
                functionName: "multicall",
                address: protocolConfig.liquidityManager,
                args: [
                  [
                    encodeFunctionData({
                      abi: liquidityManagerABI,
                      functionName: "addLiquidity",
                      args,
                    }),
                    encodeFunctionData({
                      abi: liquidityManagerABI,
                      functionName: "refundETH",
                    }),
                  ],
                ],
                value: native0
                  ? BigInt(amount0.quotient.toString() ?? 0)
                  : BigInt(amount1.quotient.toString() ?? 0),
              });
              const data = writeContract(config.request);
              return data;
            }
          : async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "addLiquidity",
                args: args,
                address: protocolConfig.liquidityManager,
                value: BigInt(0),
              });
              const data = writeContract(config.request);
              return data;
            };

      const transaction = await tx();

      toaster.txPending({ ...toast, hash: transaction.hash });

      return waitForTransaction(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });

      await Promise.all([
        lendgine &&
          invalidate(positionRead, {
            lendgine,
            address: input.address,
            liquidityManagerAddress: protocolConfig.liquidityManager,
          }),
        invalidate(allowance, {
          token: input.amount0.currency,
          address: input.address,
          spender: protocolConfig.liquidityManager,
        }),
        invalidate(allowance, {
          token: input.amount1.currency,
          address: input.address,
          spender: protocolConfig.liquidityManager,
        }),
        invalidate(balanceOf, {
          token: input.amount0.currency,
          address: input.address,
        }),
        invalidate(balanceOf, {
          token: input.amount1.currency,
          address: input.address,
        }),
      ]);
    },
  });

  return useMemo(() => {
    if (
      approve0.status === "loading" ||
      approve1.status === "loading" ||
      depositAmount.status === "loading"
    )
      return { status: "loading" } as const;
    if (
      depositAmount.status !== "success" ||
      !lendgineInfo.data ||
      !address ||
      !lendgine ||
      approve0.status === "error" ||
      approve1.status === "error"
    )
      return { status: "error" } as const;

    return {
      status: "success",
      data: (
        [
          (!native0 && approve0.tx) || (!native1 && approve1.tx)
            ? {
                title: "Approve tokens",
                parallelTxs: [
                  !native0 && approve0.tx
                    ? {
                        title: approve0.title,
                        description: approve0.title,
                        callback: (toast: TxToast) =>
                          approve0Mutation.mutateAsync({
                            approveTx: approve0.tx!,
                            toast,
                          }),
                      }
                    : undefined,
                  !native1 && approve1.tx
                    ? {
                        title: approve1.title,
                        description: approve1.title,
                        callback: (toast: TxToast) =>
                          approve1Mutation.mutateAsync({
                            approveTx: approve1.tx!,
                            toast,
                          }),
                      }
                    : undefined,
                ].filter((btx): btx is BeetTx => !!btx),
              }
            : undefined,
          {
            title,
            parallelTxs: [
              {
                title,
                description: title,
                callback: (toast: TxToast) =>
                  depositMutation.mutateAsync({
                    ...depositAmount,
                    lendgine,
                    address,
                    lendgineInfo: lendgineInfo.data!,
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
    approve0.status,
    approve0.title,
    approve0.tx,
    approve0Mutation,
    approve1.status,
    approve1.title,
    approve1.tx,
    approve1Mutation,
    depositAmount,
    depositMutation,
    lendgine,
    lendgineInfo.data,
    native0,
    native1,
    title,
  ]);
};
