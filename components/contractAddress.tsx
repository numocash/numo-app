import { Address } from "abitype";
import Link from "next/link";
import { useNetwork } from "wagmi";

export default function ContractAddress({ address }: { address: Address }) {
  const { chain } = useNetwork();
  return (
    <Link
      href={`${
        chain?.blockExplorers?.default.url ?? "https://arbiscan.io"
      }/address/${address}`}
      rel="noopener noreferrer"
      target="_blank"
      className={"p4 text-[#3b82f6] flex"}
    >
      {address}
    </Link>
  );
}
