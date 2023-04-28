import { useChainId } from "wagmi";

import type { SupportedChainIDs } from "../constants";

export const useChain = (): SupportedChainIDs => {
  const chainNumber = useChainId();
  return chainNumber as SupportedChainIDs;
};
