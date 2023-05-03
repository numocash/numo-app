import { clsx } from "clsx";
import Image from "next/image";

export default function LoadingSpinner({
  height = 20,
  width = 20,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "alt">) {
  return (
    <Image
      {...props}
      className={clsx(className, "spinner")}
      src="/numoen.png"
      alt="spin"
      height={height}
      width={width}
    />
  );
}
