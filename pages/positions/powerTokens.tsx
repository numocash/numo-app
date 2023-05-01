import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import Button from "@/components/core/button";
import LoadingBox from "@/components/loadingBox";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import TokenIcon from "@/components/tokenIcon";
import type { Protocol } from "@/constants";
import { useBalances } from "@/hooks/useBalances";
import { useLendgines } from "@/hooks/useLendgines";

import { useValue } from "@/hooks/useValue";
import { calculateBorrowRate } from "@/lib/jumprate";
import type { Lendgine, LendgineInfo } from "@/lib/types/lendgine";
import { formatPercent } from "@/utils/format";

import { usePosition } from ".";

export default function PowerTokens() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { lendgines } = usePosition();
  const lendgineInfoQuery = useLendgines(lendgines);

  const tokens = useMemo(() => lendgines.map((l) => l.lendgine), [lendgines]);
  const balanceQuery = useBalances(tokens, address);

  const validLendgines = useMemo(() => {
    if (!balanceQuery.data) return undefined;
    return balanceQuery.data.reduce(
      (acc, cur, i) => (cur.greaterThan(0) ? acc.concat(i) : acc),
      new Array<number>(),
    );
  }, [balanceQuery.data]);

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border-2 border-gray-200 bg-white py-6">
      <div className="lg:(flex-row justify-between) flex flex-col gap-4 px-6">
        <h2 className="">Power Tokens</h2>
        <p className="p3">
          Liquidation-free derivatives that can be used to speculate or hedge.
        </p>
      </div>

      {!isConnected ? (
        <Button
          variant="primary"
          className="p2 mx-6 h-12"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      ) : !validLendgines || !lendgineInfoQuery.data ? (
        <div className="mx-6 flex w-full flex-col gap-2">
          {[...Array(5).keys()].map((i) => (
            <LoadingBox className="h-12 w-full" key={`${i}load`} />
          ))}
        </div>
      ) : validLendgines.length === 0 ? (
        <div className="p2 mx-6 flex h-12 items-center justify-center rounded-xl bg-gray-200">
          No positions
        </div>
      ) : (
        <>
          <div className="mt-6 grid w-full grid-cols-4 px-6">
            <p className="p5">Pair</p>
            <p className="p5 justify-self-end">Funding APR</p>
            <p className="p5 justify-self-end">Value</p>
            <p className="p5 justify-self-end">Action</p>
          </div>
          <div className="flex w-full flex-col">
            {validLendgines.map((i) => (
              <PowerTokenItem
                key={`${lendgines[i]!.address}pt`}
                lendgine={lendgines[i]!}
                protocol={"pmmp"}
                lendgineInfo={lendgineInfoQuery.data![i]!}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type PowerTokenProps<L extends Lendgine = Lendgine> = {
  lendgine: L;
  protocol: Protocol;
  lendgineInfo: LendgineInfo<L>;
};

const PowerTokenItem: React.FC<PowerTokenProps> = ({
  lendgine,
  protocol,
  lendgineInfo,
}: PowerTokenProps) => {
  const valueQuery = useValue(lendgine, protocol);

  return (
    <div className="grid h-[72px] w-full transform grid-cols-4 items-center px-6 duration-300 ease-in-out hover:bg-gray-200">
      <div className="flex items-center">
        <TokenIcon tokenInfo={lendgine.token0} size={32} />
        <TokenIcon tokenInfo={lendgine.token1} size={32} />

        <p className="p1 ml-2">
          {lendgine.token0.symbol} + {lendgine.token1.symbol}
        </p>
      </div>
      <p className="p2 justify-self-end">
        {formatPercent(calculateBorrowRate({ lendgineInfo, protocol }))}
      </p>
      <p className="p2 justify-self-end">
        {valueQuery.status === "success" ? (
          <TokenAmountDisplay
            amount={valueQuery.value}
            showSymbol={true}
            className="p2"
          />
        ) : (
          <LoadingBox />
        )}
      </p>
      <Button variant="danger" className="p2 justify-self-end px-2 py-1">
        Close
      </Button>
    </div>
  );
};
