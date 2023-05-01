import { useProvideLiquidity } from ".";
import Deposit from "./Deposit";
import Stats from "./Stats";
import Withdraw from "./Withdraw";
import Tab from "@/components/core/tabs";
import TokenIcon from "@/components/tokenIcon";
import Head from "next/head";

export default function ProvideLiquidityInner() {
  const { selectedLendgine } = useProvideLiquidity();
  const token0 = selectedLendgine.token0;
  const token1 = selectedLendgine.token1;

  const tabs = {
    deposit: { tab: "Deposit", panel: <Deposit /> },
    withdraw: { tab: "Withdraw", panel: <Withdraw /> },
  };

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
          <p className="mb-8 w-fit rounded-lg bg-white bg-opacity-50 p-2 font-medium">
            Provide liquidity
          </p>
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
            <p className="text-sm font-normal underline ">View details</p>
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <Stats />
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
      </div>
    </>
  );
}
