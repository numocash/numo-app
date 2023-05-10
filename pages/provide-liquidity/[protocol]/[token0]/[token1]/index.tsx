import ContractAddress from "@/components/contractAddress";
import Popover from "@/components/core/popover";
import Tab from "@/components/core/tabs";
import Toggle from "@/components/core/toggle";
import LoadingPage from "@/components/loadingPage";
import Deposit from "@/components/provide-liquidity/Deposit";
import Stats from "@/components/provide-liquidity/Stats";
import Withdraw from "@/components/provide-liquidity/Withdraw";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useAddressToToken } from "@/hooks/useTokens";
import { isValidMarket } from "@/lib/lendgineValidity";
import {
  fractionToPrice,
  nextHighestLendgine,
  nextLowestLendgine,
  priceMultiple,
  priceToFraction,
} from "@/lib/price";
import type { Lendgine } from "@/lib/types/lendgine";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { Price } from "@uniswap/sdk-core";
import { utils } from "ethers";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

interface IProvideLiquidity {
  lendgines: readonly Lendgine[];
  protocol: Protocol;
  price?: Price<WrappedTokenInfo, WrappedTokenInfo>;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;
}

const useProvideLiquidityInternal = ({
  protocol,
  lendgines,
  price,
}: {
  protocol?: Protocol;
  lendgines?: Lendgine[] | undefined;
  price?: Price<WrappedTokenInfo, WrappedTokenInfo>;
} = {}): IProvideLiquidity => {
  invariant(lendgines && protocol);

  const start = useMemo(() => {
    if (protocol === "stpmmp") return lendgines[0]!;

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
  }, [price, lendgines, protocol]);

  const [selectedLendgine, setSelectedLendgine] = useState(start);

  return { lendgines, protocol, selectedLendgine, setSelectedLendgine, price };
};

export const {
  Provider: ProvideLiquidityProvider,
  useContainer: useProvideLiquidity,
} = createContainer(useProvideLiquidityInternal);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { protocol, token0, token1 } = ctx.query;

  if (
    !protocol ||
    !token0 ||
    !token1 ||
    typeof protocol !== "string" ||
    typeof token0 !== "string" ||
    typeof token1 !== "string"
  )
    return { notFound: true };
  return { props: { protocol, token0, token1 } };
};

export default function ProvideLiquidity({
  protocol,
  token0,
  token1,
}: { protocol: string; token0: string; token1: string }) {
  const environment = useEnvironment();
  const lendginesQuery = useAllLendgines();

  const quoteToken = useAddressToToken(token0);
  const baseToken = useAddressToToken(token1);

  const priceQuery = useMostLiquidMarket(
    quoteToken && baseToken
      ? { quote: quoteToken, base: baseToken }
      : undefined,
  );

  if (protocol === "stpmmp") {
    if (environment.interface.liquidStaking) {
      if (
        utils.getAddress(token0 as string) ===
          utils.getAddress(
            environment.interface.liquidStaking.lendgine.token0.address,
          ) &&
        utils.getAddress(token1 as string) ===
          utils.getAddress(
            environment.interface.liquidStaking.lendgine.token1.address,
          )
      ) {
        return (
          <ProvideLiquidityProvider
            initialState={{
              lendgines: [environment.interface.liquidStaking.lendgine],
              protocol: "stpmmp",
            }}
          >
            <ProvideLiquidityInner />
          </ProvideLiquidityProvider>
        );
      }
    } else {
      throw Error();
    }
  }

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
  return !lendgines || !priceQuery.data?.price ? (
    <LoadingPage />
  ) : (
    <ProvideLiquidityProvider
      initialState={{
        lendgines,
        protocol: protocol as Protocol,
        price: priceQuery.data.price,
      }}
    >
      <ProvideLiquidityInner />
    </ProvideLiquidityProvider>
  );
}

function ProvideLiquidityInner() {
  const { selectedLendgine, setSelectedLendgine, lendgines, price } =
    useProvideLiquidity();
  const token0 = selectedLendgine.token0;
  const token1 = selectedLendgine.token1;

  const mults = useMemo(
    () =>
      price
        ? lendgines
            .map((l) => {
              return { multiple: priceMultiple(l, price), lendgine: l };
            })
            .sort((a, b) => (a.multiple > b.multiple ? 1 : -1))
            .reduce(
              (
                acc: Record<string, { multiple: string; lendgine: Lendgine }>,
                cur,
              ) => ({
                ...acc,
                [`${cur.multiple}x`]: {
                  multiple: `${cur.multiple}x`,
                  lendgine: cur.lendgine,
                },
              }),
              {},
            )
        : null,
    [lendgines, price],
  );

  const tabs = {
    deposit: { tab: "Deposit", panel: <Deposit /> },
    withdraw: { tab: "Withdraw", panel: <Withdraw /> },
  } as const;

  const items = Object.keys(mults ?? {});

  const [toggle, setToggle] = useState<typeof items[number]>(items[0]!);

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="w-full max-w-5xl overflow-clip rounded-xl border-2 border-gray-200 bg-white">
        <div
          className="flex h-36 w-full flex-col justify-end p-4"
          style={{
            backgroundImage: `linear-gradient(to top right, ${
              token0.color?.muted ?? "#dfdfdf"
            }, ${token1.color?.vibrant ?? "#dfdfdf"})`,
          }}
        >
          <div className="mb-8 flex gap-2 items-center">
            <p className="w-fit rounded-lg bg-white bg-opacity-50 p-2 p2">
              Provide liquidity
            </p>
            {mults && (
              <Toggle
                items={items}
                value={toggle}
                onChange={(val) => {
                  setToggle(val);
                  setSelectedLendgine(mults[val]!.lendgine);
                }}
                className="bg-white bg-opacity-50 rounded-xl w-fit overflow-clip p-0.5 p2 flex items-center justify-center"
              />
            )}
            {mults && (
              <Popover
                className="flex"
                button={
                  <IoIosInformationCircleOutline className="fill-white text-white h-6 w-6" />
                }
                contents={
                  <div className="flex p-2 bg-white rounded-xl border-2 border-gray-200 w-64">
                    Price movement until liquidity is out of range
                  </div>
                }
                placement="auto"
              />
            )}
          </div>
        </div>
        <div className="relative left-[16px] top-[-32px] flex w-fit items-center rounded-lg bg-white p-2">
          <TokenIcon tokenInfo={token0} size={48} />
          <TokenIcon tokenInfo={token1} size={48} />
        </div>

        <div className="-mt-8 flex flex-col gap-4 p-6 lg:flex-row lg:justify-between">
          <p className="text-2xl font-bold sm:text-4xl">
            {token0.symbol} + {token1.symbol}
          </p>
          <div className="grid gap-2">
            <p className="max-w-md text-[#8f8f8f] sm:text-lg">
              Provide liquidity to an AMM and earn from lending the position
              out.
            </p>
            {/* <p className="text-sm font-normal underline ">View details</p> */}
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <Stats />
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
        <ContractAddress address={selectedLendgine.address} />
      </div>
    </>
  );
}
