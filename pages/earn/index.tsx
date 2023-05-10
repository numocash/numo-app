import Button from "@/components/core/button";
import HedgeUniswap from "@/components/earn/hedgeUniswap";
import LiquidStaking from "@/components/earn/liquidStaking";
import ProvideLiquidity from "@/components/earn/provideLiquidity";
import LoadingPage from "@/components/loadingPage";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { marketToLendgines } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

interface IEarn {
  lendgines: readonly Lendgine[];
}

const useEarnInternal = ({
  lendgines,
}: {
  lendgines?: readonly Lendgine[] | undefined;
} = {}): IEarn => {
  invariant(lendgines);
  return { lendgines };
};

export const { Provider: EarnProvider, useContainer: useEarn } =
  createContainer(useEarnInternal);

export default function Earn() {
  const lendginesQuery = useAllLendgines();

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card gap-4 flex flex-col lg:flex-row lg:justify-between">
        <h1 className="w-full">Earn on your assets</h1>
        <div className="w-full grid gap-4">
          <p className="p3">
            Numoen has created several strategies using our underlying PMMP. All
            strategies maintain maximum trustlessness and decentralization.
          </p>
          <Link href={"/create"}>
            <Button variant="primary" className="rounded-none">
              Create new market
            </Button>
          </Link>
        </div>
      </div>
      {lendginesQuery.status !== "success" ? (
        <LoadingPage />
      ) : (
        <EarnProvider initialState={{ lendgines: lendginesQuery.lendgines }}>
          <EarnInner />
        </EarnProvider>
      )}
    </>
  );
}

export function EarnInner() {
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
        }, {}),
      ),
    [lendgines],
  );

  const partitionedMarkets = useMemo(
    () =>
      environment.interface.hedgingMarkets?.map((hm) => ({
        market: hm,
        lendgines: marketToLendgines(hm, lendgines),
      })),
    [environment.interface.hedgingMarkets, lendgines],
  );

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {partitionedMarkets?.map((pm) => (
        <HedgeUniswap
          key={`pm${pm.market.quote.address}${pm.market.base.address}`}
          lendgines={pm.lendgines}
          market={pm.market}
        />
      ))}
      {environment.interface.liquidStaking && <LiquidStaking />}
      {environment.interface.liquidStaking && (
        <ProvideLiquidity
          lendgines={[environment.interface.liquidStaking.lendgine] as const}
          protocol="stpmmp"
        />
      )}
      {partitionedLendgines.map((pl) => (
        <ProvideLiquidity
          key={`pl${pl[0]!.address}`}
          lendgines={pl}
          protocol="pmmp"
        />
      ))}
    </div>
  );
}
