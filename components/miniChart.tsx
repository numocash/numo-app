import type { Price } from "@uniswap/sdk-core";
import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { extent } from "d3-array";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { PricePoint } from "@/graphql/uniswapV2";
import { fractionToPrice } from "@/lib/price";
import { Market } from "@/lib/types/market";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";

export default function MiniChart({
  priceHistory,
  currentPrice,
}: {
  market: Market;
  priceHistory: readonly PricePoint[];
  currentPrice: Price<WrappedTokenInfo, WrappedTokenInfo>;
}) {
  const gain = useMemo(() => {
    const oneDayOldPrice = priceHistory[priceHistory.length - 1]?.price;
    invariant(oneDayOldPrice, "no prices returned");

    return currentPrice.greaterThan(
      fractionToPrice(
        oneDayOldPrice,
        currentPrice.baseCurrency,
        currentPrice.quoteCurrency,
      ),
    );
  }, [currentPrice, priceHistory]);

  const getX = useMemo(() => (p: PricePoint) => p.timestamp, []);

  const getY = useMemo(
    () => (p: PricePoint) => parseFloat(p.price.toFixed(10)),
    [],
  );

  const xScale = scaleLinear<number>({
    domain: extent(priceHistory, getX) as [number, number],
  });
  const yScale = scaleLinear<number>({
    domain: extent(priceHistory, getY) as [number, number],
  });

  // update scale output ranges
  xScale.range([0, 100]);
  yScale.range([40, 0]);

  return (
    <svg width={100} height={50} className="justify-self-center flex ">
      <title>mini chart</title>
      <Group top={5}>
        <LinePath<PricePoint>
          curve={curveNatural}
          data={(priceHistory as PricePoint[]) ?? undefined}
          x={(d) => xScale(getX(d)) ?? 0}
          y={(d) => yScale(getY(d)) ?? 0}
          stroke={
            gain === true ? "#00C55E" : gain === false ? "#FF4941" : "#000"
          }
          strokeWidth={2}
          strokeOpacity={1}
        />
      </Group>
    </svg>
  );
}
