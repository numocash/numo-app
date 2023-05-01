import { clsx } from "clsx";

interface Props {
  className?: string;
}

export default function LoadingBox({ className }: Props) {
  return (
    <div
      className={clsx(
        className,
        "h-6 w-12 transform animate-pulse rounded-lg bg-gray-100 duration-300 ease-in-out",
      )}
    />
  );
}
