import { clsx } from "clsx";
import Image from "next/image";
interface Props {
  className?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ className }: Props) => (
  <Image
    src="/numoen.png"
    alt="Loading"
    className={clsx(
      className,
      "w-4 h-4 duration-1000 transform animate-ping opacity-20"
    )}
  />
);
