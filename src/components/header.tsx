import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="fixed z-10 flex justify-center w-full px-6 top-4">
      <div className="justify-between bg-[#303030] rounded-2xl max-w-lg  w-full flex items-center p-1 ">
        <NumoenIcon />
        <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/trade/"
        >
          <p>Blog</p>
        </Link>
        <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/earn/"
        >
          <p>Developers</p>
        </Link>
        {/* <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/earn/"
        >
          <p>Community</p>
        </Link> */}
        <Link
          className="hidden text-white hover:opacity-80 md:flex"
          href="/earn/"
        >
          <p>Resources</p>
        </Link>
        <a className="bg-[#4f4f4f] rounded-xl items-center px-4 h-10 grid">
          <p className="font-semibold text-white">Launch App</p>
        </a>
      </div>
    </div>
  );
}

const NumoenIcon: React.FC = () => {
  return (
    <div className="p-1.5 bg-white rounded-xl">
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
