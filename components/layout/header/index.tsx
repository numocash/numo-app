import Image from "next/image";
import Link from "next/link";

import ConnectButton from "./connectButton";
import More from "./more";
import Settings from "./settings";

export default function Header() {
  return (
    <div className="fixed top-4 z-10 flex w-full justify-center px-8 sm:px-10">
      <div className="flex w-full max-w-xl items-center justify-between rounded-2xl bg-gray-900 p-1">
        <NumoenIcon />
        <Link
          className="hidden rounded-xl px-2 py-1 hover:opacity-80 sm:flex"
          href="/"
        >
          <p className="p2 text-white">Earn</p>
        </Link>
        <Link
          className="hidden rounded-xl px-2 py-1 hover:opacity-80 sm:flex"
          href="/"
        >
          <p className="p2 text-white">Positions</p>
        </Link>
        <More />
        <Settings />
        {/* <div className="flex items-center gap-1 sm:gap-0">
          <Link href="https://app.numoen.com" className="">
            <Button variant="primary" className="bg-gray-800">
              Launch App
            </Button>
          </Link>
          <Menu />
        </div> */}
        <ConnectButton />
      </div>
    </div>
  );
}

const NumoenIcon: React.FC = () => {
  return (
    <div className="h-10 w-10 rounded-xl bg-white p-1.5">
      <Image
        src="/numoen.svg"
        alt="Numoen Logo"
        width={30}
        height={30}
        priority
      />
    </div>
  );
};
