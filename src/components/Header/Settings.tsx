import { Percent } from "@uniswap/sdk-core";
import { clsx } from "clsx";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { useSettings } from "@/src/contexts/settings";

import { formatPercent } from "@/src/utils/format";

import { BigNumericInput } from "../BigNumericInput";
import { Drop } from "../Drop";
import { Module } from "../Module";
import { Switch } from "../Switch";

interface Props {
  className?: string;
}

export const Settings: React.FC<Props> = ({ className }: Props) => {
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
      >
        <Module className="px-4 py-2 rounded-2xl bg-[#303030] gap-2 flex flex-col">
          <SettingsInner />
        </Module>
      </Drop>
      <button
        className={clsx(className, "items-center gap-2")}
        ref={setTargetRef}
        onClick={() => setShow(true)}
      >
        <p className="text-white">Settings </p>
        <IoIosArrowDown className="text-white opacity-80" />
      </button>
    </>
  );
};

export const SettingsInner: React.FC = () => {
  const settings = useSettings();

  const [inputDeadline, setInputDeadline] = useState("");
  const [inputSlippage, setInputSlippage] = useState("");

  const [showDeadline, setShowDeadline] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);

  return (
    <>
      <div className="flex flex-col w-full gap-2">
        <div className="flex items-center justify-between w-full">
          <p className="pr-8 text-white opacity-80 ">Transaction Deadline</p>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#4f4f4f] border-[#505050] border py-1 text-white w-16  flex justify-center">
              {settings.timeout} Mins
            </div>
            <IoIosArrowDown
              className="text-white opacity-80"
              onClick={() => setShowDeadline(!showDeadline)}
            />
          </div>
        </div>
        {showDeadline && (
          <div className="flex items-center gap-2">
            <BigNumericInput
              className="w-full px-1 text-lg text-right rounded-lg"
              placeholder={settings.timeout.toString()}
              inputMode="numeric"
              autoComplete="off"
              disabled={false}
              value={inputDeadline}
              onChange={(val: string) => setInputDeadline(val)}
            />
            <button
              onClick={() => {
                if (!Number.isNaN(parseInt(inputDeadline))) {
                  settings.setTimeout(parseInt(inputDeadline));
                }
                setInputDeadline("");
              }}
              className="bg-[#4f4f4f] border-[#505050] border py-1 text-white rounded-xl px-2"
            >
              Set
            </button>
          </div>
        )}
      </div>
      <div className="border-b border-[#505050] w-full" />
      <div className="flex flex-col w-full gap-2">
        <div className="flex items-center justify-between w-full gap-1">
          <div className="flex justify-start text-white opacity-80">
            Allowed Slippage
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#4f4f4f] border-[#505050] border px-2 py-1 text-white w-16  flex justify-center">
              {formatPercent(settings.maxSlippagePercent)}
            </div>
            <IoIosArrowDown
              className="text-white opacity-80"
              onClick={() => setShowSlippage(!showSlippage)}
            />
          </div>
        </div>
        {showSlippage && (
          <div className="flex items-center gap-1">
            <BigNumericInput
              className="w-full px-1 text-lg text-right rounded-lg"
              placeholder={settings.maxSlippagePercent.toFixed(2)}
              inputMode="numeric"
              autoComplete="off"
              disabled={false}
              value={inputSlippage}
              onChange={(val: string) => setInputSlippage(val)}
            />
            <button
              onClick={() => {
                if (!Number.isNaN(parseFloat(inputSlippage))) {
                  settings.setMaxSlippagePercent(
                    new Percent(
                      (parseFloat(inputSlippage) * 100).toFixed(0),
                      10000
                    )
                  );
                }
                setInputSlippage("");
              }}
              className="bg-[#4f4f4f] border-[#505050] border py-1 text-white rounded-xl px-2"
            >
              Set
            </button>
          </div>
        )}
      </div>
      <div className="border-b border-[#505050] w-full" />
      <div className="flex items-center justify-between w-full gap-1">
        <div className="text-white opacity-80">Infinite Approval</div>
        <div className="">
          <Switch
            selected={settings.infiniteApprove}
            onSelect={settings.setInfiniteApprove}
          />
        </div>
      </div>
    </>
  );
};
