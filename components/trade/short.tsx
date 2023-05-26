import TokenAmountDisplay from "../tokenAmountDisplay";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { formatPercent } from "@/utils/format";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import Image from "next/image";
import { useMemo } from "react";

export default function Short({
  input,
}: {
  input: CurrencyAmount<WrappedTokenInfo> | undefined;
}) {
  const { upReturn, downReturn, upValue, downValue } = useMemo(() => {
    const upReturn = new Percent(-1, 2);
    const downReturn = new Percent(1);

    if (!input || input.equalTo(0)) return { upReturn, downReturn };

    const upValue = input.multiply(new Percent(1).add(upReturn));
    const downValue = input.multiply(downReturn);

    return { upReturn, downReturn, upValue, downValue };
  }, [input]);

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white overflow-clip flex w-full">
      <Image
        alt="short"
        src={"/short.png"}
        width={312}
        height={202}
        className=""
      />
      <div className="border-r-2 border-gray-200 w-[2px]" />
      <div className="flex flex-col w-full">
        <div className="h-1/2 flex w-full p-2 flex-col gap-2">
          <p className="p5">Value if price -50%</p>
          {downValue ? (
            <TokenAmountDisplay className="p1" amount={downValue} showSymbol />
          ) : (
            <p className="p1">{formatPercent(downReturn)}</p>
          )}
        </div>
        <div className=" border-b-2 border-gray-200 w-full" />

        <div className="h-1/2 flex w-full p-2 flex-col gap-2">
          <p className="p5">Value if price 2x</p>
          {upValue ? (
            <TokenAmountDisplay className="p1" amount={upValue} showSymbol />
          ) : (
            <p className="p1">{formatPercent(upReturn)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
