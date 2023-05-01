import Head from "next/head";
import Link from "next/link";

import invariant from "tiny-invariant";

import { createContainer } from "unstated-next";

import Button from "@/components/core/button";
import LoadingPage from "@/components/loadingPage";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import type { Lendgine } from "@/lib/types/lendgine";

import EarnInner from "./earnInner";

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
      <div className="top-card">
        <h1>Earn on your assets</h1>
        <div className="grid gap-2">
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
