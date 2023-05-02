import LoadingPage from "@/components/loadingPage";
import Liquidity from "@/components/positions/liquidity";
import PowerTokens from "@/components/positions/powerTokens";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import type { Lendgine } from "@/lib/types/lendgine";
import Head from "next/head";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

interface IPosition {
  lendgines: readonly Lendgine[];
}

const usePositionInternal = ({
  lendgines,
}: {
  lendgines?: readonly Lendgine[] | undefined;
} = {}): IPosition => {
  invariant(lendgines);
  return { lendgines };
};

export const { Provider: PositionProvider, useContainer: usePosition } =
  createContainer(usePositionInternal);

export default function Positions() {
  const lendginesQuery = useAllLendgines();

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card">
        <h1>Your positions</h1>
      </div>
      {lendginesQuery.status !== "success" ? (
        <LoadingPage />
      ) : (
        <PositionProvider
          initialState={{ lendgines: lendginesQuery.lendgines }}
        >
          <PositionInner />
        </PositionProvider>
      )}
    </>
  );
}

function PositionInner() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 pt-6">
      <Liquidity />
      <PowerTokens />
    </div>
  );
}
