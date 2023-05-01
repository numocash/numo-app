import { useMemo } from "react";

import { useEnvironment } from "@/contexts/environment";

import { lendgineToMarket } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";

import type { Market } from "@/lib/types/market";

import { useEarn } from ".";
import HedgeUniswap from "./hedgeUniswap";
import LiquidStaking from "./liquidStaking";
import ProvideLiquidity from "./provideLiquidity";

export default function EarnInner() {
  const environment = useEnvironment();
  const { lendgines } = useEarn();

  const partitionedLendgines = useMemo(
    () =>
      Object.values(
        lendgines.reduce((acc: Record<string, Lendgine[]>, cur) => {
          const key = `${cur.token0.address}_${cur.token1.address}`;
          const value = acc[key];
          return {
            ...acc,
            [key]: value ? value.concat(cur) : [cur],
          };
        }, {})
      ),
    [lendgines]
  );

  const partitionedMarkets = useMemo(
    () =>
      Object.values(
        lendgines.reduce(
          (
            acc: Record<string, { market: Market; lendgines: Lendgine[] }>,
            cur
          ) => {
            const market = lendgineToMarket(
              cur,
              environment.interface.wrappedNative,
              environment.interface.specialtyMarkets
            );
            const key = `${market.quote.address}_${market.base.address}`;
            const value = acc[key];
            return {
              ...acc,
              [key]: value
                ? { market: market, lendgines: value.lendgines.concat(cur) }
                : { market, lendgines: [cur] },
            };
          },
          {}
        )
      ),
    [
      environment.interface.specialtyMarkets,
      environment.interface.wrappedNative,
      lendgines,
    ]
  );

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {environment.interface.liquidStaking && <LiquidStaking />}
      {environment.interface.liquidStaking && (
        <ProvideLiquidity
          lendgines={[environment.interface.liquidStaking.lendgine] as const}
          protocol="stpmmp"
        />
      )}
      {partitionedLendgines.map((pl) => (
        <ProvideLiquidity
          key={"pl" + pl[0]!.address}
          lendgines={pl}
          protocol="pmmp"
        />
      ))}
      {partitionedMarkets.map((pm) => (
        <HedgeUniswap
          key={"pm" + pm.market.quote.address + pm.market.base.address}
          lendgines={pm.lendgines}
          market={pm.market}
        />
      ))}
    </div>
  );
}
