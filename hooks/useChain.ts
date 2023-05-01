import type { SupportedChainIDs } from "../constants";
import { useChainId } from "wagmi";

export const useChain = (): SupportedChainIDs => {
  const chainNumber = useChainId();
  return chainNumber as SupportedChainIDs;
};
