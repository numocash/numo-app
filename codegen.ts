import type { CodegenConfig } from "@graphql-codegen/cli";

const config = {
  avoidOptionals: true,
  immutableTypes: true,
  defaultScalarType: "string",
};

const codegenConfig: CodegenConfig = {
  generates: {
    "./src/gql/uniswapV2/": {
      schema:
        "https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum-backup",
      documents: "graphql/uniswapV2.graphql",
      preset: "client",
      config,
      plugins: [],
    },
    "./src/gql/uniswapV3/": {
      schema: "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
      documents: "graphql/uniswapV3.graphql",
      preset: "client",
      config,
      plugins: [],
    },
    "./gql/numoen/": {
      schema:
        "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-arbitrum",
      documents: "graphql/numoen.graphql",
      preset: "client",
      config,
      plugins: [],
    },
  },
};
export default codegenConfig;
