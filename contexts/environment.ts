import { config } from "../constants";
import { useChain } from "../hooks/useChain";
import { createContainer } from "unstated-next";

const useEnvironmentInternal = () => {
  const chain = useChain();
  return config[chain];
};

export const { Provider: EnvironmentProvider, useContainer: useEnvironment } =
  createContainer(useEnvironmentInternal);
