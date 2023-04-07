import { useAllLendgines } from "./useAllLendgines";
import { useEnvironment } from "../contexts/useEnvironment";
import { lendgineToMarket, marketToLendgines } from "../lib/lendgineValidity";
import type { Lendgine } from "../lib/types/lendgine";
import type { Market } from "../lib/types/market";

export const useLendgineToMarket = (lendgine: Lendgine): Market => {
  const environment = useEnvironment();

  return lendgineToMarket(
    lendgine,
    environment.interface.wrappedNative,
    environment.interface.specialtyMarkets
  );
};

export const useMarketToLendgines = (
  market: Market
): readonly Lendgine[] | null => {
  const lendgines = useAllLendgines();
  if (!lendgines) return null;
  return marketToLendgines(market, lendgines);
};
