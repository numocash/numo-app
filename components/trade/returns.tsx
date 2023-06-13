import LoadingBox from "../loadingBox";
import { HookArg } from "@/hooks/internal/types";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { fractionToPrice, priceToFraction } from "@/lib/price";
import { Market } from "@/lib/types/market";
import { formatPercent, formatPrice } from "@/utils/format";
import { Percent } from "@uniswap/sdk-core";
import { curveNatural } from "@visx/curve";
import { localPoint } from "@visx/event";
import type { EventType } from "@visx/event/lib/types";
import { GlyphCircle } from "@visx/glyph";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Line, LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { bisect } from "d3-array";
import { useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";

export default function Returns({
  market,
  long,
}: { market: HookArg<Market>; long: boolean }) {
  const priceQuery = useMostLiquidMarket(market);

  const { data, lowerData, upperData, xScale, yScale, min, max } =
    useMemo(() => {
      const min = -0.75;
      const max = 1.5;
      const points = 300;

      const baseReturns = new Array(points)
        .fill(null)
        .map((_, i) => ((max - min) * i) / points + min);
      // TODO: account for bounds
      const optionReturns = (r: number) =>
        long ? r * r + 2 * r : 1 / (r + 1) - 1;

      const data: [number, number][] = baseReturns.map((b) => [
        b,
        optionReturns(b),
      ]);

      const lowerData: [number, number][] = baseReturns
        .filter((b) => b <= 0)
        .map((b) => [b, optionReturns(b)]);

      const upperData: [number, number][] = baseReturns
        .filter((b) => b > 0)
        .map((b) => [b, optionReturns(b)]);

      const xScale = scaleLinear<number>({
        domain: [min, max],
      });
      const yScale = scaleLinear<number>({
        domain: [
          Math.min(optionReturns(min), optionReturns(max)),
          Math.max(optionReturns(min), optionReturns(max)),
        ],
      });

      return { data, lowerData, upperData, xScale, yScale, min, max };
    }, [long]);

  const getX = useMemo(() => (p: [number, number]) => p[0], []);
  const getY = useMemo(() => (p: [number, number]) => p[1], []);

  const [displayPoint, setDisplayPoint] = useState<[number, number]>([0, 0]);
  const resetDisplay = useCallback(() => {
    setDisplayPoint([0, 0]);
  }, []);
  const handleHover = useCallback(
    (event: Element | EventType) => {
      // pixels
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisect(
        data.map((d) => d[0]),
        x0,
        1,
      );

      const d0 = data[index - 1];
      invariant(d0); // TODO: why does Uniswap not need this
      const d1 = data[index]; // next data in terms of timestamp
      let point = d0;

      const hasNextData = d1;
      if (hasNextData) {
        point = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
      }

      if (point) {
        setDisplayPoint(point);
      }
    },
    [data, xScale],
  );

  const { price, projectedReturns } = useMemo(() => {
    const projectedReturns = new Percent(
      Math.round(displayPoint[1] * 100),
      100,
    );
    const underlyingReturns = new Percent(
      Math.round(displayPoint[0] * 100),
      100,
    );

    if (!priceQuery.data) return { projectedReturns };

    const price = fractionToPrice(
      priceToFraction(priceQuery.data.price).multiply(
        new Percent(1).add(underlyingReturns),
      ),
      priceQuery.data.price.baseCurrency,
      priceQuery.data.price.quoteCurrency,
    );

    return {
      price,
      projectedReturns,
    };
  }, [priceQuery.data]);

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white overflow-clip flex w-full">
      <ParentSize style={{ width: "100%" }} tw="pt-4">
        {(parent) => {
          xScale.range([0, parent.width]);
          const height = 200;
          yScale.range([height, 0]);
          return (
            <svg
              width={parent.width}
              height={height}
              className="justify-self-center col-span-2"
            >
              <title>returns</title>
              <Group top={0}>
                <Threshold<[number, number]>
                  id={"returns"}
                  data={data}
                  x={(d) => xScale(getX(d)) ?? 0}
                  y0={(d) => yScale(getY(d)) ?? 0}
                  y1={(_d) => yScale(0)}
                  clipAboveTo={0}
                  clipBelowTo={yScale(min)}
                  curve={curveNatural}
                  belowAreaProps={{
                    fill: "#ef4444",
                    fillOpacity: 0.1,
                  }}
                  aboveAreaProps={{
                    fill: "#22c509",
                    fillOpacity: 0.1,
                  }}
                />

                <LinePath<[number, number]>
                  curve={curveNatural}
                  data={lowerData}
                  x={(d) => xScale(getX(d)) ?? 0}
                  y={(d) => yScale(getY(d)) ?? 0}
                  stroke={long ? "#ef4444" : "#22c509"}
                  strokeWidth={2}
                  strokeOpacity={1}
                />
                <LinePath<[number, number]>
                  curve={curveNatural}
                  data={upperData}
                  x={(d) => xScale(getX(d)) ?? 0}
                  y={(d) => yScale(getY(d)) ?? 0}
                  stroke={long ? "#22c509" : "#ef4444"}
                  strokeWidth={2}
                  strokeOpacity={1}
                />
                <Line
                  from={{ x: xScale(min), y: yScale(0) }}
                  to={{ x: xScale(max), y: yScale(0) }}
                  stroke={"#dfdfdf"}
                  strokeWidth={2}
                  pointerEvents="none"
                />

                <Line
                  from={{ x: xScale(0), y: 0 }}
                  to={{ x: xScale(0), y: height }}
                  stroke={"#dfdfdf"}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="4,4"
                />
                <Line
                  from={{ x: xScale(displayPoint[0]), y: 0 }}
                  to={{ x: xScale(displayPoint[0]), y: height }}
                  stroke={"#4f4f4f"}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <GlyphCircle
                  left={xScale(0)}
                  top={yScale(0)}
                  size={50}
                  fill={"#000000"}
                  stroke={"#000000"}
                  strokeWidth={0.5}
                />
              </Group>

              <rect
                x={0}
                y={0}
                width={parent.width}
                height={height}
                fill="transparent"
                onTouchStart={handleHover}
                onTouchMove={handleHover}
                onMouseMove={handleHover}
                onMouseLeave={resetDisplay}
              />
            </svg>
          );
        }}
      </ParentSize>
      <div className="border-r-2 border-gray-200 w-[2px]" />
      <div className="flex flex-col w-full max-w-[10rem]">
        <div className="h-1/2 flex w-full p-2 flex-col">
          <p className="p5">Price</p>
          {price ? <p className="p1">{formatPrice(price)}</p> : <LoadingBox />}
        </div>
        <div className=" border-b-2 border-gray-200 w-full" />

        <div className="h-1/2 flex w-full p-2 flex-col">
          <p className="p5">Project returns</p>
          <p className="p1">{formatPercent(projectedReturns)}</p>
        </div>
      </div>
    </div>
  );
}
