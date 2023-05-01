import { clsx } from "clsx";
import Link from "next/link";

export default function EarnCard({
  children,
  to,
  className,
  ...props
}: { to: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Link href={to}>
      <div
        className={clsx(
          className,
          "flex h-[320px] w-full transform cursor-pointer flex-col overflow-clip rounded-xl border-2 bg-white duration-300 sm:hover:scale-105",
        )}
        {...props}
      >
        {children}
      </div>
    </Link>
  );
}
