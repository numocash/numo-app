import Button from "@/components/core/button";
import Disclosure from "@/components/core/disclosure";
import NumberInput from "@/components/core/numberInput";
import Switch from "@/components/core/switch";
import { useSettings } from "@/contexts/settings";
import { fractionToFloat } from "@/utils/format";
import { Percent } from "@uniswap/sdk-core";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function SettingsInner() {
  const [deadlineInput, setDeadlineInput] = useState("");
  const [slippageInput, setSlippageInput] = useState("");

  const {
    timeout,
    setTimeout,
    infiniteApprove,
    setInfiniteApprove,
    maxSlippagePercent,
    setMaxSlippagePercent,
  } = useSettings();
  return (
    <>
      <Disclosure
        as="div"
        className={"grid gap-2 p-1"}
        button={
          <div className="flex w-full items-center justify-between gap-2 rounded-xl hover:opacity-80">
            <p className="p2 text-white">Tx deadline</p>
            <IoIosArrowDown className=" fill-white" />
          </div>
        }
        contents={
          <div className="flex w-full items-center gap-2">
            <NumberInput
              onChange={setDeadlineInput}
              integerOnly={false}
              value={deadlineInput}
              placeholder={timeout.toString()}
            />
            <Button
              variant="primary"
              className="bg-gray-700 py-1.5"
              onClick={() => {
                if (!Number.isNaN(parseInt(deadlineInput))) {
                  setTimeout(parseInt(deadlineInput));
                }
                setDeadlineInput("");
              }}
            >
              Set
            </Button>
          </div>
        }
      />
      <div className="mx-2 border-b border-gray-700" />
      <Disclosure
        as="div"
        className={"grid gap-2 p-1"}
        button={
          <div className="flex w-full items-center justify-between gap-2 rounded-xl hover:opacity-80">
            <p className="p2 text-white">Max slippage</p>
            <IoIosArrowDown className=" fill-white" />
          </div>
        }
        contents={
          <div className="flex w-full items-center gap-2">
            <NumberInput
              onChange={setSlippageInput}
              integerOnly={false}
              value={slippageInput}
              placeholder={fractionToFloat(
                maxSlippagePercent.asFraction.multiply(100),
              ).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            />
            <Button
              variant="primary"
              className="bg-gray-700 py-1.5"
              onClick={() => {
                if (!Number.isNaN(parseFloat(slippageInput))) {
                  setMaxSlippagePercent(
                    new Percent(
                      (parseFloat(slippageInput) * 100).toFixed(0),
                      10000,
                    ),
                  );
                }
                setSlippageInput("");
              }}
            >
              Set
            </Button>
          </div>
        }
      />
      <div className="mx-2 border-b border-gray-700" />
      <div className="flex w-full items-center justify-between p-2 py-2">
        <p className="p2 text-white">Infinite approval</p>
        <Switch enabled={infiniteApprove} setEnabled={setInfiniteApprove} />
      </div>
    </>
  );
}
