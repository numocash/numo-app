import { useRouter } from "next/router";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import LoadingPage from "@/components/loadingPage";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useAddressToToken } from "@/hooks/useTokens";
import { isValidMarket } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";

import HedgeInner from "./hedgeInner";
import { Market } from "@/lib/types/market";

interface IHedge {
  lendgines: readonly Lendgine[];
  protocol: Protocol;
  market: Market;
}

const useHedgeInternal = ({
  lendgines,
  market,
}: {
  lendgines?: readonly Lendgine[] | undefined;
  market?: Market | undefined;
} = {}): IHedge => {
  invariant(lendgines && market);

  return { lendgines, protocol: "pmmp", market };
};

export const { Provider: HedgeProvider, useContainer: useHedge } =
  createContainer(useHedgeInternal);

export default function Hedge() {
  const router = useRouter();
  const environment = useEnvironment();
  const lendginesQuery = useAllLendgines();

  const { token0, token1 } = router.query;
  invariant(token0 && token1);

  const quoteToken = useAddressToToken(token0 as string);
  const baseToken = useAddressToToken(token1 as string);

  // if they aren't in the token list
  invariant(baseToken && quoteToken);

  // if the market isn't valid
  const market = { base: baseToken, quote: quoteToken };
  if (
    !isValidMarket(
      market,
      environment.interface.wrappedNative,
      environment.interface.specialtyMarkets,
    )
  )
    throw Error();

  if (lendginesQuery.status !== "success") return <LoadingPage />;

  // filter lendgines
  const lendgines = lendginesQuery.lendgines.filter(
    (l) => quoteToken.equals(l.token0) && baseToken.equals(l.token1),
  );
  return lendginesQuery.status !== "success" ? (
    <LoadingPage />
  ) : (
    <HedgeProvider
      initialState={{
        lendgines,
        market,
      }}
    >
      <HedgeInner />
    </HedgeProvider>
  );
}
