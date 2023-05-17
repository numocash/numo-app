import CenterSwitch from "@/components/CenterSwitch";
import Plus from "@/components/Plus";
import ContractAddress from "@/components/contractAddress";
import AsyncButton from "@/components/core/asyncButton";
import Popover from "@/components/core/popover";
import CurrencyAmountSelection from "@/components/currencyAmountSelection";
import { useEnvironment } from "@/contexts/environment";
import { useAllLendgines } from "@/hooks/useAllLendgines";
import { useDepositAmount } from "@/hooks/useAmounts";
import { useBalance } from "@/hooks/useBalance";
import { useChain } from "@/hooks/useChain";
import { useCreate } from "@/hooks/useCreate";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useTokens } from "@/hooks/useTokens";
import { AddressZero } from "@/lib/constants";
import { isValidLendgine } from "@/lib/lendgineValidity";
import { fractionToPrice, priceToFraction } from "@/lib/price";
import type { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { Beet } from "@/utils/beet";
import {
  formatDisplayWithSoftLimit,
  formatPrice,
  fractionToFloat,
} from "@/utils/format";
import tryParseCurrencyAmount from "@/utils/tryParseCurrencyAmount";
import { Fraction, Token } from "@uniswap/sdk-core";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import invariant from "tiny-invariant";
import { Address } from "viem";
import { useAccount } from "wagmi";

export default function Create() {
  const environment = useEnvironment();
  const { address } = useAccount();
  const chainID = useChain();

  const tokens = useTokens();
  const lendginesQuery = useAllLendgines();

  const [token0, setToken0] = useState<WrappedTokenInfo | undefined>(undefined);
  const [token1, setToken1] = useState<WrappedTokenInfo | undefined>(undefined);

  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const [bound, setBound] = useState(new Fraction(1));

  const token0Balance = useBalance(token0, address);
  const token1Balance = useBalance(token1, address);

  const priceQuery = useMostLiquidMarket(
    !!token0 && !!token1 ? { quote: token0, base: token1 } : null,
  );

  const lendgine = useMemo(
    () =>
      !!token0 && !!token1
        ? {
            token0,
            token1,
            token0Exp: token0.decimals,
            token1Exp: token1.decimals,
            bound: fractionToPrice(bound, token1, token0),
            address: AddressZero as Address,
            lendgine: new Token(chainID, AddressZero, 18),
          }
        : undefined,
    [bound, chainID, token0, token1],
  );

  const depositAmount = useDepositAmount(
    lendgine,
    tryParseCurrencyAmount(token0Input, token0) ??
      tryParseCurrencyAmount(token1Input, token1),
    "pmmp",
  );
  const create = useCreate(
    lendgine,
    tryParseCurrencyAmount(token0Input, token0) ??
      tryParseCurrencyAmount(token1Input, token1),
    "pmmp",
  );

  const onInput = useCallback((value: string, field: "token0" | "token1") => {
    field === "token0" ? setToken0Input(value) : setToken1Input(value);
    field === "token0" ? setToken1Input("") : setToken0Input("");
  }, []);

  const removeToken0 = useMemo(
    () => tokens.filter((t) => t !== token0),
    [token0, tokens],
  );

  const removeToken1 = useMemo(
    () => tokens.filter((t) => t !== token1),
    [token1, tokens],
  );

  const disableReason = useMemo(
    () =>
      !token0 || !token1
        ? "Select a token"
        : !priceQuery.data
        ? "Loading"
        : priceToFraction(priceQuery.data.price).greaterThan(bound)
        ? "Bound can't be below current price"
        : !lendgine ||
          !isValidLendgine(
            lendgine,
            environment.interface.wrappedNative,
            environment.interface.specialtyMarkets,
          )
        ? "Does not conform to the rules of valid markets"
        : !token0Input && !token1Input
        ? "Enter an amount"
        : !tryParseCurrencyAmount(token0Input, token0) ??
          !tryParseCurrencyAmount(token1Input, token1)
        ? "Invalid amount"
        : lendginesQuery.status !== "success"
        ? "Loading"
        : lendginesQuery.lendgines.find(
            (l) =>
              l.token0.equals(token0) &&
              l.token1.equals(token1) &&
              l.bound.equalTo(fractionToPrice(bound, token1, token0)),
          )
        ? " Market already exists"
        : depositAmount.status !== "success" ||
          create.status !== "success" ||
          !token0Balance.data ||
          !token1Balance.data
        ? "Loading"
        : depositAmount.amount0.greaterThan(token0Balance.data) ||
          depositAmount.amount1.greaterThan(token1Balance.data)
        ? "Insufficient amount"
        : null,
    [
      bound,
      create.status,
      depositAmount.amount0,
      depositAmount.amount1,
      depositAmount.status,
      environment.interface.specialtyMarkets,
      environment.interface.wrappedNative,
      lendgine,
      lendginesQuery.lendgines,
      lendginesQuery.status,
      priceQuery.data,
      token0,
      token0Balance.data,
      token0Input,
      token1,
      token1Balance.data,
      token1Input,
    ],
  );

  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card">
        <h1>Create new market</h1>
        <p className="p3">
          Numoen allows for the permissionless creation of markets. Read{" "}
          <span>
            <Link href="https://docs.numoen.com" className="underline">
              here
            </Link>
          </span>{" "}
          to learn more about the structure of a Numoen market.
        </p>
      </div>
      <div className="flex w-full max-w-lg flex-col gap-2 pt-12">
        <div className="rounded-xl border-2 border-gray-200 bg-white">
          <CurrencyAmountSelection
            onSelect={setToken1}
            tokens={removeToken0}
            selectedToken={token1}
            value={
              token1Input === ""
                ? formatDisplayWithSoftLimit(
                    Number(depositAmount.amount1?.toFixed(6) ?? 0),
                    4,
                    10,
                  ) ?? ""
                : token1Input
            }
            onChange={(value) => {
              onInput(value, "token1");
            }}
            type="select"
            amount={token1Balance.data}
            label="Long"
          />
          <div className=" w-full border-b-2 border-gray-200" />
          <CenterSwitch icon="plus" />
          <CurrencyAmountSelection
            onSelect={setToken0}
            tokens={removeToken1}
            selectedToken={token0}
            value={
              token0Input === ""
                ? formatDisplayWithSoftLimit(
                    Number(depositAmount.amount0?.toFixed(6) ?? 0),
                    4,
                    10,
                  ) ?? ""
                : token0Input
            }
            onChange={(value) => {
              onInput(value, "token0");
            }}
            type="select"
            label="Short"
            amount={token0Balance.data}
          />
        </div>

        <div className="flex h-12 flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-2">
          <div className="flex w-full items-center justify-between">
            <div className="space-x-2 items-center flex">
              <p className="p2">Bound</p>
              <Popover
                className="flex"
                button={<IoIosInformationCircleOutline className="h-6 w-6" />}
                contents={
                  <div className="flex p-2 bg-white rounded-xl border-2 border-gray-200 w-64">
                    Price where all liquidity is swapped into the short token
                  </div>
                }
                placement="auto"
              />
              {priceQuery.data && (
                <p className="p5">
                  (Price: {formatPrice(priceQuery.data.price)} {token0?.symbol}{" "}
                  / {token1?.symbol})
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <p className="p2 text-end">
                {formatDisplayWithSoftLimit(fractionToFloat(bound), 4, 6, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                })}
              </p>
              <Plus icon="minus" onClick={() => setBound(bound.divide(2))} />
              <Plus icon="plus" onClick={() => setBound(bound.multiply(2))} />
            </div>
          </div>
        </div>

        <AsyncButton
          variant="primary"
          className="p1 h-12"
          disabled={!!disableReason}
          onClick={async () => {
            invariant(token0 && token1, "token invariant");
            invariant(create.data, "create invariant");
            await Beet(create.data);

            setToken0(undefined);
            setToken1(undefined);
            setToken0Input("");
            setToken1Input("");
            setBound(new Fraction(1));
          }}
        >
          {disableReason ?? "Create new market"}
        </AsyncButton>
        <div className="w-full flex justify-center pt-12">
          <ContractAddress address={environment.procotol.pmmp.factory} />
        </div>
      </div>
    </>
  );
}
