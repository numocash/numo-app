import Head from "next/head";

import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import LoadingPage from "@/components/loadingPage";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import type { Lendgine } from "@/lib/types/lendgine";

import PositionInner from "./positionInner";

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
