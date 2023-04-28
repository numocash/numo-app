import { utils } from "ethers";
import type { Address } from "wagmi";

import type { LendginesQuery } from "../gql/numoen/graphql";

export const parseLendgines = (
  lendginesQuery: LendginesQuery
): {
  token0: Address;
  token1: Address;
  token0Exp: number;
  token1Exp: number;
  upperBound: string;
  address: Address;
}[] => {
  return lendginesQuery.lendgines.map((l) => ({
    token0: utils.getAddress(l.token0.id),
    token1: utils.getAddress(l.token1.id),
    token0Exp: +l.token0Exp,
    token1Exp: +l.token1Exp,
    upperBound: l.upperBound,
    address: utils.getAddress(l.id),
  }));
};
