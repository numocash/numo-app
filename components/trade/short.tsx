import ContractAddress from "../contractAddress";
import AsyncButton from "../core/asyncButton";
import CurrencyAmountSelection from "../currencyAmountSelection";
import { useBalance } from "@/hooks/useBalance";
import { Lendgine } from "@/lib/types/lendgine";
import { Market } from "@/lib/types/market";
import tryParseCurrencyAmount from "@/utils/tryParseCurrencyAmount";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

export default function Short({
  market,
  lendgine,
}: {
  market: Market;
  lendgine: Lendgine | undefined;
}) {
  const { address } = useAccount();
  const [input, setInput] = useState("");
  const balanceQuery = useBalance(market.quote, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, market.quote),
    [input, market.quote],
  );

  const disableReason = useMemo(
    () => (!lendgine ? "Loading" : null),
    [lendgine],
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="rounded-xl border-2 border-gray-200 bg-white">
        <CurrencyAmountSelection
          type="display"
          selectedToken={market.quote}
          value={input}
          onChange={setInput}
          amount={balanceQuery.data}
        />
      </div>

      <div className="rounded-xl border-2 border-gray-200 bg-white overflow-clip flex">
        <Image
          alt="short"
          src={"/short.png"}
          width={312}
          height={202}
          className=""
        />
        <div className="border-r-2 border-gray-200 w-[2px]" />
        <div className="flex flex-col w-full">
          <div className="h-1/2 flex w-full p-2">
            <p className="p5">Value if price -50%</p>
          </div>
          <div className=" border-b-2 border-gray-200 w-full" />
          <div className="h-1/2 flex w-full p-2">
            <p className="p5">Value if price 2x</p>
          </div>
        </div>
      </div>

      <AsyncButton
        variant="primary"
        className="p1 h-12"
        disabled={!!disableReason}
        onClick={async () => {
          setInput("");
        }}
      >
        {disableReason ?? "Trade"}
      </AsyncButton>
      {lendgine && <ContractAddress address={lendgine.address} />}
    </div>
  );
}
