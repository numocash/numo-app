import Tab from "@/components/core/tabs";
import Stats from "@/components/hedge/stats";
import LoadingBox from "@/components/loadingBox";
import LoadingPage from "@/components/loadingPage";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useAddressToToken } from "@/hooks/useTokens";
import {
  useNumberOfPositions,
  useUniswapPositionsValue,
} from "@/hooks/useUniswapV3";
import { isValidMarket } from "@/lib/lendgineValidity";
import {
  fractionToPrice,
  nextHighestLendgine,
  nextLowestLendgine,
  priceToFraction,
} from "@/lib/price";
import type { Lendgine } from "@/lib/types/lendgine";
import { Market } from "@/lib/types/market";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { Price } from "@uniswap/sdk-core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";
import { useAccount } from "wagmi";

interface IHedge {
  lendgines: Lendgine[];
  protocol: Protocol;
  market: Market;
  selectedLendgine: Lendgine;
}

const useHedgeInternal = ({
  lendgines,
  market,
  price,
}: {
  lendgines?: Lendgine[] | undefined;
  market?: Market | undefined;
  price?: Price<WrappedTokenInfo, WrappedTokenInfo>;
} = {}): IHedge => {
  invariant(lendgines && market && price);

  const start = useMemo(() => {
    invariant(price);

    const lh = nextHighestLendgine({
      price: fractionToPrice(
        priceToFraction(price).multiply(3).divide(2),
        price.baseCurrency,
        price.quoteCurrency,
      ),
      lendgines,
    });
    const l = nextHighestLendgine({
      price,
      lendgines,
    });
    const ll = nextLowestLendgine({
      price,
      lendgines,
    });
    return lh ?? l ?? ll ?? lendgines[0]!;
  }, [price, lendgines]);

  return { lendgines, protocol: "pmmp", market, selectedLendgine: start };
};

export const { Provider: HedgeProvider, useContainer: useHedge } =
  createContainer(useHedgeInternal);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token0, token1 } = ctx.query;

  if (
    !token0 ||
    !token1 ||
    typeof token0 !== "string" ||
    typeof token1 !== "string"
  )
    return { notFound: true };
  return { props: { token0, token1 } };
};

export default function Hedge({
  token0,
  token1,
}: { token0: string; token1: string }) {
  const environment = useEnvironment();
  const lendginesQuery = useAllLendgines();

  const quoteToken = useAddressToToken(token0);
  const baseToken = useAddressToToken(token1);

  const priceQuery = useMostLiquidMarket(
    quoteToken && baseToken
      ? { quote: quoteToken, base: baseToken }
      : undefined,
  );

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
  return lendginesQuery.status !== "success" || !priceQuery.data?.price ? (
    <LoadingPage />
  ) : (
    <HedgeProvider
      initialState={{
        lendgines,
        market,
        price: priceQuery.data.price,
      }}
    >
      <HedgeInner />
    </HedgeProvider>
  );
}

function HedgeInner() {
  const { address } = useAccount();
  const { market } = useHedge();
  const token0 = market.quote;
  const token1 = market.base;

  const numPositionsQuery = useNumberOfPositions(address, market);
  const positionsValueQuery = useUniswapPositionsValue(address, market);

  const tabs = {
    mint: { tab: "Add hedge", panel: <></> },
    burn: { tab: "Remove hedge", panel: <></> },
  };

  // TODO: add component for removing out of bounds power

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
            {/* <Toggle
              items={["Long ETH"]}
              value={"Long ETH"}
              onChange={() => {
                return;
              }}
              className="bg-white bg-opacity-50 rounded-xl w-fit overflow-clip p-0.5 p2 flex items-center justify-center"
            /> */}
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
            {/* <p className="p4 underline">View details</p> */}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-gray-900 p-6 flex flex-col w-full gap-6 max-w-5xl mt-12">
        <p className="p1 text-white">Your Uniswap positions</p>
        <div className="w-full flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col gap-1 w-full">
            <p className="p5 text-gray-300">Total value</p>
            {positionsValueQuery.status === "success" ? (
              <TokenAmountDisplay
                className="p1 text-white"
                amount={positionsValueQuery.value}
                showSymbol
              />
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-700" />
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="p5 text-gray-300">Active positions</p>
            {numPositionsQuery.status === "success" ? (
              <p className="p1 text-white">{numPositionsQuery.amount}</p>
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-700" />
            )}
          </div>
        </div>
        <Link href={"https://app.uniswap.org/#/pools"} target="_blank">
          <div className="space-x-2 flex items-center">
            <p className="p2 text-[#3b82f6]">Manage positions</p>
            <FaChevronDown scale={0.75} className="fill-[#3b82f6] -rotate-90" />
          </div>
        </Link>
      </div>

      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <Stats />
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
        {/* <ContractAddress
          address={environment.interface.liquidStaking!.lendgine.address}
        /> */}
      </div>
    </>
  );
}
