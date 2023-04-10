import Link from "next/link";
import { useState } from "react";
import { IoIosArrowDown, IoIosMore } from "react-icons/io";

import { MoreInner } from "@/src/components/Header/MoreInfo";
import { SettingsInner } from "@/src/components/Header/Settings";

import { Drop } from "../Drop";
import { Module } from "../Module";

export const More: React.FC = () => {
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  const [showMore, setShowMore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
        className="w-full px-4"
      >
        <Module className="px-4 py-2 gap-2 rounded-2xl bg-[#303030] w-full md:hidden flex flex-col">
          <Link
            className="w-full text-white hover:opacity-80"
            href="/trade/"
            onClick={() => setShow(false)}
          >
            <p>Trade</p>
          </Link>
          <div className="border-b border-[#505050] w-full" />

          <Link
            className="w-full text-white hover:opacity-80"
            href="/earn/"
            onClick={() => setShow(false)}
          >
            <p>Earn</p>
          </Link>
          <div className="border-b border-[#505050] w-full" />

          <div className="flex flex-col w-full gap-2 ">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowMore(!showMore)}
            >
              <p className="text-white">More</p>
              <IoIosArrowDown className="text-white -rotate-90 opacity-80" />
            </button>
            {showMore && <MoreInner />}
          </div>
          <div className="border-b border-[#505050] w-full" />

          <div className="flex flex-col w-full gap-2 ">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowSettings(!showSettings)}
            >
              <p className="text-white">Settings</p>
              <IoIosArrowDown className="text-white -rotate-90 opacity-80" />
            </button>
            {showSettings && <SettingsInner />}
          </div>
        </Module>
      </Drop>
      <button
        className="p-1.5 bg-[#4f4f4f] rounded-xl text-white  md:hidden"
        ref={setTargetRef}
        onClick={() => setShow(true)}
      >
        <IoIosMore className="w-[30px] h-[30px]" />
      </button>
    </>
  );
};
