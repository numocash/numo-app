import Tab from "@/components/core/tabs";
import Stats from "@/components/hedge/stats";
import LoadingPage from "@/components/loadingPage";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useAddressToToken } from "@/hooks/useTokens";
import { isValidMarket } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";
import { Market } from "@/lib/types/market";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

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

function HedgeInner() {
  const { lendgines } = useHedge();
  const token0 = lendgines[0]!.token0;
  const token1 = lendgines[0]!.token1;

  const tabs = {
    mint: { tab: "Add hedge", panel: <></> },
    burn: { tab: "Remove hedge", panel: <></> },
  };

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="w-full max-w-5xl overflow-clip rounded-xl border-2 border-gray-200 bg-white">
        <div className="flex h-36 w-full flex-col justify-end bg-gradient-to-tr from-[#fff] to-[#ff007a] p-4">
          <div className="flex w-full items-end justify-between">
            <p className="p2 mb-8 h-fit w-fit rounded-lg bg-white bg-opacity-50 p-2">
              Hedge Uniswap V3
            </p>
            <Image
              src="/uniswap.svg"
              height={144}
              width={144}
              className="relative top-[30px]"
              alt={"uniswap"}
            />
          </div>
        </div>
        <div className="relative left-[16px] top-[-32px] flex w-fit items-center rounded-lg bg-white p-2">
          <TokenIcon tokenInfo={token0} size={48} />
          <TokenIcon tokenInfo={token1} size={48} />
        </div>

        <div className="-mt-8 flex flex-col gap-4 p-6 lg:flex-row lg:justify-between">
          <h2 className="">
            {token0.symbol} + {token1.symbol}
          </h2>
          <div className="grid gap-2">
            <p className="p3 max-w-md">
              Provide liquidity to an AMM and earn from lending the position
              out.
            </p>
            <p className="p4 underline">View details</p>
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <Stats />
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
      </div>
    </>
  );
}
