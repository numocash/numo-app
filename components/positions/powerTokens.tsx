import CenterSwitch from "@/components/CenterSwitch";
import AsyncButton from "@/components/core/asyncButton";
import Button from "@/components/core/button";
import Dialog from "@/components/core/dialog";
import CurrencyAmountDisplay from "@/components/currencyAmountDisplay";
import CurrencyAmountRow from "@/components/currencyAmountRow";
import CurrencyIcon from "@/components/currencyIcon";
import LoadingBox from "@/components/loadingBox";
import Slider from "@/components/slider";
import type { Protocol } from "@/constants";
import { useBurnAmount } from "@/hooks/useAmounts";
import { useBalance } from "@/hooks/useBalance";
import { useBalances } from "@/hooks/useBalances";
import { useBurn } from "@/hooks/useBurn";
import { useLendgines } from "@/hooks/useLendgines";
import { useValue } from "@/hooks/useValue";
import { calculateBorrowRate } from "@/lib/jumprate";
import type { Lendgine, LendgineInfo } from "@/lib/types/lendgine";
import { usePosition } from "@/pages/positions";
import { Beet } from "@/utils/beet";
import { formatPercent } from "@/utils/format";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export default function PowerTokens() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { lendgines } = usePosition();
  const lendginesQuery = useLendgines(lendgines);

  const tokens = useMemo(() => lendgines.map((l) => l.lendgine), [lendgines]);
  const balanceQuery = useBalances(tokens, address);

  const validLendgines = useMemo(() => {
    if (balanceQuery.some((d) => !d.data)) return undefined;
    return balanceQuery.reduce(
      (acc, cur, i) => (cur.data!.greaterThan(0) ? acc.concat(i) : acc),
      new Array<number>(),
    );
  }, [balanceQuery]);

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border-2 border-gray-200 bg-white py-6">
      <div className="lg:(flex-row justify-between) flex flex-col gap-4 px-2 sm:px-6">
        <h2 className="">Power Tokens</h2>
        <p className="p3">
          Liquidation-free derivatives that can be used to speculate or hedge.
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
            <p className="p5 justify-self-end hidden sm:flex">Funding APR</p>
            <p className="p5 justify-self-end">Value</p>
            <p className="p5 justify-self-end">Action</p>
          </div>
          <div className="flex w-full flex-col">
            {validLendgines.map((i) => (
              <PowerTokenItem
                key={`${lendgines[i]!.address}pt`}
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
  const [open, setOpen] = useState(false);
  const { address } = useAccount();

  const [withdrawPercent, setWithdrawPercent] = useState(20);

  const balanceQuery = useBalance(lendgine.lendgine, address);

  const shares = useMemo(
    () =>
      balanceQuery.data
        ? balanceQuery.data.multiply(withdrawPercent).divide(100)
        : undefined,
    [balanceQuery.data, withdrawPercent],
  );
  const burnAmount = useBurnAmount(lendgine, shares, "pmmp");
  const burn = useBurn(lendgine, shares, "pmmp");

  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !balanceQuery.data ||
          burnAmount.status !== "success" ||
          burn.status !== "success"
        ? "Loading"
        : balanceQuery.data.equalTo(0)
        ? "Insufficient balance"
        : null,
    [balanceQuery.data, burn.status, burnAmount.status, withdrawPercent],
  );

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
        {formatPercent(calculateBorrowRate({ lendgineInfo, protocol }))}
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        content={
          <div className="flex w-full flex-col gap-2 bg-white rounded-2xl p-4">
            <div className="flex flex-col rounded-xl border-2 border-gray-200 bg-white">
              <div className=" flex h-20 w-full flex-col justify-center gap-2 px-2 sm:px-6 py-2">
                <Slider
                  input={withdrawPercent}
                  onChange={(val) => setWithdrawPercent(val)}
                />
              </div>
              <div className=" w-full border-b-2 border-gray-200" />
              <CenterSwitch icon="arrow" />
              <CurrencyAmountRow
                amount={
                  burnAmount.collateral ??
                  CurrencyAmount.fromRawAmount(lendgine.token1, 0)
                }
              />
            </div>
            <AsyncButton
              variant="primary"
              className="p1 h-12"
              disabled={!!disableReason}
              onClick={async () => {
                invariant(burn.data);
                await Beet(burn.data);
              }}
            >
              {disableReason ?? "Withdraw"}
            </AsyncButton>
          </div>
        }
      />
      <Button
        variant="danger"
        className="p2 justify-self-end px-2 py-1"
        onClick={() => setOpen(true)}
      >
        Close
      </Button>
    </div>
  );
};
