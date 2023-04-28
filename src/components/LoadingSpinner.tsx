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
      "h-4 w-4 transform animate-ping opacity-20 duration-1000"
    )}
  />
);
