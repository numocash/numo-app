import { GraphQLClient } from "graphql-request";
import { useMemo } from "react";

import { useEnvironment } from "../contexts/useEnvironment";

export const useClient = () => {
  const environment = useEnvironment();
  return useMemo(
    () => ({
      uniswapV2: new GraphQLClient(environment.interface.uniswapV2.subgraph),
      uniswapV3: new GraphQLClient(environment.interface.uniswapV3.subgraph),
      numoen: new GraphQLClient(environment.interface.numoenSubgraph),
    }),
    [
      environment.interface.numoenSubgraph,
      environment.interface.uniswapV2.subgraph,
      environment.interface.uniswapV3.subgraph,
    ]
  );
};
