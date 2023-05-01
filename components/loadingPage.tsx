import LoadingSpinner from "./loadingSpinner";
import { clsx } from "clsx";

export default function LoadingPage({ className }: { className?: string }) {
  return (
    <div
      className={clsx(className, "flex h-[70vh] items-center justify-center")}
    >
      <LoadingSpinner height={80} width={80} />
    </div>
  );
}
