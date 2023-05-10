import Tab from "@/components/core/tabs";
import Stats from "@/components/hedge/stats";
import LoadingBox from "@/components/loadingBox";
import LoadingPage from "@/components/loadingPage";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { feeTiers } from "@/graphql/uniswapV3";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useAddressToToken } from "@/hooks/useTokens";
import {
  usePositionManagerBalanceOf,
  usePositionsFromTokenIDs,
  useTokenIDsByIndex,
} from "@/hooks/useUniswapV3";
import { isValidMarket } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";
import { Market } from "@/lib/types/market";
import { utils } from "ethers";
import JSBI from "jsbi";
import { filter } from "lodash";
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

const filterUniswapPositions = (
  positions: NonNullable<ReturnType<typeof usePositionsFromTokenIDs>["data"]>,
  market: Market,
) => {
  return positions
    .filter(
      (p) =>
        (utils.getAddress(market.base.address) === utils.getAddress(p.token0) &&
          utils.getAddress(market.quote.address) ===
            utils.getAddress(p.token1)) ||
        (utils.getAddress(market.base.address) === utils.getAddress(p.token1) &&
          utils.getAddress(market.quote.address) ===
            utils.getAddress(p.token0)),
    )
    .map((p) => ({
      feeTier: p.fee.toString() as typeof feeTiers[keyof typeof feeTiers],
      token0:
        utils.getAddress(market.base.address) === utils.getAddress(p.token0)
          ? market.base
          : market.quote,
      token1:
        utils.getAddress(market.base.address) === utils.getAddress(p.token0)
          ? market.quote
          : market.base,
      tickLower: p.tickLower,
      tickUpper: p.tickUpper,
      liquidity: JSBI.BigInt(p.liquidity.toString()),
    }));
};

const positionValue = (
  positions: ReturnType<typeof filterUniswapPositions>,
  market: Market,
) => {};

function HedgeInner() {
  const { address } = useAccount();
  const { lendgines, market } = useHedge();
  const token0 = lendgines[0]!.token0;
  const token1 = lendgines[0]!.token1;

  const balanceQuery = usePositionManagerBalanceOf(address);
  const tokenIDQuery = useTokenIDsByIndex(
    address,
    balanceQuery.data ?? undefined,
  );
  const positionsQuery = usePositionsFromTokenIDs(tokenIDQuery.data);

  const filteredPositions = useMemo(
    () =>
      positionsQuery.data
        ? filterUniswapPositions(positionsQuery.data, market)
        : undefined,
    [positionsQuery.data, market],
  );
  // console.log(positionsQuery.data);

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
            {/* <p className="p4 underline">View details</p> */}
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <div className="rounded-xl bg-gray-900 p-6 flex flex-col w-full gap-6 max-w-xl">
          <p className="p1 text-white">Uniswap positions</p>
          <div className="w-full flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col gap-1 w-full">
              <p className="p5 text-gray-300">Total value</p>
              <div className="p1 text-white">
                <LoadingBox className="h-10 w-20 bg-gray-700" />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="p5 text-gray-300">Active positions</p>
              {filteredPositions ? (
                <p className="p1 text-white">{filteredPositions.length}</p>
              ) : (
                <LoadingBox className="h-10 w-20 bg-gray-700" />
              )}
            </div>
          </div>
          <Link href={"https://app.uniswap.org/#/pools"} target="_blank">
            <div className="space-x-2 flex items-center">
              <p className="p2 text-[#3b82f6]">Manage positions</p>
              <FaChevronDown
                scale={0.75}
                className="fill-[#3b82f6] -rotate-90"
              />
            </div>
          </Link>
        </div>
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
