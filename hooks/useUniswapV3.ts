import type { HookArg, ReadConfig } from "./internal/types";
import { useContractRead } from "./internal/useContractRead";
import { useContractReads } from "./internal/useContractReads";
import { userRefectchInterval } from "./internal/utils";
import { nonfungiblePositionManagerABI } from "@/abis/nonfungiblePositionManager";
import { useEnvironment } from "@/contexts/environment";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import type { Address } from "wagmi";

export const usePositionManagerBalanceOf = (address: HookArg<Address>) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();
  const config = address
    ? ({
        address: positionManagerAddress,
        args: [address],
        abi: nonfungiblePositionManagerABI,
        functionName: "balanceOf",
      } as const satisfies ReadConfig<
        typeof nonfungiblePositionManagerABI,
        "balanceOf"
      >)
    : {
        address: undefined,
        abi: undefined,
        functionName: undefined,
        args: undefined,
      };
  return useContractRead({
    ...config,
    staleTime: Infinity,
    enabled: !!address,
    select: (data) => +data.toString(),
    refetchInterval: userRefectchInterval,
  });
};

export const useTokenIDsByIndex = (
  address: HookArg<Address>,
  balance: HookArg<number>,
) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();
  const contracts = useMemo(
    () =>
      !!balance && !!address
        ? [...Array(balance).keys()].map((i) =>
            getTokenOfOwnerByIndexRead(address, i, positionManagerAddress),
          )
        : undefined,
    [address, balance, positionManagerAddress],
  );

  return useContractReads({
    contracts,
    staleTime: Infinity,
    allowFailure: false,
    enabled: !!contracts,
    select: (data) => {
      return data.map((p) => +p.toString());
    },
    refetchInterval: userRefectchInterval,
  });
};

const getTokenOfOwnerByIndexRead = (
  address: Address,
  index: number,
  nonfungiblePositionManager: Address,
) =>
  ({
    address: nonfungiblePositionManager,
    args: [address, BigNumber.from(index)],
    abi: nonfungiblePositionManagerABI,
    functionName: "tokenOfOwnerByIndex",
  }) as const satisfies ReadConfig<
    typeof nonfungiblePositionManagerABI,
    "tokenOfOwnerByIndex"
  >;

export const usePositionFromTokenID = (tokenID: HookArg<number>) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();
  const config = tokenID
    ? getPositionFromTokenIDRead(tokenID, positionManagerAddress)
    : {
        address: undefined,
        abi: undefined,
        functionName: undefined,
        args: undefined,
      };
  return useContractRead({
    ...config,
    staleTime: Infinity,
    enabled: !!tokenID,
    refetchInterval: userRefectchInterval,
  });
};

export const usePositionsFromTokenIDs = (tokenIDs: HookArg<number[]>) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();
  const contracts = useMemo(
    () =>
      tokenIDs
        ? tokenIDs.map((i) =>
            getPositionFromTokenIDRead(i, positionManagerAddress),
          )
        : undefined,
    [tokenIDs, positionManagerAddress],
  );
  return useContractReads({
    contracts,
    staleTime: Infinity,
    allowFailure: false,
    enabled: !!contracts,
    refetchInterval: userRefectchInterval,
  });
};

const getPositionFromTokenIDRead = (
  tokenID: number,
  nonfungiblePositionManager: Address,
) =>
  ({
    address: nonfungiblePositionManager,
    args: [BigNumber.from(tokenID)],
    abi: nonfungiblePositionManagerABI,
    functionName: "positions",
  }) as const satisfies ReadConfig<
    typeof nonfungiblePositionManagerABI,
    "positions"
  >;
