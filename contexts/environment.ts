import { createContainer } from "unstated-next";

import { config } from "../constants";
import { useChain } from "../hooks/useChain";

const useEnvironmentInternal = () => {
  const chain = useChain();
  return config[chain];
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
