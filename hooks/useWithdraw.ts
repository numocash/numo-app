import { liquidityManagerABI } from "../abis/liquidityManager";
import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import { useSettings } from "../contexts/settings";
import { AddressZero, ONE_HUNDRED_PERCENT, scale } from "../lib/constants";
import { priceToFraction } from "../lib/price";
import type { Lendgine, LendginePosition } from "../lib/types/lendgine";
import { toaster } from "../pages/_app";
import type { BeetStage, TxToast } from "../utils/beet";
import type { HookArg } from "./internal/types";
import { useInvalidateCall } from "./internal/useInvalidateCall";
import { useWithdrawAmount } from "./useAmounts";
import { useIsWrappedNative } from "./useTokens";
import { position as positionRead } from "@/lib/reverseMirage/liquidityManager";
import { balanceOf } from "@/lib/reverseMirage/token";
import { useMutation } from "@tanstack/react-query";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import type { Address } from "abitype";
import { useMemo } from "react";
import { encodeFunctionData, getAddress } from "viem";
import { useAccount } from "wagmi";
import {
  prepareWriteContract,
  waitForTransaction,
  writeContract,
} from "wagmi/actions";

export const useWithdraw = <L extends Lendgine>(
  lendgine: HookArg<L>,
  position: HookArg<Pick<LendginePosition<L>, "size">>,
  protocol: Protocol,
) => {
  const settings = useSettings();
  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;

  const { address } = useAccount();
  const invalidate = useInvalidateCall();

  const native0 = useIsWrappedNative(lendgine?.token0);
  const native1 = useIsWrappedNative(lendgine?.token1);

  const withdrawAmount = useWithdrawAmount(lendgine, position, protocol);

  const title = `Remove ${lendgine?.token0.symbol ?? ""} / ${
    lendgine?.token1.symbol ?? ""
  } liquidty`;

  const mutation = useMutation({
    mutationFn: async ({
      lendgine,
      amount0,
      amount1,
      size,
      address,
      toast,
    }: {
      lendgine: Lendgine;
      amount0: CurrencyAmount<Lendgine["token0"]>;
      amount1: CurrencyAmount<Lendgine["token1"]>;
      size: LendginePosition<Lendgine>["size"];
      address: Address;
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
          size: BigInt(size.quotient.toString()),

          recipient: native0 || native1 ? AddressZero : address,
          deadline: BigInt(
            Math.round(Date.now() / 1000) + settings.timeout * 60,
          ),
        },
      ] as const;
      const unwrapArgs = [BigInt(0), address] as const; // safe to be zero because the withdraw estimation will fail
      const sweepArgs = [
        native0
          ? (lendgine.token1.address as Address)
          : (lendgine.token0.address as Address),
        BigInt(0),
        address,
      ] as const; // safe to be zero because the withdraw estimation will fail

      const tx =
        native0 || native1
          ? async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "multicall",
                address: protocolConfig.liquidityManager,
                value: BigInt(0),
                args: [
                  [
                    encodeFunctionData({
                      abi: liquidityManagerABI,
                      functionName: "removeLiquidity",
                      args,
                    }),
                    encodeFunctionData({
                      abi: liquidityManagerABI,
                      functionName: "unwrapWETH",
                      args: unwrapArgs,
                    }),
                    encodeFunctionData({
                      abi: liquidityManagerABI,
                      functionName: "sweepToken",
                      args: sweepArgs,
                    }),
                  ],
                ],
              });
              const data = await writeContract(config.request);
              return data;
            }
          : async () => {
              const config = await prepareWriteContract({
                abi: liquidityManagerABI,
                functionName: "removeLiquidity",
                address: protocolConfig.liquidityManager,
                args,
                value: BigInt(0),
              });
              const data = await writeContract(config.request);
              return data;
            };

      const transaction = await tx();
      toaster.txPending({
        ...toast,
        hash: transaction.hash,
      });

      return await waitForTransaction(transaction);
    },
    onMutate: ({ toast }) => toaster.txSending(toast),
    onError: (_, { toast }) => toaster.txError(toast),
    onSuccess: async (data, input) => {
      toaster.txSuccess({ ...input.toast, receipt: data });
      lendgine &&
        (await Promise.all([
          invalidate(positionRead, {
            lendgine,
            address: input.address,
            liquidityManagerAddress: protocolConfig.liquidityManager,
          }),
          invalidate(balanceOf, {
            token: input.amount0.currency,
            address: input.address,
          }),
          invalidate(balanceOf, {
            token: input.amount1.currency,
            address: input.address,
          }),
        ]));
    },
  });

  return useMemo(() => {
    if (withdrawAmount.status === "loading")
      return { status: "loading" } as const;
    if (
      !address ||
      withdrawAmount.status !== "success" ||
      !lendgine ||
      !position
    )
      return { status: "error" } as const;

    return {
      status: "success",
      data: [
        {
          title,
          parallelTxs: [
            {
              title,
              description: title,
              callback: (toast: TxToast) =>
                mutation.mutateAsync({
                  lendgine,
                  ...withdrawAmount,
                  size: position.size,
                  address,
                  toast,
                }),
            },
          ],
        },
      ],
    } as const satisfies { data: readonly BeetStage[]; status: "success" };
  }, [address, lendgine, mutation, position, title, withdrawAmount]);
};
