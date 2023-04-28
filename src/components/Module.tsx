import { clsx } from "clsx";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Module: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "w-full overflow-hidden rounded-xl bg-white p-6 shadow-2xl"
      )}
    >
      <ErrorBoundary
        fallback={
          <p className="text-red">
            An error occurred while loading this component.
          </p>
        }
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};
