import { createContainer } from "unstated-next";

import { config } from "@/src/constants";
import { useChain } from "@/src/hooks/useChain";

const useEnvironmentInternal = () => {
  const chain = useChain();
  return config[chain];
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
