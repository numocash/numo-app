import SettingsInner from "./settingsInner";
import Popover from "@/components/core/popover";
import { IoIosArrowDown } from "react-icons/io";

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
          <SettingsInner />
        </div>
      }
    />
  );
}
