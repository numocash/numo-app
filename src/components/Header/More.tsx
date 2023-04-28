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
        <Module className="flex w-full flex-col gap-2 rounded-2xl bg-[#303030] px-4 py-2 md:hidden">
          <Link
            className="w-full text-white hover:opacity-80"
            href="/trade/"
            onClick={() => setShow(false)}
          >
            <p>Trade</p>
          </Link>
          <div className="w-full border-b border-[#505050]" />

          <Link
            className="w-full text-white hover:opacity-80"
            href="/earn/"
            onClick={() => setShow(false)}
          >
            <p>Earn</p>
          </Link>
          <div className="w-full border-b border-[#505050]" />

          <div className="flex w-full flex-col gap-2 ">
            <button
              className="flex w-full items-center justify-between"
              onClick={() => setShowMore(!showMore)}
            >
              <p className="text-white">More</p>
              <IoIosArrowDown className="-rotate-90 text-white opacity-80" />
            </button>
            {showMore && <MoreInner />}
          </div>
          <div className="w-full border-b border-[#505050]" />

          <div className="flex w-full flex-col gap-2 ">
            <button
              className="flex w-full items-center justify-between"
              onClick={() => setShowSettings(!showSettings)}
            >
              <p className="text-white">Settings</p>
              <IoIosArrowDown className="-rotate-90 text-white opacity-80" />
            </button>
            {showSettings && <SettingsInner />}
          </div>
        </Module>
      </Drop>
      <button
        className="rounded-xl bg-[#4f4f4f] p-1.5 text-white  md:hidden"
        ref={setTargetRef}
        onClick={() => setShow(true)}
      >
        <IoIosMore className="h-[30px] w-[30px]" />
      </button>
    </>
  );
};
