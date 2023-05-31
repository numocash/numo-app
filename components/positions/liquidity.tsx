import Button from "@/components/core/button";
import CurrencyAmountDisplay from "@/components/currencyAmountDisplay";
import CurrencyIcon from "@/components/currencyIcon";
import LoadingBox from "@/components/loadingBox";
import type { Protocol } from "@/constants";
import { useLendgines } from "@/hooks/useLendgines";
import { useLendginesPositions } from "@/hooks/useLendginesPositions";
import { usePositionValue } from "@/hooks/useValue";
import { calculateSupplyRate } from "@/lib/jumprate";
import type { Lendgine, LendgineInfo } from "@/lib/types/lendgine";
import { usePosition } from "@/pages/positions";
import { formatPercent } from "@/utils/format";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export default function Liquidity() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { lendgines } = usePosition();
  const lendginesQuery = useLendgines(lendgines);

  const positionQuery = useLendginesPositions(lendgines, address, "pmmp");

  const validLendgines = useMemo(() => {
    if (positionQuery.some((d) => !d.data)) return undefined;
    return positionQuery.reduce(
      (acc, cur, i) =>
        cur.data!.size.greaterThan(0) || cur.data!.tokensOwed.greaterThan(0)
          ? acc.concat(i)
          : acc,
      new Array<number>(),
    );
  }, [positionQuery]);

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border-2 border-gray-200 bg-white py-6">
      <div className="lg:(flex-row justify-between) flex flex-col gap-4 px-2 sm:px-6">
        <h2 className="">Liquidity Positions</h2>
        <p className="p3">
          Provide liquidity to an AMM and earn from lending the position out.
        </p>
      </div>

      {!isConnected ? (
        <Button
          variant="primary"
          className="p2 mx-2 sm:mx-6 h-12"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      ) : !validLendgines || lendginesQuery.some((d) => !d.data) ? (
        <div className="mx-2 sm:mx-6 flex w-full flex-col gap-2">
          {[...Array(5).keys()].map((i) => (
            <LoadingBox className="h-12 w-full" key={`${i}load`} />
          ))}
        </div>
      ) : validLendgines.length === 0 ? (
        <div className="p2 mx-2 sm:mx-6 flex h-12 items-center justify-center rounded-xl bg-gray-200">
          No positions
        </div>
      ) : (
        <>
          <div className="mt-6 grid w-full grid-cols-3 sm:grid-cols-4 px-2 sm:px-6">
            <p className="p5">Pair</p>
            <p className="p5 justify-self-end hidden sm:flex">Reward APR</p>
            <p className="p5 justify-self-end">Value</p>
            <p className="p5 justify-self-end">Action</p>
          </div>
          <div className="flex w-full flex-col">
            {validLendgines.map((i) => (
              <LiquidityItem
                key={`${lendgines[i]!.address}liq`}
                lendgine={lendgines[i]!}
                protocol={"pmmp"}
                lendgineInfo={lendginesQuery[i]!.data!}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type LiquidityProps<L extends Lendgine = Lendgine> = {
  lendgine: L;
  protocol: Protocol;
  lendgineInfo: LendgineInfo<L>;
};

const LiquidityItem: React.FC<LiquidityProps> = ({
  lendgine,
  protocol,
  lendgineInfo,
}: LiquidityProps) => {
  const valueQuery = usePositionValue(lendgine, protocol);

  return (
    <div className="grid h-[72px] w-full transform grid-cols-3 sm:grid-cols-4 items-center px-2 sm:px-6 duration-300 ease-in-out hover:bg-gray-200">
      <div className="flex items-center">
        <CurrencyIcon
          currency={lendgine.token0}
          size={32}
          className="hidden sm:flex"
        />
        <CurrencyIcon
          currency={lendgine.token1}
          size={32}
          className="hidden sm:flex"
        />

        <p className="p2 sm:ml-2">
          {lendgine.token0.symbol} + {lendgine.token1.symbol}
        </p>
      </div>
      <p className="p2 justify-self-end hidden sm:flex">
        {formatPercent(calculateSupplyRate({ lendgineInfo, protocol }))}
      </p>
      <p className="p2 justify-self-end">
        {valueQuery.status === "success" ? (
          <CurrencyAmountDisplay
            amount={valueQuery.value}
            showSymbol={true}
            className="p2"
          />
        ) : (
          <LoadingBox />
        )}
      </p>
      <Link
        className="justify-self-end"
        href={`/provide-liquidity/${protocol}/${lendgine.token0.address}/${lendgine.token1.address}`}
      >
        <Button variant="primary" className="p2 px-2 py-1">
          View
        </Button>
      </Link>
    </div>
  );
};
