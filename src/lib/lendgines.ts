import type { Token } from "@uniswap/sdk-core";

import type { Lendgine } from "./types/lendgine";

export const pickLongLendgines = (
  lendgines: readonly Lendgine[],
  base: Token
) => lendgines.filter((l) => l.token1.equals(base));

export const pickShortLendgines = (
  lendgines: readonly Lendgine[],
  base: Token
) => lendgines.filter((l) => l.token0.equals(base));

export const isLongLendgine = (lendgine: Lendgine, base: Token) =>
  lendgine.token1.equals(base);

export const isShortLendgine = (lendgine: Lendgine, base: Token) =>
  lendgine.token0.equals(base);
