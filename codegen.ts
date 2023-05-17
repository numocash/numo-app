import type { CodegenConfig } from "@graphql-codegen/cli";

const config = {
  avoidOptionals: true,
  immutableTypes: true,
  defaultScalarType: "string",
};

const codegenConfig: CodegenConfig = {
  generates: {
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
