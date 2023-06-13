import Tab from "@/components/core/tabs";
import LoadingPage from "@/components/loadingPage";
import MarketSelection from "@/components/marketSelection";
import MintOrBurn from "@/components/trade/mintOrBurn";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import {
  lendgineToMarket,
  marketEqual,
  marketToLendgines,
} from "@/lib/lendgineValidity";
import { invert, nextHighestLendgine, nextLowestLendgine } from "@/lib/price";
import { Lendgine } from "@/lib/types/lendgine";
import { dedupe } from "@/utils/dedupe";
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

  const { startingMarket, markets } = useMemo(() => {
    const specialtyMarket = environment.interface.specialtyMarkets?.[0];

    const markets = lendgines.map((l) =>
      lendgineToMarket(
        l,
        environment.interface.wrappedNative,
        environment.interface.specialtyMarkets,
      ),
    );

    const startingMarket = specialtyMarket
      ? markets.find((m) => marketEqual(m, specialtyMarket)) ?? markets[0]!
      : markets[0]!;

    return {
      startingMarket,
      markets: dedupe(markets, (m) => `${m.quote.address}_${m.base.address}`),
    };
  }, [lendgines, environment]);

  const [selectedMarket, setSelectedMarket] = useState(startingMarket);

  const priceQuery = useMostLiquidMarket(selectedMarket);

  const { selectedLongLendgine, selectedShortLendgine } = useMemo(() => {
    if (priceQuery.status !== "success") return {};

    const matchingLendgines = marketToLendgines(selectedMarket, lendgines);

    const longLendgines = matchingLendgines.filter((l) =>
      l.token0.equals(selectedMarket.quote),
    );
    const shortLendgines = matchingLendgines.filter((l) =>
      l.token0.equals(selectedMarket.base),
    );

    const selectedLongLendgine =
      nextHighestLendgine({
        price: priceQuery.data.price,
        lendgines: longLendgines,
      }) ??
      nextLowestLendgine({
        price: priceQuery.data.price,
        lendgines: longLendgines,
      });

    const selectedShortLendgine =
      nextHighestLendgine({
        price: invert(priceQuery.data.price),
        lendgines: shortLendgines,
      }) ??
      nextLowestLendgine({
        price: invert(priceQuery.data.price),
        lendgines: shortLendgines,
      });

    return { selectedLongLendgine, selectedShortLendgine };
  }, [priceQuery, selectedMarket, lendgines]);

  const long = {
    deposit: {
      tab: "Long",
      panel: selectedLongLendgine ? (
        <MintOrBurn
          type="long"
          market={selectedMarket}
          lendgine={selectedLongLendgine}
        />
      ) : undefined,
    },
  };

  const short = {
    withdraw: {
      tab: "Short",
      panel: selectedShortLendgine ? (
        <MintOrBurn
          type="short"
          market={selectedMarket}
          lendgine={selectedShortLendgine}
        />
      ) : undefined,
    },
  };

  const tabs = { ...long, ...short };
  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-20">
        <MarketSelection
          selectedMarket={selectedMarket}
          onSelect={setSelectedMarket}
          markets={markets}
        />
        <div className="flex w-full max-w-lg flex-col gap-2">
          {tabs && <Tab tabs={tabs} />}
        </div>
      </div>
    </>
  );
};
