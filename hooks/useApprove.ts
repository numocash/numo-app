import { useSettings } from "../contexts/settings";
import type { HookArg } from "./internal/types";
import { useAllowance } from "./useAllowance";
import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { MaxUint256 } from "@uniswap/sdk-core";
import { BigNumber, utils } from "ethers";
import { useMemo } from "react";
import type { Address } from "wagmi";
import { erc20ABI, useAccount } from "wagmi";
import { prepareWriteContract, writeContract } from "wagmi/actions";

export const useApprove = <T extends Token>(
  tokenAmount: HookArg<CurrencyAmount<T>>,
  spender: HookArg<Address>,
) => {
  const settings = useSettings();
  const { address } = useAccount();

  const allowanceQuery = useAllowance(tokenAmount?.currency, address, spender);

  return useMemo(() => {
    if (allowanceQuery.isLoading) return { status: "loading" } as const;
    if (!allowanceQuery.data || !tokenAmount || !spender)
      return { status: "error" } as const;

    const approvalRequired = tokenAmount.greaterThan(allowanceQuery.data);

    const tx = async () => {
      const config = await prepareWriteContract({
        address: utils.getAddress(tokenAmount.currency.address),
        abi: erc20ABI,
        functionName: "approve",
        args: [
          spender,
          settings.infiniteApprove
            ? BigNumber.from(MaxUint256.toString())
            : BigNumber.from(tokenAmount.multiply(2).quotient.toString()),
        ],
      });
      return await writeContract(config);
    };

    const title = `Approve  ${
      settings.infiniteApprove
        ? "∞"
        : tokenAmount.toSignificant(5, { groupSeparator: "," })
    } ${tokenAmount.currency.symbol ?? "tokens"}`;

    return {
      status: "success",
      allowanceQuery,
      title,
      tx: approvalRequired ? tx : undefined,
    } as const;
  }, [allowanceQuery, settings.infiniteApprove, spender, tokenAmount]);
};
