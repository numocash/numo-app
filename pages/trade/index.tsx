import Tab from "@/components/core/tabs";
import LoadingPage from "@/components/loadingPage";
import Long from "@/components/trade/long";
import MarketLoading from "@/components/trade/marketLoading";
import Short from "@/components/trade/short";
import Stats from "@/components/trade/stats";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { lendgineToMarket } from "@/lib/lendgineValidity";
import { Lendgine } from "@/lib/types/lendgine";
import Head from "next/head";
import { useMemo, useState } from "react";

export default function Trade() {
  const lendginesQuery = useAllLendgines();

  return lendginesQuery.status !== "success" ? (
    <LoadingPage />
  ) : (
    <TradeInner lendgines={lendginesQuery.lendgines} />
  );
}

const TradeInner = ({
  lendgines,
}: {
  lendgines: Lendgine[];
}) => {
  const environment = useEnvironment();

  const startingMarket = useMemo(() => {
    const specialtyMarket = environment.interface.specialtyMarkets?.[0];
    return (
      specialtyMarket ??
      lendgineToMarket(
        lendgines[0]!,
        environment.interface.wrappedNative,
        environment.interface.specialtyMarkets,
      )
    );
  }, [lendgines, environment]);

  const [selectedMarket, setSelectedMarket] = useState(startingMarket);

  const priceQuery = useMostLiquidMarket(selectedMarket);

  // useMemo(() => {
  //   if (priceQuery.status !== "success") return undefined;

  //   const matchingLendgines = marketToLendgines(selectedMarket, lendgines);
  // }, [priceQuery, selectedMarket, lendgines]);

  const tabs = {
    deposit: {
      tab: "Long",
      panel: <Long market={selectedMarket} lendgine={undefined} />,
    },
    withdraw: {
      tab: "Short",
      panel: <Short market={selectedMarket} lendgine={undefined} />,
    },
  } as const;

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-24">
        <MarketLoading />
        <Stats />
        {/* <Stats /> */}
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
      </div>
    </>
  );
};
