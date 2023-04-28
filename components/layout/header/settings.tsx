import { IoIosArrowDown } from "react-icons/io";

import Disclosure from "@/components/core/disclosure";
import Popover from "@/components/core/popover";
import Switch from "@/components/core/switch";

export default function Settings() {
  return (
    <Popover
      placement="bottom-start"
      className="hidden sm:flex"
      button={
        <div className="flex items-center gap-2 px-2 py-1 hover:opacity-80">
          <p className="p2 text-white">Settings</p>
          <IoIosArrowDown className="transform fill-white duration-300 ui-open:-rotate-180" />
        </div>
      }
      contents={
        <div className="flex w-[250px] flex-col rounded-xl bg-gray-900 p-1">
          <Disclosure
            button={
              <div className="flex w-full items-center justify-between gap-2 px-2 py-2 hover:opacity-80">
                <p className="p2 text-white">Tx deadline</p>
                <IoIosArrowDown className=" fill-white" />
              </div>
            }
          />
          <div className="mx-2  border-b border-gray-700" />
          <div className="flex w-full items-center justify-between p-2 py-2">
            <p className="p2 text-white">Infinite approval</p>
            <Switch />
          </div>
        </div>
      }
    />
  );
}
