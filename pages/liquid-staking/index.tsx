import ContractAddress from "@/components/contractAddress";
import Tab from "@/components/core/tabs";
import Stats from "@/components/liquid-staking/Stats";
import Burn from "@/components/liquid-staking/burn";
import Mint from "@/components/liquid-staking/mint";
import { useEnvironment } from "@/contexts/environment";
import Head from "next/head";

export default function LiquidStaking() {
  const environment = useEnvironment();

  const tabs = {
    deposit: { tab: "Deposit", panel: <Mint /> },
    withdraw: { tab: "Withdraw", panel: <Burn /> },
  } as const;

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card">
        <h1>Earn on your assets</h1>
        <div className="grid gap-2">
          <p className="p3">
            Numoen has created several strategies using our underlying PMMP. All
            strategies maintain maximum trustlessness and decentralization.
          </p>
        </div>
      </div>
      <div className="flex w-full max-w-3xl flex-col items-center gap-12 pt-12">
        <Stats />
        <div className="flex w-full max-w-lg flex-col gap-2">
          <Tab tabs={tabs} />
        </div>
        <ContractAddress
          address={environment.interface.liquidStaking!.lendgine.address}
        />
      </div>
    </>
  );
}
