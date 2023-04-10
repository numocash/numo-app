import Image from "next/image";
import Link from "next/link";
import React from "react";

import { ConnectButton } from "@/src/components/Header/ConnectButton";
import { More } from "@/src/components/Header/More";
import { MoreInfo } from "@/src/components/Header/MoreInfo";
import { Settings } from "@/src/components/Header/Settings";

export const Header: React.FC = () => {
  return (
    <div className="fixed z-10 flex justify-center w-full px-6 top-4">
      <div className="justify-between bg-[#303030] rounded-2xl max-w-xl  w-full flex items-center p-1">
        <NumoenIcon />
        <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/trade/"
        >
          <p>Trade</p>
        </Link>
        <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/earn/"
        >
          <p>Earn</p>
        </Link>

        <Settings className="hidden md:flex" />
        <MoreInfo className="hidden md:flex" />
        <div className="flex items-center gap-1">
          <ConnectButton />
          <More />
        </div>
      </div>
    </div>
  );
};

const NumoenIcon: React.FC = () => {
  return (
    <div className="p-1.5 bg-white rounded-xl">
      <Image src="/numoen.png" alt="Numoen Logo" width={30} height={30} />
    </div>
  );
};
