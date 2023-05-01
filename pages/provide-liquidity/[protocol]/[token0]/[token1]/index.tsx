import ProvideLiquidityInner from "./provideLiquidityInner";
import LoadingPage from "@/components/loadingPage";
import type { Protocol } from "@/constants";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useAddressToToken } from "@/hooks/useTokens";
import { isValidMarket } from "@/lib/lendgineValidity";
import type { Lendgine } from "@/lib/types/lendgine";
import { utils } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

interface IProvideLiquidity {
  lendgines: readonly Lendgine[];
  protocol: Protocol;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;
}

const useProvideLiquidityInternal = ({
  protocol,
  lendgines,
}: {
  protocol?: Protocol;
  lendgines?: readonly Lendgine[] | undefined;
} = {}): IProvideLiquidity => {
  invariant(lendgines && protocol);

  const [selectedLendgine, setSelectedLendgine] = useState(lendgines[0]!);

  return { lendgines, protocol, selectedLendgine, setSelectedLendgine };
};

export const {
  Provider: ProvideLiquidityProvider,
  useContainer: useProvideLiquidity,
} = createContainer(useProvideLiquidityInternal);

export default function ProvideLiquidity() {
  const router = useRouter();
  const environment = useEnvironment();
  const lendginesQuery = useAllLendgines();

  const { protocol, token0, token1 } = router.query;
  invariant(token0 && token1 && protocol);

  const quoteToken = useAddressToToken(token0 as string);
  const baseToken = useAddressToToken(token1 as string);

  if (protocol === "stpmmp") {
    if (environment.interface.liquidStaking) {
      if (
        utils.getAddress(token0 as string) ===
          utils.getAddress(
            environment.interface.liquidStaking.lendgine.token0.address,
          ) &&
        utils.getAddress(token1 as string) ===
          utils.getAddress(
            environment.interface.liquidStaking.lendgine.token1.address,
          )
      ) {
        return (
          <ProvideLiquidityProvider
            initialState={{
              lendgines: [
                environment.interface.liquidStaking.lendgine,
              ] as const,
              protocol: "stpmmp",
            }}
          >
            <ProvideLiquidityInner />
          </ProvideLiquidityProvider>
        );
      }
    } else {
      throw Error();
    }
  }

  // if they aren't in the token list
  invariant(baseToken && quoteToken);

  // if the market isn't valid
  const market = { base: baseToken, quote: quoteToken };
  if (
    !isValidMarket(
      market,
      environment.interface.wrappedNative,
      environment.interface.specialtyMarkets,
    )
  )
    throw Error();

  if (lendginesQuery.status !== "success") return <LoadingPage />;

  // filter lendgines
  const lendgines = lendginesQuery.lendgines.filter(
    (l) => quoteToken.equals(l.token0) && baseToken.equals(l.token1),
  );
  return lendginesQuery.status !== "success" ? (
    <LoadingPage />
  ) : (
    <ProvideLiquidityProvider
      initialState={{
        lendgines,
        protocol: protocol as Protocol,
      }}
    >
      <ProvideLiquidityInner />
    </ProvideLiquidityProvider>
  );
}
